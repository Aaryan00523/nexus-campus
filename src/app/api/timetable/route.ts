import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const branchId = url.searchParams.get('branchId');
    const semester = url.searchParams.get('semester') ? parseInt(url.searchParams.get('semester')!, 10) : undefined;
    const division = url.searchParams.get('division');
    const professorId = url.searchParams.get('professorId');
    const studentId = url.searchParams.get('studentId');
    const view = url.searchParams.get('view'); // 'today' | 'tomorrow' | 'week' | 'all'

    let targetDate = date;
    const today = '2026-09-24'; // Aligned with the current scenario date
    const tomorrow = '2026-09-25';

    if (view === 'today') {
      targetDate = today;
    } else if (view === 'tomorrow') {
      targetDate = tomorrow;
    }

    const filters: {
      date?: string;
      branchId?: string;
      semester?: number;
      division?: string;
      professorId?: string;
    } = {};

    if (targetDate && view !== 'week' && view !== 'all') {
      filters.date = targetDate;
    }
    if (branchId) filters.branchId = branchId;
    if (semester !== undefined) filters.semester = semester;
    if (division) filters.division = division;
    if (professorId) filters.professorId = professorId;

    let lectures = campusDb.getLectures(filters);

    if (view === 'week') {
      // Filter for standard academic week (e.g., 2026-09-21 to 2026-09-25)
      lectures = lectures.filter((l) => l.date >= '2026-09-21' && l.date <= '2026-09-25');
    }

    // Enrich lectures with Subject, Room, Professor, and Attendance status
    const subjects = campusDb.getSubjects();
    const rooms = campusDb.getRooms();
    const users = campusDb.getUsers();
    const attendanceRecords = studentId ? campusDb.getAttendanceRecords({ studentId }) : [];

    const enrichedLectures = lectures.map((lec) => {
      const subject = subjects.find((s) => s.id === lec.subjectId);
      const room = rooms.find((r) => r.id === lec.roomId);
      const professor = users.find((u) => u.id === lec.professorId);
      const studentRecord = studentId ? attendanceRecords.find((r) => r.lectureId === lec.id) : undefined;

      return {
        ...lec,
        subject,
        room,
        professor: professor ? { id: professor.id, name: professor.name, email: professor.email, avatarUrl: professor.avatarUrl } : null,
        attendanceStatus: studentRecord?.status || (lec.status === 'conducted' ? 'not_marked' : 'upcoming'),
      };
    });

    const holidays = campusDb.getHolidays();

    return NextResponse.json({
      success: true,
      currentDate: today,
      lectures: enrichedLectures,
      holidays,
    });
  } catch (error) {
    console.error('Timetable retrieval error:', error);
    return NextResponse.json({ error: 'Failed to retrieve timetable' }, { status: 500 });
  }
}
