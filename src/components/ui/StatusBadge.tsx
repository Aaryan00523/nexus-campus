import React from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: AttendanceStatus | 'conducted' | 'scheduled' | 'cancelled' | 'pending' | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export default function StatusBadge({
  status,
  size = 'md',
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const norm = status?.toLowerCase();

  let label = status;
  let bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/50';
  let IconComponent = Clock;

  switch (norm) {
    case 'present':
      label = 'Present';
      bgClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      IconComponent = CheckCircle2;
      break;
    case 'absent':
      label = 'Absent';
      bgClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      IconComponent = XCircle;
      break;
    case 'approved_leave':
    case 'approved leave':
      label = 'Approved Leave';
      bgClass = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      IconComponent = ShieldCheck;
      break;
    case 'pending':
      label = 'Pending';
      bgClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      IconComponent = Clock;
      break;
    case 'conducted':
      label = 'Conducted';
      bgClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      IconComponent = CheckCircle2;
      break;
    case 'scheduled':
    case 'upcoming':
      label = 'Upcoming';
      bgClass = 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
      IconComponent = Calendar;
      break;
    case 'cancelled':
      label = 'Cancelled';
      bgClass = 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20';
      IconComponent = AlertCircle;
      break;
    default:
      label = status;
      bgClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300/40';
      IconComponent = Clock;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-medium px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-xs transition-colors font-medium',
        bgClass,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      <span>{label}</span>
    </span>
  );
}
