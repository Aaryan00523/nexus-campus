'use client';

import React, { useEffect, useState } from 'react';
import { Building, BookOpen, MapPin, Calendar, Plus, CheckCircle2 } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import { AcademicHoliday, Branch, Division, Room, Subject } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminAcademicPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [holidays, setHolidays] = useState<AcademicHoliday[]>([]);

  useEffect(() => {
    // Fetch timetable week data to get current metadata
    fetch('/api/timetable?view=all')
      .then((r) => r.json())
      .then((d) => {
        if (d.holidays) setHolidays(d.holidays);
        const subMap = new Map();
        const roomMap = new Map();
        d.lectures?.forEach((l: any) => {
          if (l.subject) subMap.set(l.subject.id, l.subject);
          if (l.room) roomMap.set(l.room.id, l.room);
        });
        setSubjects(Array.from(subMap.values()));
        setRooms(Array.from(roomMap.values()));
      });

    setBranches([
      {
        id: 'branch_cs',
        code: 'CSE',
        name: 'Computer Science & Engineering',
        department: 'School of Computing Sciences',
      },
      {
        id: 'branch_ece',
        code: 'ECE',
        name: 'Electronics & Communication Engineering',
        department: 'School of Electrical & Communication Sciences',
      },
    ]);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Academic Structure & University Calendar
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Accredited branches, subject allocations, physical classrooms, and official college holidays.
        </p>
      </div>

      {/* Branches & Departments */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-500" />
          <span>Accredited Engineering Branches</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <TiltCard key={b.id} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {b.code}
                </span>
                <span className="text-xs text-emerald-600 font-bold">Active Program</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {b.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">{b.department}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Semesters: 1 through 8</span>
                <span>Divisions: A & B</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      {/* Classrooms & Labs */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <span>Instructional Classrooms & Laboratories</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1"
            >
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block font-mono">
                {r.code}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {r.name}
              </h4>
              <p className="text-xs text-slate-500">
                Capacity: <strong>{r.capacity} seats</strong>
              </p>
              <p className="text-[11px] text-slate-400">
                {r.building} • {r.floor}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Academic Calendar Holidays (Section 34) */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-500" />
          <span>Academic Calendar & College Holidays</span>
        </h3>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
          {holidays.map((h) => (
            <div key={h.id} className="p-4 sm:p-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                  {h.type === 'holiday' ? '🎉' : h.type === 'exam' ? '📝' : '⚡'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {h.title}
                  </h4>
                  <p className="text-slate-500">{h.description}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono font-bold text-slate-900 dark:text-white block">
                  {formatDate(h.date)}
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {h.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
