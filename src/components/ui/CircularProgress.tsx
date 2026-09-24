import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  threshold?: number;
  sublabel?: string;
  className?: string;
}

export default function CircularProgress({
  value,
  size = 160,
  strokeWidth = 12,
  threshold = 75,
  sublabel = 'Overall Attendance',
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  const isLow = clampedValue < threshold;

  // Gradient ID
  const gradientId = `grad-${Math.floor(value * 10)}`;

  return (
    <div className={cn('relative inline-flex flex-col items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isLow ? (
              <>
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#10b981" />
              </>
            )}
          </linearGradient>
          <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-800"
          fill="none"
        />

        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          filter={`url(#glow-${gradientId})`}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>

      {/* Central Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <div className="flex items-baseline">
          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {clampedValue.toFixed(1)}
          </span>
          <span className="text-lg font-bold text-slate-500 dark:text-slate-400 ml-0.5">%</span>
        </div>
        {sublabel && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 max-w-[110px] leading-tight">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
