'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import MobileNav from '@/components/layout/MobileNav';
import DemoSwitcher from '@/components/shared/DemoSwitcher';
import { User } from '@/lib/types';

const DEFAULT_ADMIN: User = {
  id: 'user_admin_1',
  name: 'Dr. Robert Sterling',
  email: 'dean.sterling@aits.edu',
  role: 'admin',
  department: 'Office of Academic Affairs',
  designation: 'Dean of Academic Administration',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) {
        setUser((prev) => prev || DEFAULT_ADMIN);
      }
    }, 1500);

    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.user && data.user.role === 'admin') {
          setUser(data.user);
        } else {
          // Default to primary admin user (Dean Robert Sterling)
          fetch('/api/auth/me?userId=user_admin_1')
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => {
              if (isMounted) {
                setUser(d?.user || DEFAULT_ADMIN);
              }
            })
            .catch(() => {
              if (isMounted) setUser((prev) => prev || DEFAULT_ADMIN);
            });
        }
      })
      .catch(() => {
        if (isMounted) setUser((prev) => prev || DEFAULT_ADMIN);
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
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Initializing Executive Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <TopHeader user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      <MobileNav role="admin" />
      <DemoSwitcher />
    </div>
  );
}
