'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  QrCode,
  Users,
  FileText,
  BarChart3,
  ArrowRight,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import LectureCard from '@/components/ui/LectureCard';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { User } from '@/lib/types';

export default function ProfessorDashboard() {
  const [professor, setProfessor] = useState<User | null>(null);
  const [metrics, setMetrics] = useState({
    todayClassesCount: 4,
    upcomingClassesCount: 3,
    pendingLeavesCount: 2,
    averageAttendance: 84.6,
  });
  const [todayLectures, setTodayLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setProfessor(userData.user);

      if (userData.user) {
        const statsRes = await fetch(`/api/attendance/stats?professorId=${userData.user.id}`);
        const statsData = await statsRes.json();
        if (statsData.metrics) {
          setMetrics(statsData.metrics);
        }

        const ttRes = await fetch(
          `/api/timetable?view=today&professorId=${userData.user.id}`
        );
        const ttData = await ttRes.json();
        setTodayLectures(ttData.lectures || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const nextLecture = todayLectures.find((l) => l.status === 'scheduled') || todayLectures[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
              Faculty Workspace
            </span>
            <span className="text-xs text-slate-500">
              Thursday, 24 September 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Welcome, {professor?.name || 'Professor'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {professor?.designation} • {professor?.department} ({professor?.professorId})
          </p>
        </div>

        {/* Big Action: START ATTENDANCE for next lecture */}
        {nextLecture && (
          <Link
            href={`/professor/qr-session?lectureId=${nextLecture.id}`}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer card-3d group"
          >
            <QrCode className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <span className="block text-[10px] uppercase tracking-wider text-blue-200">
                Active Lecture Check-in
              </span>
              <span className="block font-black text-sm">START ATTENDANCE</span>
            </div>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Section 23: Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Today's Classes"
          value={metrics.todayClassesCount}
          subtitle="4 Division cohorts scheduled"
          icon={Calendar}
          iconColor="text-blue-500"
          badgeText="Active Roster"
          badgeVariant="info"
        />

        <MetricCard
          title="Average Attendance"
          value={`${metrics.averageAttendance}%`}
          subtitle="Across assigned subjects"
          icon={Users}
          iconColor="text-emerald-500"
          badgeText="High Standing"
          badgeVariant="success"
        />

        <MetricCard
          title="Pending Leaves"
          value={metrics.pendingLeavesCount}
          subtitle="Student applications requiring action"
          icon={FileText}
          iconColor="text-amber-500"
          badgeText="Needs Review"
          badgeVariant="warning"
          onClick={() => (window.location.href = '/professor/leaves')}
        />

        <MetricCard
          title="Upcoming Classes"
          value={metrics.upcomingClassesCount}
          subtitle="Scheduled this week"
          icon={Clock}
          iconColor="text-indigo-500"
          badgeText="On Schedule"
          badgeVariant="info"
        />
      </div>

      {/* Section 23 Next Lecture Prominent Card & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Next Assigned Lecture
              </span>
              <Link
                href="/professor/timetable"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Manage Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {nextLecture ? (
              <TiltCard className="p-6 border-blue-500/80 bg-gradient-to-br from-blue-500/[0.04] to-indigo-500/[0.04] shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-600 text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {nextLecture.startTime} — {nextLecture.endTime}
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {nextLecture.subject?.code}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Division {nextLecture.division} (Sem {nextLecture.semester})
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                      {nextLecture.subject?.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Venue: <strong>{nextLecture.room?.code}</strong> ({nextLecture.room?.name})
                    </p>
                    {nextLecture.topic && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-2">
                        "{nextLecture.topic}"
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 shrink-0">
                    <StatusBadge status={nextLecture.status} size="md" />
                    <Link
                      href={`/professor/qr-session?lectureId=${nextLecture.id}`}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>START ATTENDANCE</span>
                    </Link>
                  </div>
                </div>
              </TiltCard>
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No upcoming lectures scheduled today.
                </p>
              </div>
            )}
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/professor/qr-session"
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex flex-col gap-1 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 card-3d"
            >
              <QrCode className="w-5 h-5 text-blue-500 mb-1" />
              <span>Dynamic QR Hub</span>
              <span className="text-[10px] text-slate-400 font-normal">2-Min session token</span>
            </Link>

            <Link
              href="/professor/manual-attendance"
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex flex-col gap-1 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 card-3d"
            >
              <Users className="w-5 h-5 text-emerald-500 mb-1" />
              <span>Manual Roll Call</span>
              <span className="text-[10px] text-slate-400 font-normal">Audit-logged overrides</span>
            </Link>

            <Link
              href="/professor/leaves"
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex flex-col gap-1 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 card-3d"
            >
              <FileText className="w-5 h-5 text-amber-500 mb-1" />
              <span>Review Leaves</span>
              <span className="text-[10px] text-slate-400 font-normal">Medical & Duty leave</span>
            </Link>

            <Link
              href="/professor/reports"
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex flex-col gap-1 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 card-3d"
            >
              <BarChart3 className="w-5 h-5 text-purple-500 mb-1" />
              <span>Export CSV</span>
              <span className="text-[10px] text-slate-400 font-normal">Division registers</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Attendance Compliance Overview */}
        <TiltCard className="lg:col-span-4 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Department Compliance
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Normal Range
              </span>
            </div>

            <div className="py-6 text-center">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                {metrics.averageAttendance}%
              </span>
              <p className="text-xs text-slate-500 mt-1">Average Student Turnout</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-300">Engineering Math III</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">86.2%</span>
              </div>
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-600 dark:text-slate-300">Algorithms & Complexity</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">83.1%</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Automated conflict detection active for all room assignments.
          </div>
        </TiltCard>
      </div>

      {/* Today's Schedule Table */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Today's Teaching Schedule
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayLectures.map((lec) => (
            <LectureCard
              key={lec.id}
              id={lec.id}
              subjectCode={lec.subject?.code}
              subjectName={lec.subject?.name || 'Class Lecture'}
              professorName={lec.professor?.name || 'Faculty Member'}
              roomCode={lec.room?.code || lec.roomId}
              roomName={lec.room?.name}
              startTime={lec.startTime}
              endTime={lec.endTime}
              topic={lec.topic}
              status={lec.status}
              onActionClick={() =>
                (window.location.href = `/professor/qr-session?lectureId=${lec.id}`)
              }
              actionLabel="Launch QR"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
