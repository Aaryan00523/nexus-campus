import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { computeStudentAttendanceSummary } from '@/lib/attendanceLogic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || req.cookies.get('campus_session_user_id')?.value || 'stud_1';

    const user = campusDb.getUserById(userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Student not found or unauthorized' }, { status: 404 });
    }

    const settings = campusDb.getSettings();
    const allSubjects = campusDb.getSubjects();
    const studentSubjects = allSubjects.filter(
      (s) => s.branchId === user.branchId && s.semester === user.semester
    );

    const allRecords = campusDb.getAttendanceRecords({ studentId: user.id });
    const allLectures = campusDb.getLectures({
      branchId: user.branchId,
      semester: user.semester,
      division: user.division,
    });

    const lecturesMap = new Map(
      allLectures.map((l) => [l.id, { id: l.id, date: l.date, startTime: l.startTime, endTime: l.endTime, subjectId: l.subjectId, roomId: l.roomId, status: l.status }])
    );
    const professorsMap = new Map(campusDb.getUsers('professor').map((p) => [p.id, { name: p.name }]));
    const roomsMap = new Map(campusDb.getRooms().map((r) => [r.id, { code: r.code, name: r.name }]));

    const summary = computeStudentAttendanceSummary(
      user.id,
      studentSubjects,
      allRecords,
      lecturesMap,
      professorsMap,
      roomsMap,
      settings.minAttendanceThreshold || 75
    );

    const todayDate = new Date().toISOString().split('T')[0];
    const todayLectures = allLectures.filter((l) => l.date === todayDate);
    const notifications = campusDb.getNotifications(user.id, 'student');

    return NextResponse.json({
      success: true,
      student: user,
      summary,
      todayLectures,
      notifications: notifications.slice(0, 5),
      settings,
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    return NextResponse.json({ error: 'Failed to retrieve student dashboard data' }, { status: 500 });
  }
}
