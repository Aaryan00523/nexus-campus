import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lecture, actor } = body;

    if (!lecture || !actor) {
      return NextResponse.json({ error: 'Missing lecture data or actor context.' }, { status: 400 });
    }

    const result = campusDb.createLecture(lecture, actor);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, lecture: result.lecture });
  } catch (error) {
    console.error('Create lecture error:', error);
    return NextResponse.json({ error: 'Failed to create lecture' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, updates, actor } = body;

    if (!id || !updates || !actor) {
      return NextResponse.json({ error: 'Missing lecture ID, updates or actor.' }, { status: 400 });
    }

    const result = campusDb.updateLecture(id, updates, actor);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true, lecture: result.lecture });
  } catch (error) {
    console.error('Update lecture error:', error);
    return NextResponse.json({ error: 'Failed to update lecture' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const actorId = url.searchParams.get('actorId') || 'user_admin_1';
    const actorName = url.searchParams.get('actorName') || 'Administrator';
    const actorRole = (url.searchParams.get('actorRole') as UserRole) || 'admin';

    if (!id) {
      return NextResponse.json({ error: 'Lecture ID is required' }, { status: 400 });
    }

    const ok = campusDb.deleteLecture(id, { id: actorId, name: actorName, role: actorRole });
    if (!ok) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Delete lecture error:', error);
    return NextResponse.json({ error: 'Failed to delete lecture' }, { status: 500 });
  }
}
