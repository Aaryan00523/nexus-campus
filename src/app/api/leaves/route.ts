import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get('studentId') || undefined;
    const professorId = url.searchParams.get('professorId') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const leaves = campusDb.getLeaveApplications({ studentId, professorId, status });
    const users = campusDb.getUsers();
    const subjects = campusDb.getSubjects();

    const enriched = leaves.map((l) => {
      const student = users.find((u) => u.id === l.studentId);
      const professor = users.find((u) => u.id === l.professorId);
      const subject = subjects.find((s) => s.id === l.subjectId);

      return {
        ...l,
        studentName: student?.name || 'Student',
        studentEnrollment: student?.enrollmentNo || 'N/A',
        studentAvatar: student?.avatarUrl,
        professorName: professor?.name || 'Faculty',
        subjectName: subject?.name || 'All Subjects',
      };
    });

    return NextResponse.json({ success: true, leaves: enriched });
  } catch (error) {
    console.error('Fetch leaves error:', error);
    return NextResponse.json({ error: 'Failed to fetch leave applications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, subjectId, professorId, startDate, endDate, lectureIds, reason, documentName } = body;

    if (!studentId || !professorId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Missing mandatory leave fields' }, { status: 400 });
    }

    const student = campusDb.getUserById(studentId);
    const newLeave = campusDb.createLeaveApplication(
      {
        studentId,
        subjectId,
        professorId,
        startDate,
        endDate,
        lectureIds: lectureIds || [],
        reason,
        documentName: documentName || 'Document_Attachment.pdf',
      },
      {
        id: studentId,
        name: student?.name || 'Student',
      }
    );

    return NextResponse.json({ success: true, leave: newLeave });
  } catch (error) {
    console.error('Create leave error:', error);
    return NextResponse.json({ error: 'Failed to submit leave application' }, { status: 500 });
  }
}
