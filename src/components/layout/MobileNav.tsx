'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CheckCheck,
  QrCode,
  Menu,
  X,
  FileText,
  AlertCircle,
  BarChart3,
  User as UserIcon,
  Settings,
  Users,
  Building,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  role: UserRole;
}

export default function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const getPrimaryTabs = () => {
    if (role === 'student') {
      return [
        { label: 'Home', href: '/student', icon: LayoutDashboard },
        { label: 'Schedule', href: '/student/timetable', icon: Calendar },
        { label: 'Scan QR', href: '/student/qr-scan', icon: QrCode, isFab: true },
        { label: 'Stats', href: '/student/attendance', icon: CheckCheck },
      ];
    }
    if (role === 'professor') {
      return [
        { label: 'Home', href: '/professor', icon: LayoutDashboard },
        { label: 'Schedule', href: '/professor/timetable', icon: Calendar },
        { label: 'Live QR', href: '/professor/qr-session', icon: QrCode, isFab: true },
        { label: 'Reports', href: '/professor/reports', icon: BarChart3 },
      ];
    }
    return [
      { label: 'Home', href: '/admin', icon: LayoutDashboard },
      { label: 'Timetable', href: '/admin/timetable', icon: Calendar },
      { label: 'Faculty', href: '/admin/users', icon: Users, isFab: true },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ];
  };

  const getSecondaryLinks = () => {
    if (role === 'student') {
      return [
        { label: 'Leave Applications', href: '/student/leaves', icon: FileText },
        { label: 'Attendance Correction', href: '/student/correction', icon: AlertCircle },
        { label: 'My Academic Profile', href: '/student/profile', icon: UserIcon },
      ];
    }
    if (role === 'professor') {
      return [
        { label: 'Manual Attendance Sheet', href: '/professor/manual-attendance', icon: CheckCheck },
        { label: 'Leave Review Center', href: '/professor/leaves', icon: FileText },
        { label: 'Correction Requests', href: '/professor/corrections', icon: AlertCircle },
        { label: 'Faculty Profile', href: '/professor/profile', icon: UserIcon },
      ];
    }
    return [
      { label: 'Academic Structure', href: '/admin/academic', icon: Building },
      { label: 'Audit Trail Logs', href: '/admin/audit-logs', icon: AlertCircle },
    ];
  };

  const tabs = getPrimaryTabs();
  const secondary = getSecondaryLinks();

  return (
    <>
      {/* Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          if (tab.isFab) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative -top-4 flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 group-active:scale-95 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 text-xs transition-colors',
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}

        {/* More Drawer Trigger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">More</span>
        </button>
      </nav>

      {/* Secondary Navigation Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          <div className="fixed inset-y-0 right-0 w-3/4 max-w-xs bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-2xl animate-fade-in border-l border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Menu
                </span>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-1">
                {secondary.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-blue-500" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[11px] text-slate-400">Nexus Campus Platform</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
