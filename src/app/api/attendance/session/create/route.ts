import { NextRequest, NextResponse } from 'next/server';
import { campusDb, persistDocToFirestore } from '@/lib/db';

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

    if (!result.success || !result.session) {
      return NextResponse.json({ error: result.error || 'Failed to create session' }, { status: 400 });
    }

    // Persist session to Cloud Firestore
    persistDocToFirestore('attendanceSessions', result.session.id, result.session);

    return NextResponse.json({
      success: true,
      session: result.session,
    });
  } catch (error) {
    console.error('Create QR session error:', error);
    return NextResponse.json({ error: 'Failed to create QR attendance session' }, { status: 500 });
  }
}
