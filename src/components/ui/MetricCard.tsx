import React from 'react';
import { LucideIcon } from 'lucide-react';
import TiltCard from '../3d/TiltCard';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  onClick?: () => void;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-500',
  badgeText,
  badgeVariant = 'info',
  className,
  onClick,
}: MetricCardProps) {
  const badgeStyles = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  };

  return (
    <TiltCard
      glowEffect
      onClick={onClick}
      className={cn(
        'p-5 transition-all duration-300',
        onClick ? 'cursor-pointer hover:border-blue-500/50' : '',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>
            {badgeText && (
              <span
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                  badgeStyles[badgeVariant]
                )}
              >
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5">{subtitle}</p>
          )}
        </div>

        <div
          className={cn(
            'p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60',
            iconColor
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </TiltCard>
  );
}
