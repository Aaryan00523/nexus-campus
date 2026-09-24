import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { AttendanceStatus, UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lectureId, studentId, status, actorId, actorName, actorRole } = body;

    if (!lectureId || !studentId || !status) {
      return NextResponse.json({ error: 'Missing lectureId, studentId, or status' }, { status: 400 });
    }

    const result = campusDb.updateManualAttendance(
      lectureId,
      studentId,
      status as AttendanceStatus,
      {
        id: actorId || 'prof_1',
        name: actorName || 'Professor',
        role: (actorRole as UserRole) || 'professor',
      }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance record updated with audit log',
      record: result.record,
    });
  } catch (error) {
    console.error('Manual attendance modification error:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
