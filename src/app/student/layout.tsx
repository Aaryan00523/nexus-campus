'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import MobileNav from '@/components/layout/MobileNav';
import DemoSwitcher from '@/components/shared/DemoSwitcher';
import { User } from '@/lib/types';

const DEFAULT_STUDENT: User = {
  id: 'stud_1',
  name: 'Aaryan Sharma',
  email: 'aaryan.sharma@student.aits.edu',
  role: 'student',
  enrollmentNo: 'CS-2024-001',
  department: 'Computer Science & Engineering',
  branchId: 'branch_cs',
  semester: 3,
  division: 'A',
  phone: '+1 (555) 782-9011',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256',
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout ensures the portal never hangs on cold start
    const timer = setTimeout(() => {
      if (isMounted) {
        setUser((prev) => prev || DEFAULT_STUDENT);
      }
    }, 1500);

    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.user && data.user.role === 'student') {
          setUser(data.user);
        } else {
          // Default to primary student demo user
          fetch('/api/auth/me?userId=stud_1')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (isMounted) {
                setUser(d?.user || DEFAULT_STUDENT);
              }
            })
            .catch(() => {
              if (isMounted) setUser((prev) => prev || DEFAULT_STUDENT);
            });
        }
      })
      .catch(() => {
        if (isMounted) setUser((prev) => prev || DEFAULT_STUDENT);
      })
      .finally(() => clearTimeout(timer));

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Initializing Student Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <Sidebar role="student" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <TopHeader user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav role="student" />

      {/* Floating Demo Role Switcher */}
      <DemoSwitcher />
    </div>
  );
}
