import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { UserRole } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId') || 'stud_1';
    const role = (url.searchParams.get('role') as UserRole) || 'student';

    const list = campusDb.getNotifications(userId, role);
    const unreadCount = list.filter((n) => !n.read).length;

    return NextResponse.json({
      success: true,
      notifications: list,
      unreadCount,
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { notificationId, markAll, userId } = body;

    if (markAll && userId) {
      campusDb.markAllNotificationsRead(userId);
      return NextResponse.json({ success: true, message: 'All marked as read' });
    }

    if (notificationId) {
      campusDb.markNotificationRead(notificationId);
      return NextResponse.json({ success: true, message: 'Marked as read' });
    }

    return NextResponse.json({ error: 'Missing notificationId or markAll flag' }, { status: 400 });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Failed to update notification status' }, { status: 500 });
  }
}
