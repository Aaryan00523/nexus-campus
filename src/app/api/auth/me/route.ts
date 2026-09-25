import { NextRequest, NextResponse } from 'next/server';
import { campusDb } from '@/lib/db';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    let effectiveUserId: string | null = null;

    // 1. Check Authorization Bearer token (Firebase ID token)
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        if (adminAuth && typeof adminAuth.verifyIdToken === 'function') {
          const decoded = await adminAuth.verifyIdToken(token);
          if (decoded.uid) {
            const user = campusDb.getUserById(decoded.uid) || (decoded.email ? campusDb.getUserByEmail(decoded.email) : undefined);
            if (user) {
              effectiveUserId = user.id;
            }
          }
        }
      } catch (err) {
        console.warn('Bearer token verification failed in /me:', err);
      }
    }

    // 2. Cookie or query param fallback
    if (!effectiveUserId) {
      const sessionUserId = req.cookies.get('campus_session_user_id')?.value;
      const url = new URL(req.url);
      const queryUserId = url.searchParams.get('userId');
      effectiveUserId = queryUserId || sessionUserId || 'stud_1';
    }

    let user = campusDb.getUserById(effectiveUserId);

    // Resilient fallback to primary student if user was not found
    if (!user) {
      user = campusDb.getUserById('stud_1');
    }

    const settings = campusDb.getSettings();

    return NextResponse.json({
      user,
      settings,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    // Even on error, return the primary demo student so client layout never hangs
    const fallbackUser = campusDb.getUserById('stud_1');
    const settings = campusDb.getSettings();
    return NextResponse.json({ user: fallbackUser, settings });
  }
}
