'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Clock, Users, CheckCircle, XCircle, AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import TiltCard from '../3d/TiltCard';
import StatusBadge from './StatusBadge';
import { AttendanceSession, Lecture, Subject, User } from '@/lib/types';

interface QRDisplayCardProps {
  lecture: Lecture & { subject?: Subject };
  professor: User;
  onRefreshSession?: () => void;
}

export default function QRDisplayCard({ lecture, professor, onRefreshSession }: QRDisplayCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(120);
  const [isExpired, setIsExpired] = useState(false);
  const [liveStats, setLiveStats] = useState({
    totalStudents: 12,
    present: 1,
    absent: 11,
    pending: 11,
  });
  const [liveStudents, setLiveStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Initialize or fetch active session
  const initSession = async () => {
    try {
      setLoading(true);
      // Create fresh QR session with 120s TTL
      const res = await fetch('/api/attendance/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: lecture.id,
          professorId: professor.id,
        }),
      });
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setRemainingSeconds(120);
        setIsExpired(false);
      }
    } catch (err) {
      console.error('Error starting QR session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, [lecture.id]);

  // Render QR Code onto canvas
  useEffect(() => {
    if (canvasRef.current && session?.sessionToken && !isExpired) {
      QRCode.toCanvas(
        canvasRef.current,
        session.sessionToken,
        {
          width: 260,
          margin: 1.5,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error(error);
        }
      );
    }
  }, [session?.sessionToken, isExpired]);

  // Real-time Countdown timer
  useEffect(() => {
    if (!session || isExpired) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(session.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expiry - now) / 1000));

      setRemainingSeconds(diff);

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isExpired]);

  // Poll live attendance feed every 3 seconds
  useEffect(() => {
    if (!session) return;

    const pollLiveFeed = async () => {
      try {
        const res = await fetch(`/api/attendance/session?lectureId=${lecture.id}`);
        const data = await res.json();
        if (data.stats) {
          setLiveStats(data.stats);
        }
        if (data.students) {
          setLiveStudents(data.students);
        }
        if (data.session?.isExpired) {
          setIsExpired(true);
        }
      } catch (err) {
        console.error('Error polling live attendance:', err);
      }
    };

    pollLiveFeed();
    const pollInterval = setInterval(pollLiveFeed, 3000);
    return () => clearInterval(pollInterval);
  }, [session, lecture.id]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyToken = () => {
    if (!session?.sessionToken) return;
    navigator.clipboard.writeText(session.sessionToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: QR Code Display & Countdown Timer */}
      <TiltCard className="lg:col-span-6 p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Header */}
        <div className="mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
            Live Dynamic Session
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {lecture.subject?.name || 'Class Lecture'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Division {lecture.division} • Room {lecture.roomId} • {lecture.startTime} - {lecture.endTime}
          </p>
        </div>

        {/* QR Code Canvas or Expired UI */}
        <div className="relative my-3 p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner flex items-center justify-center min-h-[290px] min-w-[290px]">
          {isExpired ? (
            <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Attendance Session Expired
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[230px] mt-1 mb-5">
                The 2-minute server-side token has expired to prevent QR sharing.
              </p>
              <button
                onClick={initSession}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate New Dynamic QR</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <canvas ref={canvasRef} className="rounded-xl shadow-xs" />
              {/* Subtle pulsing scanner corner lines */}
              <div className="absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 border-blue-600 rounded-tl-lg" />
              <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-blue-600 rounded-tr-lg" />
              <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-blue-600 rounded-bl-lg" />
              <div className="absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 border-blue-600 rounded-br-lg" />
            </div>
          )}
        </div>

        {/* Highly Visible Countdown Timer */}
        <div className="mt-3 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <Clock className={`w-5 h-5 ${isExpired ? 'text-amber-500' : 'text-blue-500'}`} />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
              Session Remaining
            </span>
          </div>

          <div
            className={`text-4xl sm:text-5xl font-mono font-extrabold tracking-tight mt-1 ${
              isExpired
                ? 'text-rose-500 line-through'
                : remainingSeconds <= 30
                ? 'text-amber-500 animate-pulse'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {formatCountdown(remainingSeconds)}
          </div>

          {!isExpired && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Token:</span>
              <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                {session?.sessionToken}
              </code>
              <button
                onClick={handleCopyToken}
                className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Copy token"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {!isExpired && (
            <button
              onClick={initSession}
              className="mt-4 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rotate / Refresh QR Early</span>
            </button>
          )}
        </div>
      </TiltCard>

      {/* Right Column: Live Attendance Stats & Real-Time Roster */}
      <div className="lg:col-span-6 space-y-6">
        {/* Live Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Students</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {liveStats.totalStudents}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 shadow-sm text-center">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              Present
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
              {liveStats.present}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 shadow-sm text-center">
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase">
              Absent
            </span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
              {liveStats.absent}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 shadow-sm text-center">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
              Pending
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
              {liveStats.pending}
            </p>
          </div>
        </div>

        {/* Live Student Feed */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Attendance Feed
              </h4>
            </div>
            <span className="text-xs text-slate-500">Auto-updating (3s)</span>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[360px] overflow-y-auto pr-1">
            {liveStudents.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Loading class students roster...
              </div>
            ) : (
              liveStudents.map((st) => (
                <div key={st.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-[11px] shrink-0">
                      {st.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {st.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {st.enrollmentNo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {st.markedAt && (
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        {new Date(st.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                    <StatusBadge status={st.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
