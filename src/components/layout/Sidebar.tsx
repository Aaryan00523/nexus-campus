'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CheckCheck,
  QrCode,
  FileText,
  AlertCircle,
  BarChart3,
  User as UserIcon,
  Settings,
  Users,
  ShieldAlert,
  Building,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  role: UserRole;
  collegeName?: string;
}

export default function Sidebar({ role, collegeName = 'AITS University' }: SidebarProps) {
  const pathname = usePathname();

  const studentLinks = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'Timetable', href: '/student/timetable', icon: Calendar },
    { label: 'Attendance', href: '/student/attendance', icon: CheckCheck },
    { label: 'QR Scanner', href: '/student/qr-scan', icon: QrCode },
    { label: 'Leaves', href: '/student/leaves', icon: FileText },
    { label: 'Corrections', href: '/student/correction', icon: AlertCircle },
    { label: 'Profile', href: '/student/profile', icon: UserIcon },
  ];

  const professorLinks = [
    { label: 'Dashboard', href: '/professor', icon: LayoutDashboard },
    { label: 'Live QR Session', href: '/professor/qr-session', icon: QrCode },
    { label: 'Timetable', href: '/professor/timetable', icon: Calendar },
    { label: 'Manual Sheet', href: '/professor/manual-attendance', icon: CheckCheck },
    { label: 'Leave Reviews', href: '/professor/leaves', icon: FileText },
    { label: 'Corrections', href: '/professor/corrections', icon: AlertCircle },
    { label: 'Reports & Export', href: '/professor/reports', icon: BarChart3 },
    { label: 'Faculty Profile', href: '/professor/profile', icon: UserIcon },
  ];

  const adminLinks = [
    { label: 'Executive Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users & Faculty', href: '/admin/users', icon: Users },
    { label: 'Academic Structure', href: '/admin/academic', icon: Building },
    { label: 'Campus Timetable', href: '/admin/timetable', icon: Calendar },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'University Settings', href: '/admin/settings', icon: Settings },
  ];

  const links =
    role === 'student' ? studentLinks : role === 'professor' ? professorLinks : adminLinks;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="block font-black text-sm text-slate-900 dark:text-white tracking-tight">
            NEXUS CAMPUS
          </span>
          <span className="block text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {role.toUpperCase()} OS
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </span>
        </div>

        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200',
                isActive
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/15'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-600 shadow-[0_0_8px_#3b82f6]" />
              )}
              <Icon
                className={cn(
                  'w-4 h-4 transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 m-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center">
        <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
          {collegeName}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">Automated Attendance Engine</p>
      </div>
    </aside>
  );
}
