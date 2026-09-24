export type UserRole = 'student' | 'professor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
  phone?: string;
  // Student specific
  enrollmentNo?: string;
  branchId?: string;
  semester?: number;
  division?: string;
  // Professor specific
  professorId?: string;
  designation?: string;
  specialization?: string;
  assignedSubjectIds?: string[];
  assignedDivisions?: string[];
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  department: string;
}

export interface Division {
  id: string;
  name: string; // 'A', 'B', etc.
  branchId: string;
  semester: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  branchId: string;
  semester: number;
  credits: number;
  professorId: string;
  color?: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  type: 'lecture_hall' | 'lab' | 'auditorium' | 'seminar';
  capacity: number;
  building: string;
  floor: string;
}

export type LectureStatus = 'scheduled' | 'conducted' | 'cancelled' | 'rescheduled';
export type AttendanceStatus = 'present' | 'absent' | 'approved_leave' | 'pending';

export interface Lecture {
  id: string; // Permanent ID: e.g., LEC-2026-09-24-CS-3A-MATH-01
  timetableSlotId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  subjectId: string;
  professorId: string;
  substituteProfessorId?: string;
  roomId: string;
  branchId: string;
  semester: number;
  division: string;
  status: LectureStatus;
  rescheduledTo?: {
    date: string;
    startTime: string;
    endTime: string;
    roomId: string;
  };
  cancellationReason?: string;
  topic?: string;
}

export interface AttendanceSession {
  id: string;
  lectureId: string;
  professorId: string;
  sessionToken: string;
  createdAt: string; // ISO
  expiresAt: string; // ISO (2 minutes lifetime)
  status: 'active' | 'expired' | 'closed';
  requireWifi?: boolean;
  allowedWifiSsid?: string;
  requireGps?: boolean;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
}

export interface AttendanceRecord {
  id: string;
  lectureId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
  markedBy: 'qr' | 'manual_professor' | 'correction_approved';
  deviceInfo?: string;
  ipAddress?: string;
  notes?: string;
}

export interface LeaveApplication {
  id: string;
  studentId: string;
  subjectId?: string; // Optional: all subjects or specific
  subjectName?: string;
  professorId: string;
  startDate: string;
  endDate: string;
  lectureIds: string[]; // Specific affected lecture instances
  reason: string;
  documentUrl?: string;
  documentName?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface AttendanceCorrectionRequest {
  id: string;
  studentId: string;
  lectureId: string;
  professorId: string;
  requestedStatus: AttendanceStatus;
  reason: string;
  proofNote?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewComment?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'timetable' | 'leave' | 'attendance' | 'alert' | 'system';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entity: string;
  entityId: string;
  details: string;
}

export interface CollegeSettings {
  collegeName: string;
  collegeShortName: string;
  academicYear: string;
  currentSemesterTerm: string;
  minAttendanceThreshold: number; // e.g., 75
  warningThreshold: number; // e.g., 65
  qrExpirySeconds: number; // e.g., 120
  allowWifiRestriction: boolean;
  collegeWifiSsid: string;
  allowGpsRestriction: boolean;
  campusLatitude: number;
  campusLongitude: number;
  campusRadiusMeters: number;
}

export interface AcademicHoliday {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'exam' | 'break' | 'event';
  description?: string;
}

export interface SubjectAttendanceSummary {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  professorName: string;
  totalConducted: number;
  presentCount: number;
  absentCount: number;
  approvedLeaveCount: number;
  percentage: number;
  isLowAttendance: number; // 0 or percentage
  consecutiveRequiredToRecover: number;
  records: Array<{
    lectureId: string;
    date: string;
    time: string;
    room: string;
    status: AttendanceStatus;
  }>;
}

export interface OverallAttendanceSummary {
  totalConducted: number;
  presentCount: number;
  absentCount: number;
  approvedLeaveCount: number;
  overallPercentage: number;
  isBelowThreshold: boolean;
  consecutiveRequiredToRecover: number;
  threshold: number;
  subjects: SubjectAttendanceSummary[];
}
