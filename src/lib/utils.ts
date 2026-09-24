import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDayName(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } catch {
    return '';
  }
}

export function formatTime12(time24: string): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${period}`;
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'present':
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        badge: 'bg-emerald-500',
        label: 'Present',
      };
    case 'absent':
      return {
        bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        badge: 'bg-rose-500',
        label: 'Absent',
      };
    case 'approved_leave':
      return {
        bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        badge: 'bg-blue-500',
        label: 'Approved Leave',
      };
    case 'pending':
      return {
        bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        badge: 'bg-amber-500',
        label: 'Pending',
      };
    case 'conducted':
      return {
        bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        badge: 'bg-emerald-500',
        label: 'Conducted',
      };
    case 'scheduled':
      return {
        bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        badge: 'bg-sky-500',
        label: 'Upcoming',
      };
    case 'cancelled':
      return {
        bg: 'bg-zinc-500/10 text-zinc-500 dark:text-zinc-400 border-zinc-500/20',
        badge: 'bg-zinc-400',
        label: 'Cancelled',
      };
    default:
      return {
        bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        badge: 'bg-slate-500',
        label: status,
      };
  }
}
