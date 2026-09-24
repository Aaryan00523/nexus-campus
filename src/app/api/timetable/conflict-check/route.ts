import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, startTime, endTime, professorId, roomId, branchId, semester, division, ignoreLectureId } = body;

    if (!date || !startTime || !endTime || !professorId || !roomId || !branchId || !semester || !division) {
      return NextResponse.json({ error: 'All timetable parameters are required for conflict validation.' }, { status: 400 });
    }

    const conflict = campusDb.checkTimetableConflict({
      date,
      startTime,
      endTime,
      professorId,
      roomId,
      branchId,
      semester: parseInt(semester, 10),
      division,
      ignoreLectureId,
    });

    return NextResponse.json(conflict);
  } catch (error) {
    console.error('Conflict check error:', error);
    return NextResponse.json({ error: 'Conflict verification failed' }, { status: 500 });
  }
}
