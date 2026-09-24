import React from 'react';
import { Clock, MapPin, User as UserIcon, BookOpen, Sparkles } from 'lucide-react';
import TiltCard from '../3d/TiltCard';
import StatusBadge from './StatusBadge';
import { formatTime12, cn } from '@/lib/utils';
import { AttendanceStatus, LectureStatus } from '@/lib/types';

interface LectureCardProps {
  id: string;
  subjectCode?: string;
  subjectName: string;
  professorName: string;
  roomCode: string;
  roomName?: string;
  startTime: string;
  endTime: string;
  date?: string;
  topic?: string;
  status: LectureStatus;
  attendanceStatus?: AttendanceStatus | string;
  isNext?: boolean;
  onActionClick?: () => void;
  actionLabel?: string;
  className?: string;
}

export default function LectureCard({
  id,
  subjectCode,
  subjectName,
  professorName,
  roomCode,
  roomName,
  startTime,
  endTime,
  topic,
  status,
  attendanceStatus,
  isNext = false,
  onActionClick,
  actionLabel,
  className,
}: LectureCardProps) {
  return (
    <TiltCard
      maxTilt={isNext ? 8 : 4}
      glowEffect={isNext}
      className={cn(
        'p-5 transition-all duration-300 relative overflow-hidden',
        isNext
          ? 'border-blue-500/80 bg-gradient-to-br from-blue-500/[0.04] via-transparent to-indigo-500/[0.04] shadow-lg ring-1 ring-blue-500/20'
          : 'border-slate-200/90 dark:border-slate-800/90',
        className
      )}
    >
      {/* Visual Accent Bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-1',
          isNext
            ? 'bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500'
            : 'bg-slate-200 dark:bg-slate-800'
        )}
      />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          {/* Header & Timing */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-1 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {startTime} — {endTime}
              </span>
            </div>

            {subjectCode && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {subjectCode}
              </span>
            )}

            {isNext && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white animate-pulse">
                <Sparkles className="w-3 h-3" />
                NEXT LECTURE
              </span>
            )}
          </div>

          {/* Subject Title */}
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-snug">
            {subjectName}
          </h4>

          {/* Topic description if present */}
          {topic && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 italic">
              {topic}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="self-start sm:self-center">
          {attendanceStatus && attendanceStatus !== 'upcoming' && attendanceStatus !== 'not_marked' ? (
            <StatusBadge status={attendanceStatus} size="sm" />
          ) : (
            <StatusBadge status={status} size="sm" />
          )}
        </div>
      </div>

      {/* Footer Info: Professor & Room */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>{professorName}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span title={roomName || roomCode}>{roomCode}</span>
          </div>
        </div>

        {onActionClick && (
          <button
            onClick={onActionClick}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 ml-auto"
          >
            <span>{actionLabel || 'Details'}</span>
            <span>→</span>
          </button>
        )}
      </div>
    </TiltCard>
  );
}
