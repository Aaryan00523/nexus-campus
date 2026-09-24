'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { QrCode, RefreshCw, Calendar, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import QRDisplayCard from '@/components/ui/QRDisplayCard';
import { Lecture, User } from '@/lib/types';

export default function ProfessorQrSessionPage() {
  const searchParams = useSearchParams();
  const requestedLectureId = searchParams.get('lectureId');

  const [professor, setProfessor] = useState<User | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setProfessor(userData.user);

      if (userData.user) {
        const ttRes = await fetch(`/api/timetable?view=all&professorId=${userData.user.id}`);
        const ttData = await ttRes.json();
        const profLectures = ttData.lectures || [];
        setLectures(profLectures);

        if (requestedLectureId) {
          const match = profLectures.find((l: any) => l.id === requestedLectureId);
          setSelectedLecture(match || profLectures[0]);
        } else if (profLectures.length > 0) {
          // Select today's next lecture or first available
          const todayNext = profLectures.find((l: any) => l.date === '2026-09-24' && l.status === 'scheduled');
          setSelectedLecture(todayNext || profLectures[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [requestedLectureId]);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header and Lecture Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/professor"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Live Dynamic QR Attendance Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Project this screen in the classroom. Students scan the temporary QR with the Nexus mobile scanner.
          </p>
        </div>

        {/* Lecture Selection Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500">Class:</span>
          <select
            value={selectedLecture?.id || ''}
            onChange={(e) => {
              const match = lectures.find((l) => l.id === e.target.value);
              if (match) setSelectedLecture(match);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white shadow-xs focus:ring-1 focus:ring-blue-500"
          >
            {lectures.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.date} • {l.subject?.code} ({l.startTime}-{l.endTime}) - Div {l.division}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main QR Display & Live Feed Component */}
      {loading || !selectedLecture || !professor ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Initializing dynamic attendance session...</p>
        </div>
      ) : (
        <QRDisplayCard
          key={selectedLecture.id}
          lecture={selectedLecture}
          professor={professor}
          onRefreshSession={loadData}
        />
      )}
    </div>
  );
}
