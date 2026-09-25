'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  QrCode,
  FileText,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import LectureCard from '@/components/ui/LectureCard';
import CircularProgress from '@/components/ui/CircularProgress';
import QRScannerModal from '@/components/ui/QRScannerModal';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { OverallAttendanceSummary, User } from '@/lib/types';

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [attendance, setAttendance] = useState<OverallAttendanceSummary | null>(null);
  const [todayLectures, setTodayLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = userRes.ok ? await userRes.json() : null;
      let currentUser = userData?.user;
      if (!currentUser) {
        const fbRes = await fetch('/api/auth/me?userId=stud_1');
        const fbData = fbRes.ok ? await fbRes.json() : null;
        currentUser = fbData?.user;
      }
      setUser(currentUser);

      if (currentUser) {
        // Fetch Attendance stats
        const attRes = await fetch(`/api/attendance/stats?studentId=${currentUser.id}`);
        const attData = attRes.ok ? await attRes.json() : null;
        if (attData?.summary) {
          setAttendance(attData.summary);
        }

        // Fetch Today's timetable
        const ttRes = await fetch(
          `/api/timetable?view=today&branchId=${currentUser.branchId}&semester=${currentUser.semester}&division=${currentUser.division}&studentId=${currentUser.id}`
        );
        const ttData = ttRes.ok ? await ttRes.json() : null;
        setTodayLectures(ttData?.lectures || []);
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
      {/* Welcome Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              Student Terminal
            </span>
            <span className="text-xs text-slate-500">
              Thursday, 24 September 2026
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Good Morning, {user?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user?.department} • Sem {user?.semester} Div {user?.division} ({user?.enrollmentNo})
          </p>
        </div>

        {/* Quick QR Scanner Trigger */}
        {user && <QRScannerModal student={user} onSuccess={loadData} />}
      </div>

      {/* Low Attendance Notice Banner (Section 15: Low Attendance Warning & Recovery Logic) */}
      {attendance?.isBelowThreshold && (
        <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 card-3d animate-shake">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Attendance Shortage Warning
                  </h4>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Below {attendance.threshold}% Minimum
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Your cumulative attendance is <strong>{attendance.overallPercentage.toFixed(1)}%</strong>. You need to attend approximately{' '}
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 font-black text-slate-900 dark:text-white">
                    {attendance.consecutiveRequiredToRecover} consecutive lectures
                  </span>{' '}
                  without absence to reach the college minimum of {attendance.threshold}%.
                </p>
              </div>
            </div>

            <Link
              href="/student/attendance"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 shadow-sm"
            >
              View Recovery Plan →
            </Link>
          </div>
        </div>
      )}

      {/* Section 9: Quick Statistics 3D Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Overall Attendance"
          value={attendance ? `${attendance.overallPercentage.toFixed(1)}%` : '--%'}
          subtitle={`Formula: Present / (Total - Leave)`}
          icon={CheckCircle2}
          iconColor="text-blue-500"
          badgeText={attendance?.isBelowThreshold ? 'Warning' : 'Eligible'}
          badgeVariant={attendance?.isBelowThreshold ? 'danger' : 'success'}
        />

        <MetricCard
          title="Today's Lectures"
          value={todayLectures.length}
          subtitle={`${todayLectures.filter((l) => l.status === 'conducted').length} Completed, ${
            todayLectures.filter((l) => l.status === 'scheduled').length
          } Remaining`}
          icon={Calendar}
          iconColor="text-indigo-500"
          badgeText="Active Day"
          badgeVariant="info"
        />

        <MetricCard
          title="Pending Leaves"
          value={1}
          subtitle="Medical request awaiting approval"
          icon={FileText}
          iconColor="text-purple-500"
          badgeText="In Review"
          badgeVariant="warning"
        />

        <MetricCard
          title="Next Lecture"
          value={nextLecture?.startTime || '10:00 AM'}
          subtitle={nextLecture?.subject?.name || 'Engineering Mathematics'}
          icon={Clock}
          iconColor="text-sky-500"
          badgeText={nextLecture?.room?.code || 'Room C-204'}
          badgeVariant="info"
        />
      </div>

      {/* Next Lecture Prominent Card + Overall Visual Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Next Lecture Card (Section 10) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current & Next Scheduled Class
              </span>
              <Link
                href="/student/timetable"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {nextLecture ? (
              <LectureCard
                id={nextLecture.id}
                subjectCode={nextLecture.subject?.code}
                subjectName={nextLecture.subject?.name || 'Class Lecture'}
                professorName={nextLecture.professor?.name || 'Faculty Member'}
                roomCode={nextLecture.room?.code || nextLecture.roomId}
                roomName={nextLecture.room?.name}
                startTime={nextLecture.startTime}
                endTime={nextLecture.endTime}
                topic={nextLecture.topic}
                status={nextLecture.status}
                attendanceStatus={nextLecture.attendanceStatus}
                isNext={true}
              />
            ) : (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No more lectures scheduled for today!
                </p>
              </div>
            )}
          </div>

          {/* Quick Action Chips */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Link
              href="/student/qr-scan"
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex items-center gap-2.5 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 card-3d"
            >
              <QrCode className="w-4 h-4 text-blue-500" />
              <span>Camera QR Check-in</span>
            </Link>

            <Link
              href="/student/leaves"
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex items-center gap-2.5 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 card-3d"
            >
              <FileText className="w-4 h-4 text-purple-500" />
              <span>Apply for Leave</span>
            </Link>

            <Link
              href="/student/correction"
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex items-center gap-2.5 transition-all text-xs font-semibold text-slate-800 dark:text-slate-200 card-3d col-span-2 sm:col-span-1"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Attendance Correction</span>
            </Link>
          </div>
        </div>

        {/* Circular Progress & Academic Standing */}
        <TiltCard className="lg:col-span-4 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Attendance Health Index
          </span>

          <CircularProgress
            value={attendance?.overallPercentage || 87.5}
            threshold={attendance?.threshold || 75}
            size={180}
            strokeWidth={14}
            sublabel="Verified Ratio"
          />

          <div className="mt-5 w-full pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Present</span>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm mt-0.5">
                {attendance?.presentCount || 0}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Leaves</span>
              <p className="font-extrabold text-blue-600 dark:text-blue-400 text-sm mt-0.5">
                {attendance?.approvedLeaveCount || 0}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold">Absent</span>
              <p className="font-extrabold text-rose-600 dark:text-rose-400 text-sm mt-0.5">
                {attendance?.absentCount || 0}
              </p>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Section 11: Today's Timeline-based Timetable */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Today's Schedule & Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Classes scheduled for Division {user?.division} on Thursday, Sep 24
            </p>
          </div>

          <Link
            href="/student/timetable"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Weekly View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {todayLectures.map((lec, idx) => (
            <div
              key={lec.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 card-3d"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="flex flex-col items-center justify-center w-14 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold shrink-0">
                  <span>{lec.startTime}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{lec.endTime}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lec.subject?.name}
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {lec.subject?.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {lec.professor?.name} • {lec.room?.code} ({lec.room?.name})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {lec.attendanceStatus && lec.attendanceStatus !== 'upcoming' && lec.attendanceStatus !== 'not_marked' ? (
                  <StatusBadge status={lec.attendanceStatus} size="sm" />
                ) : (
                  <StatusBadge status={lec.status} size="sm" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
