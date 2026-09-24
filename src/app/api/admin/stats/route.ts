import { NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { calculateAttendancePercentage } from '@/lib/attendanceLogic';

export async function GET() {
  try {
    const students = campusDb.getUsers('student');
    const professors = campusDb.getUsers('professor');
    const branches = campusDb.getBranches();
    const divisions = campusDb.getDivisions();
    const subjects = campusDb.getSubjects();
    const rooms = campusDb.getRooms();
    const lectures = campusDb.getLectures();
    const conductedLectures = lectures.filter((l) => l.status === 'conducted');
    const attendanceRecords = campusDb.getAttendanceRecords();
    const leaveApplications = campusDb.getLeaveApplications();
    const auditLogs = campusDb.getAuditLogs();
    const settings = campusDb.getSettings();

    const presents = attendanceRecords.filter((r) => r.status === 'present').length;
    const leaves = attendanceRecords.filter((r) => r.status === 'approved_leave').length;
    const overallUniversityAttendance = calculateAttendancePercentage(
      presents,
      attendanceRecords.length,
      leaves
    );

    const lowAttendanceStudentsCount = students.filter((s) => {
      const records = attendanceRecords.filter((r) => r.studentId === s.id);
      const p = records.filter((r) => r.status === 'present').length;
      const l = records.filter((r) => r.status === 'approved_leave').length;
      const pct = calculateAttendancePercentage(p, records.length, l);
      return pct < (settings.minAttendanceThreshold || 75);
    }).length;

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents: students.length,
        totalProfessors: professors.length,
        totalBranches: branches.length,
        totalDivisions: divisions.length,
        totalSubjects: subjects.length,
        totalRooms: rooms.length,
        totalLecturesScheduled: lectures.length,
        totalLecturesConducted: conductedLectures.length,
        overallUniversityAttendance,
        lowAttendanceAlertsCount: lowAttendanceStudentsCount,
        pendingLeavesCount: leaveApplications.filter((l) => l.status === 'pending').length,
      },
      recentAuditLogs: auditLogs.slice(0, 10),
      settings,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
