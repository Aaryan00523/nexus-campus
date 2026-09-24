import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, reviewNote, actorId, actorName, actorRole } = body;

    if (!status || (status !== 'approved' && status !== 'rejected')) {
      return NextResponse.json({ error: 'Status must be approved or rejected' }, { status: 400 });
    }

    const result = campusDb.updateLeaveStatus(id, status, reviewNote || `Leave application ${status}`, {
      id: actorId || 'prof_1',
      name: actorName || 'Dr. Vikram Roy',
      role: (actorRole as UserRole) || 'professor',
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Leave application ${status}`,
      leave: result.leave,
    });
  } catch (error) {
    console.error('Update leave error:', error);
    return NextResponse.json({ error: 'Failed to update leave application status' }, { status: 500 });
  }
}
