import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { calculateAttendancePercentage } from '@/lib/attendanceLogic';

export async function GET(req: NextRequest) {
  try {
    const settings = campusDb.getSettings();
    const students = campusDb.getUsers('student');
    const professors = campusDb.getUsers('professor');
    const branches = campusDb.getBranches();
    const lectures = campusDb.getLectures();
    const attendanceRecords = campusDb.getAttendanceRecords();
    const auditLogs = campusDb.getAuditLogs().slice(0, 10);

    const presents = attendanceRecords.filter((r) => r.status === 'present').length;
    const leaves = attendanceRecords.filter((r) => r.status === 'approved_leave').length;
    const avgAttendance = calculateAttendancePercentage(
      presents,
      attendanceRecords.length,
      leaves
    );

    return NextResponse.json({
      success: true,
      metrics: {
        totalStudents: students.length,
        totalProfessors: professors.length,
        totalBranches: branches.length,
        totalLectures: lectures.length,
        averageAttendance: avgAttendance,
      },
      settings,
      recentAuditLogs: auditLogs,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Failed to retrieve admin dashboard data' }, { status: 500 });
  }
}
