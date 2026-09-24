'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import LectureCard from '@/components/ui/LectureCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate, formatDayName } from '@/lib/utils';
import { User } from '@/lib/types';

export default function StudentTimetablePage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow' | 'week' | 'calendar'>('week');
  const [selectedDate, setSelectedDate] = useState('2026-09-24');
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Week days for the horizontal desktop view
  const weekDays = [
    { date: '2026-09-21', label: 'Mon', dayNum: '21' },
    { date: '2026-09-22', label: 'Tue', dayNum: '22' },
    { date: '2026-09-23', label: 'Wed', dayNum: '23' },
    { date: '2026-09-24', label: 'Thu', dayNum: '24' },
    { date: '2026-09-25', label: 'Fri', dayNum: '25' },
  ];

  const fetchTimetable = async (tab: string, dateStr: string) => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setUser(userData.user);

      if (userData.user) {
        let url = `/api/timetable?branchId=${userData.user.branchId}&semester=${userData.user.semester}&division=${userData.user.division}&studentId=${userData.user.id}`;

        if (tab === 'today') {
          url += `&view=today`;
        } else if (tab === 'tomorrow') {
          url += `&view=tomorrow`;
        } else if (tab === 'week') {
          url += `&view=week`;
        } else {
          url += `&date=${dateStr}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        setLectures(data.lectures || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable(activeTab, selectedDate);
  }, [activeTab, selectedDate]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Academic Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Dynamic timetable for {user?.department} • Sem {user?.semester} Div {user?.division}
          </p>
        </div>

        {/* View Switcher Tabs (Today, Tomorrow, This Week, Calendar) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
          {(['today', 'tomorrow', 'week', 'calendar'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'today') setSelectedDate('2026-09-24');
                if (tab === 'tomorrow') setSelectedDate('2026-09-25');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'week' ? 'This Week' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Date Picker if Calendar view */}
      {activeTab === 'calendar' && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-blue-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Pick Academic Date:
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Week Filter Chips for Quick Day Navigation on Mobile/Desktop */}
      {activeTab === 'week' && (
        <div className="grid grid-cols-5 gap-2">
          {weekDays.map((d) => {
            const isToday = d.date === '2026-09-24';
            return (
              <div
                key={d.date}
                className={`p-3 rounded-2xl text-center border transition-all ${
                  isToday
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider block ${isToday ? 'text-blue-100' : 'text-slate-400'}`}>
                  {d.label}
                </span>
                <span className="text-base sm:text-lg font-black block mt-0.5">
                  {d.dayNum}
                </span>
                {isToday && (
                  <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/20 text-white">
                    TODAY
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lecture Cards List / Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Querying verified campus timetable...</p>
        </div>
      ) : lectures.length === 0 ? (
        <div className="py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center card-3d">
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-500 mx-auto flex items-center justify-center text-2xl mb-3">
            🎓
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No lectures scheduled for this date.
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Enjoy your free academic study hours or prepare for upcoming laboratory evaluations!
          </p>
        </div>
      ) : activeTab === 'week' ? (
        // Grouped by Day for This Week
        <div className="space-y-6">
          {weekDays.map((day) => {
            const dayLectures = lectures.filter((l) => l.date === day.date);
            if (dayLectures.length === 0) return null;

            return (
              <div key={day.date} className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {day.label} — {formatDate(day.date)}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({dayLectures.length} {dayLectures.length === 1 ? 'class' : 'classes'})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dayLectures.map((lec) => (
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
                      attendanceStatus={lec.attendanceStatus}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Single Day View (Today / Tomorrow / Calendar Date)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lectures.map((lec) => (
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
              attendanceStatus={lec.attendanceStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
