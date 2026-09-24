import { adminAuth, adminDb } from '../src/lib/firebaseAdmin';
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
} from '../src/lib/initialData';

function sanitize(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) {
        res[k] = sanitize(v);
      }
    }
    return res;
  }
  return obj;
}

async function seedFirestore() {
  console.log('--- Starting Firestore & Auth Seeding ---');

  // 1. College Settings
  console.log('Seeding College Settings...');
  await adminDb.collection('collegeSettings').doc('default').set(sanitize({
    ...initialSettings,
    updatedAt: new Date().toISOString(),
  }));

  // 2. Branches
  console.log('Seeding Branches...');
  const branchBatch = adminDb.batch();
  for (const b of initialBranches) {
    branchBatch.set(adminDb.collection('branches').doc(b.id), sanitize(b));
  }
  await branchBatch.commit();

  // 3. Semesters (1 through 8)
  console.log('Seeding Semesters...');
  const semesterBatch = adminDb.batch();
  for (let sem = 1; sem <= 8; sem++) {
    const semId = `sem_${sem}`;
    semesterBatch.set(adminDb.collection('semesters').doc(semId), sanitize({
      id: semId,
      number: sem,
      name: `Semester ${sem}`,
      term: sem % 2 === 1 ? 'Autumn Term' : 'Spring Term',
      academicYear: '2026-2027',
    }));
  }
  await semesterBatch.commit();

  // 4. Divisions
  console.log('Seeding Divisions...');
  const divBatch = adminDb.batch();
  for (const d of initialDivisions) {
    divBatch.set(adminDb.collection('divisions').doc(d.id), sanitize(d));
  }
  await divBatch.commit();

  // 5. Rooms
  console.log('Seeding Rooms...');
  const roomBatch = adminDb.batch();
  for (const r of initialRooms) {
    roomBatch.set(adminDb.collection('rooms').doc(r.id), sanitize(r));
  }
  await roomBatch.commit();

  // 6. Subjects & Courses
  console.log('Seeding Subjects & Courses...');
  const subBatch = adminDb.batch();
  for (const s of initialSubjects) {
    subBatch.set(adminDb.collection('subjects').doc(s.id), sanitize(s));
    subBatch.set(adminDb.collection('courses').doc(`course_${s.id}`), sanitize({
      id: `course_${s.id}`,
      subjectId: s.id,
      code: s.code,
      name: s.name,
      credits: s.credits,
      branchId: s.branchId,
      semester: s.semester,
      syllabus: `${s.name} Comprehensive Curriculum (2026 Edition)`,
    }));
  }
  await subBatch.commit();

  // 7. Users, Students, Professors & Firebase Auth
  console.log('Seeding Users, Students, Professors and provisioning Auth accounts...');
  for (const u of initialUsers) {
    // A. Provision Firebase Auth
    try {
      await adminAuth.createUser({
        uid: u.id,
        email: u.email,
        password: 'Password@123',
        displayName: u.name,
      });
      console.log(`Created Auth user: ${u.email} (${u.role})`);
    } catch (err: any) {
      if (err.code === 'auth/email-already-exists' || err.code === 'auth/uid-already-exists') {
        try {
          await adminAuth.updateUser(u.id, {
            displayName: u.name,
            email: u.email,
          });
        } catch {
          // ignore
        }
      } else {
        console.warn(`Auth notice for ${u.email}:`, err.message);
      }
    }

    // B. Save to users collection
    await adminDb.collection('users').doc(u.id).set(sanitize({
      uid: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      profileId: u.id,
      department: (u as any).department || null,
      enrollmentNo: (u as any).enrollmentNo || null,
      branchId: (u as any).branchId || null,
      division: (u as any).division || (u as any).divisionId || 'A',
      divisionId: (u as any).divisionId || ((u as any).branchId && (u as any).semester ? `div_${((u as any).branchId as string).replace('branch_', '')}_${(u as any).semester}a` : null),
      semester: (u as any).semester || null,
      avatar: (u as any).avatar || (u as any).avatarUrl || null,
      avatarUrl: (u as any).avatarUrl || (u as any).avatar || null,
      phone: (u as any).phone || null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }));

    // C. Save to students collection
    if (u.role === 'student') {
      await adminDb.collection('students').doc(u.id).set(sanitize({
        id: u.id,
        userId: u.id,
        name: u.name,
        email: u.email,
        enrollmentNo: (u as any).enrollmentNo,
        rollNumber: (u as any).rollNumber || (u as any).enrollmentNo,
        branchId: (u as any).branchId,
        division: (u as any).division || 'A',
        divisionId: (u as any).divisionId || `div_cs_${(u as any).semester}a`,
        semester: (u as any).semester,
        attendancePercentage: (u as any).attendancePercentage ?? 78,
        totalConducted: (u as any).totalConducted ?? 42,
        totalAttended: (u as any).totalAttended ?? 33,
        avatar: (u as any).avatar || (u as any).avatarUrl || null,
        avatarUrl: (u as any).avatarUrl || (u as any).avatar || null,
        phone: (u as any).phone || null,
      }));
    }

    // D. Save to professors collection
    if (u.role === 'professor') {
      await adminDb.collection('professors').doc(u.id).set(sanitize({
        id: u.id,
        userId: u.id,
        name: u.name,
        email: u.email,
        employeeId: (u as any).employeeId || `EMP-${u.id}`,
        department: (u as any).department,
        designation: (u as any).designation || 'Professor',
        assignedSubjectIds: (u as any).assignedSubjectIds || [],
        avatar: (u as any).avatar || (u as any).avatarUrl || null,
        avatarUrl: (u as any).avatarUrl || (u as any).avatar || null,
        phone: (u as any).phone || null,
      }));
    }
  }

  // 8. Timetables & Lectures
  console.log('Seeding Lectures & Timetables...');
  const lectureBatch = adminDb.batch();
  for (const l of initialLectures) {
    lectureBatch.set(adminDb.collection('lectures').doc(l.id), sanitize(l));
    lectureBatch.set(adminDb.collection('timetables').doc(`tt_${l.id}`), sanitize({
      id: `tt_${l.id}`,
      lectureId: l.id,
      divisionId: l.divisionId,
      dayOfWeek: l.dayOfWeek,
      startTime: l.startTime,
      endTime: l.endTime,
      subjectId: l.subjectId,
      professorId: l.professorId,
      roomId: l.roomId,
    }));
  }
  await lectureBatch.commit();

  // 9. Attendance Sessions
  console.log('Seeding Attendance Sessions...');
  const sessionBatch = adminDb.batch();
  for (const s of initialAttendanceSessions) {
    sessionBatch.set(adminDb.collection('attendanceSessions').doc(s.id), sanitize(s));
  }
  await sessionBatch.commit();

  // 10. Attendance Records
  console.log('Seeding Attendance Records...');
  const recordBatch = adminDb.batch();
  for (const r of initialAttendanceRecords) {
    recordBatch.set(adminDb.collection('attendanceRecords').doc(r.id), sanitize(r));
  }
  await recordBatch.commit();

  // 11. Leave Applications
  console.log('Seeding Leave Applications...');
  const leaveBatch = adminDb.batch();
  for (const la of initialLeaveApplications) {
    leaveBatch.set(adminDb.collection('leaveApplications').doc(la.id), sanitize(la));
  }
  await leaveBatch.commit();

  // 12. Attendance Corrections
  console.log('Seeding Attendance Corrections...');
  const corrBatch = adminDb.batch();
  for (const ac of initialAttendanceCorrections) {
    corrBatch.set(adminDb.collection('attendanceCorrectionRequests').doc(ac.id), sanitize(ac));
  }
  await corrBatch.commit();

  // 13. Notifications
  console.log('Seeding Notifications...');
  const notifBatch = adminDb.batch();
  for (const n of initialNotifications) {
    notifBatch.set(adminDb.collection('notifications').doc(n.id), sanitize(n));
  }
  await notifBatch.commit();

  // 14. Audit Logs
  console.log('Seeding Audit Logs...');
  const auditBatch = adminDb.batch();
  for (const al of initialAuditLogs) {
    auditBatch.set(adminDb.collection('auditLogs').doc(al.id), sanitize(al));
  }
  await auditBatch.commit();

  // 15. Academic Calendar
  console.log('Seeding Academic Calendar...');
  const calBatch = adminDb.batch();
  for (const h of initialHolidays) {
    calBatch.set(adminDb.collection('academicCalendar').doc(h.id), sanitize(h));
  }
  await calBatch.commit();

  console.log('--- All 18 Collections Successfully Seeded into Cloud Firestore! ---');
}

seedFirestore().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
