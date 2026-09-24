import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lectureId, professorId, requireWifi, allowedWifiSsid } = body;

    if (!lectureId || !professorId) {
      return NextResponse.json({ error: 'Missing lectureId or professorId' }, { status: 400 });
    }

    const result = campusDb.createAttendanceSession(lectureId, professorId, {
      requireWifi,
      allowedWifiSsid,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      session: result.session,
    });
  } catch (error) {
    console.error('Create QR session error:', error);
    return NextResponse.json({ error: 'Failed to create QR attendance session' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const lectureId = url.searchParams.get('lectureId');
    const sessionId = url.searchParams.get('sessionId');

    if (!lectureId && !sessionId) {
      return NextResponse.json({ error: 'lectureId or sessionId required' }, { status: 400 });
    }

    let session = sessionId ? campusDb.getSessionById(sessionId) : campusDb.getActiveSessionForLecture(lectureId!);

    if (!session) {
      return NextResponse.json({ active: false, message: 'No active session' });
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    const isExpired = remainingSeconds <= 0 || session.status === 'expired';

    // Get lecture to find registered students
    const lecture = campusDb.getLectureById(session.lectureId);
    let classStudents = campusDb.getUsers('student');
    if (lecture) {
      classStudents = classStudents.filter(
        (s) =>
          s.branchId === lecture.branchId &&
          s.semester === lecture.semester &&
          s.division === lecture.division
      );
    }

    const records = campusDb.getAttendanceRecords({ lectureId: session.lectureId });

    const studentLiveList = classStudents.map((s) => {
      const rec = records.find((r) => r.studentId === s.id);
      return {
        id: s.id,
        name: s.name,
        enrollmentNo: s.enrollmentNo || 'N/A',
        status: rec?.status || 'absent',
        markedAt: rec?.markedAt || null,
        markedBy: rec?.markedBy || null,
        avatarUrl: s.avatarUrl,
      };
    });

    const presentCount = studentLiveList.filter((s) => s.status === 'present').length;
    const approvedLeaveCount = studentLiveList.filter((s) => s.status === 'approved_leave').length;
    const absentCount = studentLiveList.filter((s) => s.status === 'absent').length;

    return NextResponse.json({
      active: !isExpired,
      session: {
        ...session,
        remainingSeconds,
        isExpired,
      },
      stats: {
        totalStudents: classStudents.length,
        present: presentCount,
        absent: absentCount,
        approvedLeave: approvedLeaveCount,
        pending: isExpired ? 0 : absentCount,
      },
      students: studentLiveList,
    });
  } catch (error) {
    console.error('Get QR session error:', error);
    return NextResponse.json({ error: 'Failed to retrieve attendance session status' }, { status: 500 });
  }
}
