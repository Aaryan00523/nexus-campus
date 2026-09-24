import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || req.cookies.get('campus_session_user_id')?.value || 'prof_1';

    const user = campusDb.getUserById(userId);
    if (!user || user.role !== 'professor') {
      return NextResponse.json({ error: 'Professor not found or unauthorized' }, { status: 404 });
    }

    const todayLectures = campusDb.getLectures({ professorId: user.id });
    const pendingCorrections = campusDb.getAttendanceCorrections().filter(c => c.status === 'pending');
    const settings = campusDb.getSettings();

    return NextResponse.json({
      success: true,
      professor: user,
      todayLectures,
      pendingCorrections,
      settings,
    });
  } catch (error) {
    console.error('Professor dashboard error:', error);
    return NextResponse.json({ error: 'Failed to retrieve professor dashboard data' }, { status: 500 });
  }
}
