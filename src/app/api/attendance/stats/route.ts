import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { computeStudentAttendanceSummary } from '@/lib/attendanceLogic';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId');
    const professorId = url.searchParams.get('professorId');
    const settings = campusDb.getSettings();

    if (studentId) {
      const student = campusDb.getUserById(studentId);
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      // Filter subjects for this student's branch & semester
      const allSubjects = campusDb.getSubjects();
      const studentSubjects = allSubjects.filter(
        (s) => s.branchId === student.branchId && s.semester === student.semester
      );

      const allRecords = campusDb.getAttendanceRecords({ studentId });
      const allLectures = campusDb.getLectures({
        branchId: student.branchId,
        semester: student.semester,
        division: student.division,
      });

      const lecturesMap = new Map(
        allLectures.map((l) => [l.id, { id: l.id, date: l.date, startTime: l.startTime, endTime: l.endTime, subjectId: l.subjectId, roomId: l.roomId, status: l.status }])
      );
      const professorsMap = new Map(campusDb.getUsers('professor').map((p) => [p.id, { name: p.name }]));
      const roomsMap = new Map(campusDb.getRooms().map((r) => [r.id, { code: r.code, name: r.name }]));

      const summary = computeStudentAttendanceSummary(
        studentId,
        studentSubjects,
        allRecords,
        lecturesMap,
        professorsMap,
        roomsMap,
        settings.minAttendanceThreshold || 75
      );

      return NextResponse.json({
        success: true,
        student: {
          id: student.id,
          name: student.name,
          enrollmentNo: student.enrollmentNo,
          branch: student.branchId,
          semester: student.semester,
          division: student.division,
        },
        summary,
        settings,
      });
    }

    if (professorId) {
      // Calculate professor department metrics
      const prof = campusDb.getUserById(professorId);
      const myLectures = campusDb.getLectures({ professorId });
      const conductedLectures = myLectures.filter((l) => l.status === 'conducted');

      let totalAttendees = 0;
      let totalPresents = 0;

      for (const lec of conductedLectures) {
        const records = campusDb.getAttendanceRecords({ lectureId: lec.id });
        totalAttendees += records.length;
        totalPresents += records.filter((r) => r.status === 'present').length;
      }

      const avgAttendance = totalAttendees > 0 ? Math.round((totalPresents / totalAttendees) * 10000) / 100 : 85.0;

      // Pending leaves for this professor
      const pendingLeaves = campusDb.getLeaveApplications({ professorId, status: 'pending' });

      // Today's classes
      const todayClasses = myLectures.filter((l) => l.date === '2026-09-24');

      return NextResponse.json({
        success: true,
        professor: prof,
        metrics: {
          todayClassesCount: todayClasses.length,
          upcomingClassesCount: myLectures.filter((l) => l.date >= '2026-09-24' && l.status === 'scheduled').length,
          pendingLeavesCount: pendingLeaves.length,
          averageAttendance: avgAttendance,
          totalConducted: conductedLectures.length,
        },
        todayClasses,
      });
    }

    return NextResponse.json({ error: 'Please provide either studentId or professorId' }, { status: 400 });
  } catch (error) {
    console.error('Attendance stats error:', error);
    return NextResponse.json({ error: 'Failed to compute attendance metrics' }, { status: 500 });
  }
}
