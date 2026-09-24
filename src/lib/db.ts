import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  AcademicHoliday,
  AttendanceCorrectionRequest,
  AttendanceRecord,
  AttendanceSession,
  AttendanceStatus,
  AuditLog,
  Branch,
  CollegeSettings,
  Division,
  LeaveApplication,
  Lecture,
  Notification,
  Room,
  Subject,
  User,
  UserRole,
} from './types';
import {
  initialAttendanceCorrections,
  initialAttendanceRecords,
  initialAttendanceSessions,
  initialAuditLogs,
  initialBranches,
  initialDivisions,
  initialHolidays,
  initialLeaveApplications,
  initialLectures,
  initialNotifications,
  initialRooms,
  initialSettings,
  initialSubjects,
  initialUsers,
} from './initialData';

export interface DatabaseSchema {
  settings: CollegeSettings;
  branches: Branch[];
  divisions: Division[];
  rooms: Room[];
  users: User[];
  subjects: Subject[];
  lectures: Lecture[];
  attendanceSessions: AttendanceSession[];
  attendanceRecords: AttendanceRecord[];
  leaveApplications: LeaveApplication[];
  attendanceCorrections: AttendanceCorrectionRequest[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  holidays: AcademicHoliday[];
}

// In serverless environments (e.g. Vercel / AWS Lambda), the filesystem is read-only
// except in os.tmpdir() (/tmp). We detect serverless and use tmpdir for writing.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
const DB_DIR = isServerless ? path.join(os.tmpdir(), 'nexus-campus-data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'campus_db.json');

// Global in-memory cached database across warm serverless invocations
declare global {
  var __nexusCampusDb: DatabaseSchema | undefined;
  var __nexusFirestoreSynced: boolean | undefined;
}

function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        res[k] = sanitizeForFirestore(v);
      }
    }
    return res;
  }
  return obj;
}

export async function persistDocToFirestore(collection: string, docId: string, data: any): Promise<void> {
  try {
    const { adminDb } = await import('./firebaseAdmin');
    await adminDb.collection(collection).doc(docId).set(sanitizeForFirestore(data), { merge: true });
  } catch (err) {
    // Non-blocking warning so offline / development without internet still functions smoothly
    console.warn(`Firestore sync notice (${collection}/${docId}):`, err);
  }
}

export async function deleteDocFromFirestore(collection: string, docId: string): Promise<void> {
  try {
    const { adminDb } = await import('./firebaseAdmin');
    await adminDb.collection(collection).doc(docId).delete();
  } catch (err) {
    console.warn(`Firestore delete notice (${collection}/${docId}):`, err);
  }
}

function ensureDbFile(): DatabaseSchema {
  if (globalThis.__nexusCampusDb) {
    return globalThis.__nexusCampusDb;
  }

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      globalThis.__nexusCampusDb = JSON.parse(fileData);
      return globalThis.__nexusCampusDb!;
    }
  } catch (err) {
    console.warn('Campus database read from disk notice (falling back to memory):', err);
  }

  // Seed default data
  const defaultDb: DatabaseSchema = {
    settings: { ...initialSettings },
    branches: [...initialBranches],
    divisions: [...initialDivisions],
    rooms: [...initialRooms],
    users: [...initialUsers],
    subjects: [...initialSubjects],
    lectures: [...initialLectures],
    attendanceSessions: [...initialAttendanceSessions],
    attendanceRecords: [...initialAttendanceRecords],
    leaveApplications: [...initialLeaveApplications],
    attendanceCorrections: [...initialAttendanceCorrections],
    notifications: [...initialNotifications],
    auditLogs: [...initialAuditLogs],
    holidays: [...initialHolidays],
  };

  saveDb(defaultDb);
  globalThis.__nexusCampusDb = defaultDb;
  return globalThis.__nexusCampusDb;
}

function saveDb(data: DatabaseSchema): void {
  globalThis.__nexusCampusDb = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // If disk write fails in restrictive serverless, state is still safely preserved in globalThis memory
    console.warn('Campus database disk write skipped in serverless environment:', err);
  }
}

// Time overlap helper: "10:00" to "11:00" vs "10:30" to "11:30"
function doTimesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}


