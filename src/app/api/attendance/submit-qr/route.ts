import { NextRequest, NextResponse } from 'next/server';
import { campusDb, persistDocToFirestore } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, sessionToken, wifiSsid, deviceInfo } = body;

    if (!studentId || !sessionToken) {
      return NextResponse.json(
        { error: 'Missing student ID or scanned QR session token.' },
        { status: 400 }
      );
    }

    const result = campusDb.submitQrAttendance(studentId, sessionToken.trim(), {
      wifiSsid,
      deviceInfo,
    });

    if (!result.success || !result.record) {
      return NextResponse.json(
        { error: result.error },
        { status: 422 }
      );
    }

    // Sync to Cloud Firestore
    persistDocToFirestore('attendanceRecords', result.record.id, result.record);

    return NextResponse.json({
      success: true,
      message: 'Attendance successfully confirmed!',
      record: result.record,
      details: result.details,
    });
  } catch (error) {
    console.error('Submit QR attendance error:', error);
    return NextResponse.json({ error: 'Failed to process QR attendance' }, { status: 500 });
  }
}
