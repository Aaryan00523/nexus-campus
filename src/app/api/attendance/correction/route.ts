import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId') || undefined;
    const professorId = url.searchParams.get('professorId') || undefined;

    const list = campusDb.getAttendanceCorrections({ studentId, professorId });
    const lectures = campusDb.getLectures();
    const subjects = campusDb.getSubjects();
    const users = campusDb.getUsers();

    const enriched = list.map((item) => {
      const lecture = lectures.find((l) => l.id === item.lectureId);
      const subject = subjects.find((s) => s.id === lecture?.subjectId);
      const student = users.find((u) => u.id === item.studentId);
      const professor = users.find((u) => u.id === item.professorId);

      return {
        ...item,
        lectureDate: lecture?.date,
        lectureTime: lecture ? `${lecture.startTime} - ${lecture.endTime}` : undefined,
        subjectName: subject?.name || 'Class',
        studentName: student?.name,
        studentEnrollment: student?.enrollmentNo,
        professorName: professor?.name,
      };
    });

    return NextResponse.json({ success: true, corrections: enriched });
  } catch (error) {
    console.error('Fetch corrections error:', error);
    return NextResponse.json({ error: 'Failed to fetch correction requests' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, lectureId, professorId, requestedStatus, reason, proofNote } = body;

    if (!studentId || !lectureId || !professorId || !reason) {
      return NextResponse.json({ error: 'Missing required correction fields' }, { status: 400 });
    }

    const student = campusDb.getUserById(studentId);
    const correction = campusDb.createAttendanceCorrection(
      {
        studentId,
        lectureId,
        professorId,
        requestedStatus: requestedStatus || 'present',
        reason,
        proofNote,
      },
      {
        id: studentId,
        name: student?.name || 'Student',
      }
    );

    return NextResponse.json({ success: true, correction });
  } catch (error) {
    console.error('Create correction error:', error);
    return NextResponse.json({ error: 'Failed to submit correction request' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { correctionId, status, reviewComment, actorId, actorName, actorRole } = body;

    if (!correctionId || !status) {
      return NextResponse.json({ error: 'Missing correctionId or decision status' }, { status: 400 });
    }

    const result = campusDb.updateAttendanceCorrection(
      correctionId,
      status,
      reviewComment || 'Reviewed by faculty',
      {
        id: actorId || 'prof_1',
        name: actorName || 'Dr. Vikram Roy',
        role: (actorRole as UserRole) || 'professor',
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, correction: result.correction });
  } catch (error) {
    console.error('Update correction error:', error);
    return NextResponse.json({ error: 'Failed to update correction decision' }, { status: 500 });
  }
}
