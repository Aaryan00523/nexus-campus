'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCheck,
  AlertTriangle,
  FileText,
  Clock,
  ChevronDown,
  Info,
  Calendar,
  Sparkles,
} from 'lucide-react';
import CircularProgress from '@/components/ui/CircularProgress';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { OverallAttendanceSummary, SubjectAttendanceSummary, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function StudentAttendancePage() {
  const [user, setUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<OverallAttendanceSummary | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setUser(userData.user);

      if (userData.user) {
        const attRes = await fetch(`/api/attendance/stats?studentId=${userData.user.id}`);
        const attData = await attRes.json();
        setAttendance(attData.summary);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const filteredSubjects = attendance?.subjects.filter((s) => {
    if (selectedSubjectFilter === 'all') return true;
    if (selectedSubjectFilter === 'low') return s.percentage < (attendance.threshold || 75);
    return s.subjectId === selectedSubjectFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Attendance Analytics & Verification
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ground-truth records calculated via official university formula:
          <code className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-xs">
            Present / (Conducted - ApprovedLeave) × 100
          </code>
        </p>
      </div>

      {/* Top Section: Overall Attendance Semi-3D Hero Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <TiltCard className="lg:col-span-5 p-6 sm:p-8 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Cumulative Academic Ratio
          </span>

          <CircularProgress
            value={attendance?.overallPercentage || 0}
            threshold={attendance?.threshold || 75}
            size={200}
            strokeWidth={16}
            sublabel="Verified Ratio"
          />

          <div className="mt-6 w-full grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center text-xs">
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Present</p>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-base mt-0.5">
                {attendance?.presentCount || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Leave Credit</p>
              <p className="font-extrabold text-blue-600 dark:text-blue-400 text-base mt-0.5">
                {attendance?.approvedLeaveCount || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] uppercase font-bold">Absences</p>
              <p className="font-extrabold text-rose-600 dark:text-rose-400 text-base mt-0.5">
                {attendance?.absentCount || 0}
              </p>
            </div>
          </div>
        </TiltCard>

        {/* Breakdown & Recovery Projection */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          {/* Recovery Calculator Card (Section 15) */}
          <TiltCard
            className={`p-6 border ${
              attendance?.isBelowThreshold
                ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/[0.04] to-rose-500/[0.04]'
                : 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.03] to-blue-500/[0.03]'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  attendance?.isBelowThreshold
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {attendance?.isBelowThreshold ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : (
                  <CheckCheck className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {attendance?.isBelowThreshold
                      ? 'Attendance Shortage Remediation'
                      : 'Exam Eligibility Status: Cleared'}
                  </h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      attendance?.isBelowThreshold
                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    }`}
                  >
                    Req: {attendance?.threshold}%
                  </span>
                </div>

                {attendance?.isBelowThreshold ? (
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                    <p>
                      Your attendance is currently <strong>{attendance.overallPercentage.toFixed(1)}%</strong>, which is below the minimum mandatory threshold of {attendance.threshold}%.
                    </p>
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200">
                      <p className="font-bold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Remediation Target:
                      </p>
                      <p className="mt-0.5">
                        You need to attend approximately{' '}
                        <strong className="text-sm font-black underline">
                          {attendance.consecutiveRequiredToRecover} consecutive lectures
                        </strong>{' '}
                        without missing any to restore good academic standing.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    You have maintained an exemplary attendance ratio of{' '}
                    <strong>{attendance?.overallPercentage.toFixed(1)}%</strong>. You are currently in compliance with all semester academic examination criteria.
                  </p>
                )}
              </div>
            </div>
          </TiltCard>

          {/* Quick Guidance Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Mandatory Leave Credit Policy</span>
            </div>
            <p className="leading-relaxed">
              When a faculty member approves an official leave application, that lecture is subtracted from the conducted denominator (not added as present). This ensures student illness or official college representation never degrades your percentage.
            </p>
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Cards Section (Section 14) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Subject-Wise Attendance Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Individual class standing, conducted sessions, and historic logs
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs self-start sm:self-auto">
            <button
              onClick={() => setSelectedSubjectFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedSubjectFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Subjects
            </button>
            <button
              onClick={() => setSelectedSubjectFilter('low')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                selectedSubjectFilter === 'low'
                  ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Shortage Only
            </button>
          </div>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects?.map((sub) => {
            const isExpanded = expandedSubject === sub.subjectId;
            const isLow = sub.percentage < (attendance?.threshold || 75);

            return (
              <TiltCard
                key={sub.subjectId}
                className={`p-5 transition-all ${
                  isLow
                    ? 'border-amber-500/40'
                    : 'border-slate-200/90 dark:border-slate-800/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold">
                      {sub.subjectCode}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                      {sub.subjectName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{sub.professorName}</p>
                  </div>

                  {/* Percentage Chip */}
                  <div className="text-right">
                    <span
                      className={`text-xl sm:text-2xl font-black ${
                        isLow ? 'text-rose-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {sub.percentage.toFixed(1)}%
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">Attendance</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isLow
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, sub.percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Metrics Breakdown (Present, Absent, Leave) */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-1 text-center text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px]">Conducted</span>
                    <p className="font-bold text-slate-900 dark:text-white">{sub.totalConducted}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Present</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{sub.presentCount}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Leave</span>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{sub.approvedLeaveCount}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">Absent</span>
                    <p className="font-bold text-rose-600 dark:text-rose-400">{sub.absentCount}</p>
                  </div>
                </div>

                {/* Shortage indicator if low */}
                {isLow && sub.consecutiveRequiredToRecover > 0 && (
                  <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200">
                    Must attend <strong>{sub.consecutiveRequiredToRecover} consecutive classes</strong> to reach 75%.
                  </div>
                )}

                {/* Toggle Detailed Lecture Logs */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setExpandedSubject(isExpanded ? null : sub.subjectId)}
                    className="w-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center justify-between py-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Session History' : 'View Session History'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
                      {sub.records.map((r, i) => (
                        <div key={i} className="py-2 flex items-center justify-between text-[11px]">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(r.date)}</span>
                            <span className="text-slate-400 ml-2 font-mono">{r.time} ({r.room})</span>
                          </div>
                          <StatusBadge status={r.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TiltCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
