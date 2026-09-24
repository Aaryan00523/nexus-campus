'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Filter, Clock, MapPin, Users, Plus, ShieldCheck } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

export default function AdminTimetablePage() {
  const [lectures, setLectures] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState('branch_cs');
  const [selectedSemester, setSelectedSemester] = useState(3);
  const [selectedDivision, setSelectedDivision] = useState('A');
  const [loading, setLoading] = useState(true);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/timetable?branchId=${selectedBranch}&semester=${selectedSemester}&division=${selectedDivision}&view=week`
      );
      const data = await res.json();
      setLectures(data.lectures || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [selectedBranch, selectedSemester, selectedDivision]);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Master University Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global schedule oversight with automated multi-resource conflict prevention.
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-xs">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-2 py-1 bg-transparent font-bold text-slate-900 dark:text-white"
          >
            <option value="branch_cs">Computer Science (CSE)</option>
            <option value="branch_ece">Electronics (ECE)</option>
          </select>
          <span>•</span>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
            className="px-2 py-1 bg-transparent font-bold text-slate-900 dark:text-white"
          >
            <option value="3">Semester 3</option>
            <option value="5">Semester 5</option>
          </select>
          <span>•</span>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="px-2 py-1 bg-transparent font-bold text-slate-900 dark:text-white"
          >
            <option value="A">Division A</option>
            <option value="B">Division B</option>
          </select>
        </div>
      </div>

      {/* Grid of Scheduled Classes */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Querying campus timetable matrix...
          </div>
        ) : lectures.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No classes scheduled for this cohort.
          </div>
        ) : (
          lectures.map((lec) => (
            <div
              key={lec.id}
              className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-3d"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs flex flex-col items-center justify-center shrink-0">
                  <span>{lec.startTime}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{lec.endTime}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {lec.subject?.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold">
                      {lec.subject?.code}
                    </span>
                    <StatusBadge status={lec.status} size="sm" />
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatDate(lec.date)}
                    </span>
                    <span>Faculty: <strong>{lec.professor?.name}</strong></span>
                    <span>Venue: <strong>{lec.room?.code}</strong> ({lec.room?.name})</span>
                    <span>Cohort: <strong>Div {lec.division}</strong></span>
                  </div>
                </div>
              </div>

              <span className="font-mono text-[10px] text-slate-400 self-end sm:self-center">
                {lec.id}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