export const campusDb = {
  reset(): DatabaseSchema {
    const defaultDb: DatabaseSchema = {
      settings: { ...initialSettings },
      branches: [...initialBranches],
      divisions: [...initialDivisions],
      rooms: [...initialRooms],
      users: [...initialUsers],
      subjects: [...initialSubjects],
      lectures: [...initialLectures],
      attendanceSessions: [
        {
          id: 'session_active_math_today',
          lectureId: 'LEC-2026-09-24-CS-3A-MATH-02',
          professorId: 'prof_1',
          sessionToken: 'NEXUS-TOKEN-MATH-7729-ALPHA',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 120 * 1000).toISOString(),
          status: 'active',
          requireWifi: true,
          allowedWifiSsid: 'Campus_AITS_Secure_5G',
        },
      ],
      attendanceRecords: [...initialAttendanceRecords],
      leaveApplications: [...initialLeaveApplications],
      attendanceCorrections: [...initialAttendanceCorrections],
      notifications: [...initialNotifications],
      auditLogs: [...initialAuditLogs],
      holidays: [...initialHolidays],
    };
    saveDb(defaultDb);
    return defaultDb;
  },

  // SETTINGS
  getSettings(): CollegeSettings {
    const db = ensureDbFile();
    return db.settings;
  },

  updateSettings(settingsUpdate: Partial<CollegeSettings>, actor: { id: string; name: string; role: UserRole }): CollegeSettings {
    const db = ensureDbFile();
    db.settings = { ...db.settings, ...settingsUpdate };

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'UPDATE_COLLEGE_SETTINGS',
      entity: 'CollegeSettings',
      entityId: 'global_settings',
      details: `Updated settings: ${Object.keys(settingsUpdate).join(', ')}`,
    });

    saveDb(db);
    return db.settings;
  },

  // USERS
  getUsers(role?: UserRole): User[] {
    const db = ensureDbFile();
    if (role) {
      return db.users.filter((u) => u.role === role);
    }
    return db.users;
  },

  getUserById(id: string): User | undefined {
    const db = ensureDbFile();
    return db.users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    const db = ensureDbFile();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getUserByEnrollment(enrollmentNo: string): User | undefined {
    const db = ensureDbFile();
    return db.users.find((u) => u.enrollmentNo?.toUpperCase() === enrollmentNo.toUpperCase());
  },

  createUser(user: User): User {
    const db = ensureDbFile();
    db.users.push(user);
    saveDb(db);
    return user;
  },

  // METADATA
  getBranches(): Branch[] {
    return ensureDbFile().branches;
  },

  getDivisions(): Division[] {
    return ensureDbFile().divisions;
  },

  getRooms(): Room[] {
    return ensureDbFile().rooms;
  },

  getSubjects(): Subject[] {
    return ensureDbFile().subjects;
  },

  getHolidays(): AcademicHoliday[] {
    return ensureDbFile().holidays;
  },

  // CONFLICT DETECTION ENGINE
  checkTimetableConflict(candidate: {
    date: string;
    startTime: string;
    endTime: string;
    professorId: string;
    roomId: string;
    branchId: string;
    semester: number;
    division: string;
    ignoreLectureId?: string;
  }): { hasConflict: boolean; message?: string; conflictType?: 'professor' | 'room' | 'division'; conflictingLecture?: Lecture } {
    const db = ensureDbFile();

    const sameDayLectures = db.lectures.filter(
      (l) => l.date === candidate.date && l.status !== 'cancelled' && l.id !== candidate.ignoreLectureId
    );

    for (const lec of sameDayLectures) {
      // Check time overlap
      if (doTimesOverlap(candidate.startTime, candidate.endTime, lec.startTime, lec.endTime)) {
        // 1. Professor Conflict
        if (lec.professorId === candidate.professorId) {
          const prof = db.users.find((u) => u.id === candidate.professorId);
          const subj = db.subjects.find((s) => s.id === lec.subjectId);
          return {
            hasConflict: true,
            conflictType: 'professor',
            message: `Conflict: ${prof?.name || 'Professor'} is already assigned to ${subj?.name || 'another class'} from ${lec.startTime} to ${lec.endTime}.`,
            conflictingLecture: lec,
          };
        }

        // 2. Room Conflict
        if (lec.roomId === candidate.roomId) {
          const room = db.rooms.find((r) => r.id === candidate.roomId);
          const subj = db.subjects.find((s) => s.id === lec.subjectId);
          return {
            hasConflict: true,
            conflictType: 'room',
            message: `Room Conflict: ${room?.code || 'Room'} is already booked by ${subj?.name || 'another lecture'} during ${lec.startTime} - ${lec.endTime}.`,
            conflictingLecture: lec,
          };
        }

        // 3. Division Conflict
        if (
          lec.branchId === candidate.branchId &&
          lec.semester === candidate.semester &&
          lec.division === candidate.division
        ) {
          const subj = db.subjects.find((s) => s.id === lec.subjectId);
          return {
            hasConflict: true,
            conflictType: 'division',
            message: `Division Conflict: Division ${candidate.division} (Sem ${candidate.semester}) already has "${subj?.name}" scheduled from ${lec.startTime} to ${lec.endTime}.`,
            conflictingLecture: lec,
          };
        }
      }
    }

    return { hasConflict: false };
  },

  // LECTURES
  getLectures(filters?: {
    date?: string;
    branchId?: string;
    semester?: number;
    division?: string;
    professorId?: string;
    subjectId?: string;
  }): Lecture[] {
    const db = ensureDbFile();
    let result = db.lectures;

    if (filters?.date) {
      result = result.filter((l) => l.date === filters.date);
    }
    if (filters?.branchId) {
      result = result.filter((l) => l.branchId === filters.branchId);
    }
    if (filters?.semester !== undefined) {
      result = result.filter((l) => l.semester === filters.semester);
    }
    if (filters?.division) {
      result = result.filter((l) => l.division === filters.division);
    }
    if (filters?.professorId) {
      result = result.filter((l) => l.professorId === filters.professorId || l.substituteProfessorId === filters.professorId);
    }
    if (filters?.subjectId) {
      result = result.filter((l) => l.subjectId === filters.subjectId);
    }

    return result.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.startTime.localeCompare(b.startTime);
    });
  },

  getLectureById(id: string): Lecture | undefined {
    const db = ensureDbFile();
    return db.lectures.find((l) => l.id === id);
  },

  createLecture(
    lecture: Omit<Lecture, 'id'>,
    actor: { id: string; name: string; role: UserRole }
  ): { success: boolean; lecture?: Lecture; error?: string } {
    const db = ensureDbFile();

    // Check conflict
    const conflict = this.checkTimetableConflict(lecture);
    if (conflict.hasConflict) {
      return { success: false, error: conflict.message };
    }

    // Generate permanent ID: LEC-YYYY-MM-DD-BR-SEM-DIV-SUBJ-INDEX
    const subj = db.subjects.find((s) => s.id === lecture.subjectId);
    const subjCode = (subj?.code || 'GEN').replace(/[^a-zA-Z0-9]/g, '');
    const id = `LEC-${lecture.date}-${lecture.branchId.replace('branch_', '').toUpperCase()}-${lecture.semester}${lecture.division}-${subjCode}-${Math.floor(100 + Math.random() * 900)}`;

    const newLecture: Lecture = {
      ...lecture,
      id,
    };

    db.lectures.push(newLecture);

    // Audit Log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'CREATE_LECTURE',
      entity: 'Lecture',
      entityId: id,
      details: `Scheduled ${subj?.name || 'Lecture'} on ${lecture.date} (${lecture.startTime}-${lecture.endTime}) in Room ${lecture.roomId}`,
    });

    // Notify affected students
    const affectedStudents = db.users.filter(
      (u) =>
        u.role === 'student' &&
        u.branchId === lecture.branchId &&
        u.semester === lecture.semester &&
        u.division === lecture.division
    );

    affectedStudents.forEach((stud) => {
      db.notifications.unshift({
        id: `notif-${Date.now()}-${stud.id}`,
        userId: stud.id,
        role: 'student',
        title: 'New Class Scheduled',
        message: `${subj?.name} has been added to your timetable for ${lecture.date} at ${lecture.startTime}.`,
        type: 'timetable',
        read: false,
        link: '/student/timetable',
        createdAt: new Date().toISOString(),
      });
    });

    saveDb(db);
    return { success: true, lecture: newLecture };
  },

  updateLecture(
    id: string,
    updates: Partial<Lecture>,
    actor: { id: string; name: string; role: UserRole }
  ): { success: boolean; lecture?: Lecture; error?: string } {
    const db = ensureDbFile();
    const index = db.lectures.findIndex((l) => l.id === id);
    if (index === -1) {
      return { success: false, error: 'Lecture not found' };
    }

    const current = db.lectures[index];
    const candidate = {
      date: updates.date || current.date,
      startTime: updates.startTime || current.startTime,
      endTime: updates.endTime || current.endTime,
      professorId: updates.professorId || current.professorId,
      roomId: updates.roomId || current.roomId,
      branchId: updates.branchId || current.branchId,
      semester: updates.semester !== undefined ? updates.semester : current.semester,
      division: updates.division || current.division,
      ignoreLectureId: id,
    };

    if (updates.date || updates.startTime || updates.endTime || updates.roomId || updates.professorId) {
      const conflict = this.checkTimetableConflict(candidate);
      if (conflict.hasConflict) {
        return { success: false, error: conflict.message };
      }
    }

    const updated: Lecture = { ...current, ...updates };
    db.lectures[index] = updated;

    const subj = db.subjects.find((s) => s.id === updated.subjectId);

    // Audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'UPDATE_LECTURE',
      entity: 'Lecture',
      entityId: id,
      details: `Modified lecture "${subj?.name}": status ${updated.status}, timing ${updated.startTime}-${updated.endTime}`,
    });

    // Notify affected students
    const affectedStudents = db.users.filter(
      (u) =>
        u.role === 'student' &&
        u.branchId === updated.branchId &&
        u.semester === updated.semester &&
        u.division === updated.division
    );

    const changeDescription = updates.status === 'cancelled'
      ? `cancelled for ${updated.date}`
      : `updated: ${updated.startTime} - ${updated.endTime} (Room: ${updated.roomId})`;

    affectedStudents.forEach((stud) => {
      db.notifications.unshift({
        id: `notif-${Date.now()}-${stud.id}`,
        userId: stud.id,
        role: 'student',
        title: updates.status === 'cancelled' ? 'Lecture Cancelled' : 'Timetable Modified',
        message: `${subj?.name} has been ${changeDescription}.`,
        type: 'timetable',
        read: false,
        link: '/student/timetable',
        createdAt: new Date().toISOString(),
      });
    });

    saveDb(db);
    return { success: true, lecture: updated };
  },

  deleteLecture(id: string, actor: { id: string; name: string; role: UserRole }): boolean {
    const db = ensureDbFile();
    const lec = db.lectures.find((l) => l.id === id);
    if (!lec) return false;

    db.lectures = db.lectures.filter((l) => l.id !== id);

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'DELETE_LECTURE',
      entity: 'Lecture',
      entityId: id,
      details: `Removed lecture ${id} from timetable`,
    });

    saveDb(db);
    return true;
  },

  // QR ATTENDANCE SESSIONS (2-minute expiration)
  createAttendanceSession(
    lectureId: string,
    professorId: string,
    options?: { requireWifi?: boolean; allowedWifiSsid?: string }
  ): { success: boolean; session?: AttendanceSession; error?: string } {
    const db = ensureDbFile();
    const lecture = db.lectures.find((l) => l.id === lectureId);
    if (!lecture) {
      return { success: false, error: 'Lecture not found' };
    }

    // Expire any existing active sessions for this lecture
    db.attendanceSessions.forEach((s) => {
      if (s.lectureId === lectureId && s.status === 'active') {
        s.status = 'expired';
      }
    });

    const now = new Date();
    const ttlSeconds = db.settings.qrExpirySeconds || 120;
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

    // Generate cryptographic-style session token with timestamp and randomized entropy
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const sessionToken = `NEXUS-${lecture.branchId.toUpperCase()}-${Math.floor(Date.now() / 1000)}-${randomHex}`;

    const newSession: AttendanceSession = {
      id: `sess-${Date.now()}-${randomHex}`,
      lectureId,
      professorId,
      sessionToken,
      createdAt: now.toISOString(),
      expiresAt,
      status: 'active',
      requireWifi: options?.requireWifi ?? db.settings.allowWifiRestriction,
      allowedWifiSsid: options?.allowedWifiSsid ?? db.settings.collegeWifiSsid,
    };

    db.attendanceSessions.unshift(newSession);

    // Audit Log
    const prof = db.users.find((u) => u.id === professorId);
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: now.toISOString(),
      actorId: professorId,
      actorName: prof?.name || 'Professor',
      actorRole: 'professor',
      action: 'START_QR_SESSION',
      entity: 'AttendanceSession',
      entityId: newSession.id,
      details: `Generated live QR attendance session for lecture ${lectureId} (TTL: ${ttlSeconds}s)`,
    });

    saveDb(db);
    return { success: true, session: newSession };
  },

  getActiveSessionForLecture(lectureId: string): AttendanceSession | undefined {
    const db = ensureDbFile();
    const session = db.attendanceSessions.find((s) => s.lectureId === lectureId && s.status === 'active');
    if (!session) return undefined;

    // Check expiration on read
    const now = new Date();
    const expiry = new Date(session.expiresAt);
    if (now > expiry) {
      session.status = 'expired';
      saveDb(db);
      return undefined;
    }
    return session;
  },

  getSessionById(sessionId: string): AttendanceSession | undefined {
    const db = ensureDbFile();
    return db.attendanceSessions.find((s) => s.id === sessionId);
  },

  expireSession(sessionId: string): boolean {
    const db = ensureDbFile();
    const session = db.attendanceSessions.find((s) => s.id === sessionId);
    if (!session) return false;
    session.status = 'expired';
    saveDb(db);
    return true;
  },

  // SUBMIT & VALIDATE QR ATTENDANCE
  submitQrAttendance(
    studentId: string,
    sessionToken: string,
    clientContext?: { wifiSsid?: string; deviceInfo?: string }
  ): {
    success: boolean;
    record?: AttendanceRecord;
    error?: string;
    details?: { lectureTopic?: string; subjectName?: string; time?: string };
  } {
    const db = ensureDbFile();

    // 1. Validate student
    const student = db.users.find((u) => u.id === studentId && u.role === 'student');
    if (!student) {
      return { success: false, error: 'Student record not found or unauthorized' };
    }

    // 2. Find active session matching token
    const session = db.attendanceSessions.find((s) => s.sessionToken === sessionToken);
    if (!session) {
      return { success: false, error: 'Invalid or unrecognized QR token' };
    }

    // 3. Validate expiration
    const now = new Date();
    const expiryTime = new Date(session.expiresAt);
    if (now > expiryTime || session.status !== 'active') {
      session.status = 'expired';
      saveDb(db);
      return { success: false, error: 'This QR attendance session has expired. Request faculty for a refreshed QR.' };
    }

    // 4. Validate Lecture
    const lecture = db.lectures.find((l) => l.id === session.lectureId);
    if (!lecture) {
      return { success: false, error: 'Associated lecture session could not be located.' };
    }

    // 5. Validate student enrollment (Branch, Semester, Division)
    if (
      student.branchId !== lecture.branchId ||
      student.semester !== lecture.semester ||
      student.division !== lecture.division
    ) {
      return {
        success: false,
        error: `Enrollment mismatch: This lecture is for ${lecture.branchId.toUpperCase()} Sem ${lecture.semester} Div ${lecture.division}, but you are registered in ${student.branchId?.toUpperCase()} Sem ${student.semester} Div ${student.division}.`,
      };
    }

    // 6. Check duplicate attendance
    const existingRecord = db.attendanceRecords.find(
      (r) => r.lectureId === lecture.id && r.studentId === student.id
    );
    if (existingRecord) {
      if (existingRecord.status === 'present') {
        return {
          success: false,
          error: 'Attendance already recorded for this lecture! Multiple submissions are blocked.',
        };
      }
    }

    // 7. Optional Wi-Fi safeguard verification
    if (session.requireWifi && session.allowedWifiSsid && clientContext?.wifiSsid) {
      if (clientContext.wifiSsid !== session.allowedWifiSsid) {
        return {
          success: false,
          error: `Network validation failed: Device must be connected to authorized campus Wi-Fi "${session.allowedWifiSsid}".`,
        };
      }
    }

    // 8. Record attendance
    const recordId = existingRecord ? existingRecord.id : `att-rec-${lecture.id}-${student.id}`;
    const newRecord: AttendanceRecord = {
      id: recordId,
      lectureId: lecture.id,
      studentId: student.id,
      status: 'present',
      markedAt: now.toISOString(),
      markedBy: 'qr',
      deviceInfo: clientContext?.deviceInfo || 'Web QR Scanner',
    };

    if (existingRecord) {
      const idx = db.attendanceRecords.findIndex((r) => r.id === existingRecord.id);
      db.attendanceRecords[idx] = newRecord;
    } else {
      db.attendanceRecords.push(newRecord);
    }

    // If lecture was scheduled, update to conducted
    if (lecture.status === 'scheduled') {
      lecture.status = 'conducted';
    }

    // Student notification
    const subj = db.subjects.find((s) => s.id === lecture.subjectId);
    db.notifications.unshift({
      id: `notif-${Date.now()}-${student.id}`,
      userId: student.id,
      role: 'student',
      title: 'Attendance Confirmed ✓',
      message: `Marked PRESENT for ${subj?.name || 'Class'} (${lecture.startTime}-${lecture.endTime}).`,
      type: 'attendance',
      read: false,
      link: '/student/attendance',
      createdAt: now.toISOString(),
    });

    saveDb(db);

    return {
      success: true,
      record: newRecord,
      details: {
        subjectName: subj?.name,
        lectureTopic: lecture.topic,
        time: `${lecture.startTime} - ${lecture.endTime}`,
      },
    };
  },

  // ATTENDANCE RECORDS
  getAttendanceRecords(filters?: { lectureId?: string; studentId?: string }): AttendanceRecord[] {
    const db = ensureDbFile();
    let records = db.attendanceRecords;
    if (filters?.lectureId) {
      records = records.filter((r) => r.lectureId === filters.lectureId);
    }
    if (filters?.studentId) {
      records = records.filter((r) => r.studentId === filters.studentId);
    }
    return records;
  },

  updateManualAttendance(
    lectureId: string,
    studentId: string,
    status: AttendanceStatus,
    actor: { id: string; name: string; role: UserRole }
  ): { success: boolean; record?: AttendanceRecord; error?: string } {
    const db = ensureDbFile();
    const lecture = db.lectures.find((l) => l.id === lectureId);
    if (!lecture) return { success: false, error: 'Lecture not found' };

    const student = db.users.find((u) => u.id === studentId);
    if (!student) return { success: false, error: 'Student not found' };

    let record = db.attendanceRecords.find((r) => r.lectureId === lectureId && r.studentId === studentId);
    const prevStatus = record?.status || 'none';

    if (record) {
      record.status = status;
      record.markedAt = new Date().toISOString();
      record.markedBy = 'manual_professor';
    } else {
      record = {
        id: `att-rec-${lectureId}-${studentId}`,
        lectureId,
        studentId,
        status,
        markedAt: new Date().toISOString(),
        markedBy: 'manual_professor',
      };
      db.attendanceRecords.push(record);
    }

    // If lecture was scheduled, update to conducted
    if (lecture.status === 'scheduled') {
      lecture.status = 'conducted';
    }

    // MANDATORY AUDIT LOG FOR MANUAL MODIFICATIONS
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'MANUAL_ATTENDANCE_OVERRIDE',
      entity: 'AttendanceRecord',
      entityId: record.id,
      details: `Changed attendance for ${student.name} (${student.enrollmentNo || student.id}) in lecture ${lectureId} from "${prevStatus}" to "${status}".`,
    });

    saveDb(db);
    return { success: true, record };
  },

  // LEAVE APPLICATIONS
  getLeaveApplications(filters?: { studentId?: string; professorId?: string; status?: string }): LeaveApplication[] {
    const db = ensureDbFile();
    let result = db.leaveApplications;
    if (filters?.studentId) {
      result = result.filter((l) => l.studentId === filters.studentId);
    }
    if (filters?.professorId) {
      result = result.filter((l) => l.professorId === filters.professorId);
    }
    if (filters?.status) {
      result = result.filter((l) => l.status === filters.status);
    }
    return result.sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));
  },

  createLeaveApplication(
    app: Omit<LeaveApplication, 'id' | 'appliedAt' | 'status'>,
    actor: { id: string; name: string }
  ): LeaveApplication {
    const db = ensureDbFile();
    const id = `leave-${Date.now()}`;
    const newApp: LeaveApplication = {
      ...app,
      id,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    };

    db.leaveApplications.unshift(newApp);

    // Notify professor
    db.notifications.unshift({
      id: `notif-${Date.now()}-${app.professorId}`,
      userId: app.professorId,
      role: 'professor',
      title: 'New Student Leave Request',
      message: `${actor.name} applied for leave from ${app.startDate} to ${app.endDate}.`,
      type: 'leave',
      read: false,
      link: '/professor/leaves',
      createdAt: new Date().toISOString(),
    });

    saveDb(db);
    return newApp;
  },

  updateLeaveStatus(
    leaveId: string,
    status: 'approved' | 'rejected',
    reviewNote: string,
    reviewer: { id: string; name: string; role: UserRole }
  ): { success: boolean; leave?: LeaveApplication; error?: string } {
    const db = ensureDbFile();
    const leave = db.leaveApplications.find((l) => l.id === leaveId);
    if (!leave) return { success: false, error: 'Leave application not found' };

    leave.status = status;
    leave.reviewNote = reviewNote;
    leave.reviewedAt = new Date().toISOString();
    leave.reviewedBy = reviewer.name;

    const student = db.users.find((u) => u.id === leave.studentId);

    // If APPROVED: Apply mandatory business logic!
    // Convert affected lectures to 'approved_leave' status in AttendanceRecords
    if (status === 'approved') {
      // Find lectures between startDate and endDate for this student's class
      const affectedLectures = db.lectures.filter((l) => {
        if (l.date < leave.startDate || l.date > leave.endDate) return false;
        if (leave.subjectId && l.subjectId !== leave.subjectId) return false;
        return (
          l.branchId === student?.branchId &&
          l.semester === student?.semester &&
          l.division === student?.division
        );
      });

      affectedLectures.forEach((lec) => {
        let record = db.attendanceRecords.find((r) => r.lectureId === lec.id && r.studentId === leave.studentId);
        if (record) {
          record.status = 'approved_leave';
          record.markedAt = new Date().toISOString();
          record.markedBy = 'manual_professor';
          record.notes = `Approved leave grant: ${leave.reason}`;
        } else {
          db.attendanceRecords.push({
            id: `att-rec-${lec.id}-${leave.studentId}`,
            lectureId: lec.id,
            studentId: leave.studentId,
            status: 'approved_leave',
            markedAt: new Date().toISOString(),
            markedBy: 'manual_professor',
            notes: `Approved leave grant: ${leave.reason}`,
          });
        }
      });
    }

    // Audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: reviewer.id,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      action: status === 'approved' ? 'APPROVE_LEAVE_APPLICATION' : 'REJECT_LEAVE_APPLICATION',
      entity: 'LeaveApplication',
      entityId: leave.id,
      details: `${reviewer.name} ${status} leave for student ${student?.name}. Note: ${reviewNote}`,
    });

    // Notify student
    db.notifications.unshift({
      id: `notif-${Date.now()}-${leave.studentId}`,
      userId: leave.studentId,
      role: 'student',
      title: status === 'approved' ? 'Leave Application Approved ✓' : 'Leave Application Rejected ✗',
      message: `Your leave request for ${leave.startDate} to ${leave.endDate} was ${status}. Reviewer note: "${reviewNote}"`,
      type: 'leave',
      read: false,
      link: '/student/leaves',
      createdAt: new Date().toISOString(),
    });

    saveDb(db);
    return { success: true, leave };
  },

  // ATTENDANCE CORRECTIONS
  getAttendanceCorrections(filters?: { studentId?: string; professorId?: string }): AttendanceCorrectionRequest[] {
    const db = ensureDbFile();
    let result = db.attendanceCorrections;
    if (filters?.studentId) {
      result = result.filter((c) => c.studentId === filters.studentId);
    }
    if (filters?.professorId) {
      result = result.filter((c) => c.professorId === filters.professorId);
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  createAttendanceCorrection(
    corr: Omit<AttendanceCorrectionRequest, 'id' | 'createdAt' | 'status'>,
    actor: { id: string; name: string }
  ): AttendanceCorrectionRequest {
    const db = ensureDbFile();
    const newCorr: AttendanceCorrectionRequest = {
      ...corr,
      id: `corr-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.attendanceCorrections.unshift(newCorr);

    // Notify professor
    db.notifications.unshift({
      id: `notif-${Date.now()}-${corr.professorId}`,
      userId: corr.professorId,
      role: 'professor',
      title: 'Attendance Correction Request',
      message: `${actor.name} requested attendance correction for lecture ${corr.lectureId}.`,
      type: 'attendance',
      read: false,
      link: '/professor/corrections',
      createdAt: new Date().toISOString(),
    });

    saveDb(db);
    return newCorr;
  },

  updateAttendanceCorrection(
    corrId: string,
    status: 'approved' | 'rejected',
    reviewComment: string,
    reviewer: { id: string; name: string; role: UserRole }
  ): { success: boolean; correction?: AttendanceCorrectionRequest; error?: string } {
    const db = ensureDbFile();
    const corr = db.attendanceCorrections.find((c) => c.id === corrId);
    if (!corr) return { success: false, error: 'Correction request not found' };

    corr.status = status;
    corr.reviewComment = reviewComment;
    corr.reviewedAt = new Date().toISOString();

    if (status === 'approved') {
      let record = db.attendanceRecords.find((r) => r.lectureId === corr.lectureId && r.studentId === corr.studentId);
      if (record) {
        record.status = corr.requestedStatus;
        record.markedAt = new Date().toISOString();
        record.markedBy = 'correction_approved';
        record.notes = `Correction approved by ${reviewer.name}: ${reviewComment}`;
      } else {
        db.attendanceRecords.push({
          id: `att-rec-${corr.lectureId}-${corr.studentId}`,
          lectureId: corr.lectureId,
          studentId: corr.studentId,
          status: corr.requestedStatus,
          markedAt: new Date().toISOString(),
          markedBy: 'correction_approved',
          notes: `Correction approved by ${reviewer.name}: ${reviewComment}`,
        });
      }
    }

    // Audit log
    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: reviewer.id,
      actorName: reviewer.name,
      actorRole: reviewer.role,
      action: status === 'approved' ? 'APPROVED_ATTENDANCE_CORRECTION' : 'REJECTED_ATTENDANCE_CORRECTION',
      entity: 'AttendanceCorrectionRequest',
      entityId: corr.id,
      details: `${reviewer.name} ${status} correction for lecture ${corr.lectureId}.`,
    });

    // Notify student
    db.notifications.unshift({
      id: `notif-${Date.now()}-${corr.studentId}`,
      userId: corr.studentId,
      role: 'student',
      title: `Attendance Correction ${status.toUpperCase()}`,
      message: `Your attendance correction request has been ${status}. ${reviewComment}`,
      type: 'attendance',
      read: false,
      link: '/student/attendance',
      createdAt: new Date().toISOString(),
    });

    saveDb(db);
    return { success: true, correction: corr };
  },

  // NOTIFICATIONS
  getNotifications(userId: string, role?: UserRole): Notification[] {
    const db = ensureDbFile();
    return db.notifications
      .filter((n) => n.userId === userId || (role && n.role === role && n.userId === 'ALL'))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  markNotificationRead(notificationId: string): boolean {
    const db = ensureDbFile();
    const notif = db.notifications.find((n) => n.id === notificationId);
    if (!notif) return false;
    notif.read = true;
    saveDb(db);
    return true;
  },

  markAllNotificationsRead(userId: string): boolean {
    const db = ensureDbFile();
    db.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    saveDb(db);
    return true;
  },

  // AUDIT LOGS
  getAuditLogs(): AuditLog[] {
    const db = ensureDbFile();
    return db.auditLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },
};
