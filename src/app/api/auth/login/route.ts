import { NextRequest, NextResponse } from 'next/server';
import { campusDb, persistDocToFirestore } from '@/lib/db';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, role, isDemo, demoUserId, idToken } = body;

    let user;

    // 1. If Firebase ID token is provided directly from client Firebase Auth
    if (idToken) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const email = decodedToken.email;
        if (email) {
          user = campusDb.getUserByEmail(email);
        }
        if (!user && decodedToken.uid) {
          user = campusDb.getUserById(decodedToken.uid);
        }
      } catch (tokenErr) {
        console.warn('Firebase token verification notice:', tokenErr);
      }
    }

    // 2. Demo user login
    if (!user && isDemo && demoUserId) {
      user = campusDb.getUserById(demoUserId);
    } 
    // 3. Identifier based login (Enrollment No, Email, ID)
    else if (!user && identifier) {
      const cleanId = identifier.trim();
      // Try by enrollment number
      user = campusDb.getUserByEnrollment(cleanId);
      // Try by email
      if (!user) {
        user = campusDb.getUserByEmail(cleanId);
      }
      // Try by ID
      if (!user) {
        user = campusDb.getUserById(cleanId);
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials. User could not be found with provided identifier.' },
        { status: 401 }
      );
    }

    // Role check if provided
    if (role && user.role !== role) {
      return NextResponse.json(
        { error: `Account found, but role is "${user.role}", not "${role}". Please select the correct portal.` },
        { status: 403 }
      );
    }

    // Standard mock/demo password validation
    if (!isDemo && !idToken && password && password.length < 3) {
      return NextResponse.json(
        { error: 'Password must be at least 3 characters.' },
        { status: 400 }
      );
    }

    // Generate Firebase Custom Token for client SDK synchronization
    let customToken: string | undefined;
    try {
      customToken = await adminAuth.createCustomToken(user.id, {
        role: user.role,
        email: user.email,
      });
    } catch (err) {
      console.warn('Custom token generation notice:', err);
    }

    // Update lastLogin in Firestore asynchronously
    persistDocToFirestore('users', user.id, {
      lastLogin: new Date().toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      customToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        enrollmentNo: user.enrollmentNo,
        branchId: user.branchId,
        semester: user.semester,
        division: user.division,
        professorId: user.professorId,
        avatarUrl: user.avatarUrl,
      },
    });

    // Set HTTP-only secure cookie for session
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('campus_session_user_id', user.id, {
      httpOnly: false, // accessible to client for smooth state hydration
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: isProduction,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server authentication error' }, { status: 500 });
  }
}
