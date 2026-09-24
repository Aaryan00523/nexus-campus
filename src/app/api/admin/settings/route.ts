import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function GET() {
  try {
    const settings = campusDb.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { settings, actorId, actorName, actorRole } = body;

    if (!settings) {
      return NextResponse.json({ error: 'Missing settings payload' }, { status: 400 });
    }

    const updated = campusDb.updateSettings(settings, {
      id: actorId || 'user_admin_1',
      name: actorName || 'Dean Robert Sterling',
      role: (actorRole as UserRole) || 'admin',
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
