import { NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';

export async function POST() {
  try {
    const freshDb = campusDb.reset();
    return NextResponse.json({
      success: true,
      message: 'Nexus Campus database successfully reset to clean demonstration state',
      stats: {
        users: freshDb.users.length,
        lectures: freshDb.lectures.length,
        records: freshDb.attendanceRecords.length,
      },
    });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}
