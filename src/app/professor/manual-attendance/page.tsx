'use client';

import React, { useEffect, useState } from 'react';
import { CheckCheck, Users, Search, AlertCircle, CheckCircle2, History } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import TiltCard from '@/components/3d/TiltCard';
import { AttendanceStatus, Lecture, User } from '@/lib/types';

export default function ProfessorManualAttendancePage() {
  const [professor, setProfessor] = useState<User | null>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [lastAuditNotice, setLastAuditNotice] = useState<string | null>(null);

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

        if (profLectures.length > 0 && !selectedLectureId) {
          setSelectedLectureId(profLectures[0].id);
          fetchLectureRoster(profLectures[0].id);
        } else if (selectedLectureId) {
          fetchLectureRoster(selectedLectureId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLectureRoster = async (lecId: string) => {
    try {
      const res = await fetch(`/api/attendance/session?lectureId=${lecId}`);
      const data = await res.json();
      if (data.students) {
        setStudents(data.students);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLectureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedLectureId(id);
    fetchLectureRoster(id);
  };

  const handleUpdateStatus = async (studentId: string, newStatus: AttendanceStatus) => {
    if (!professor || !selectedLectureId) return;

    setSavingId(studentId);
    setLastAuditNotice(null);

    try {
      const res = await fetch('/api/attendance/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lectureId: selectedLectureId,
          studentId,
          status: newStatus,
          actorId: professor.id,
          actorName: professor.name,
          actorRole: professor.role,
        }),
      });

      if (res.ok) {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, status: newStatus } : s))
        );
        const st = students.find((s) => s.id === studentId);
        setLastAuditNotice(
          `Logged in audit trail: Updated ${st?.name || 'student'} to ${newStatus.toUpperCase()}`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingId(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header and Lecture Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manual Roll Call & Attendance Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review student presence, manually override marks, and maintain verifiable faculty audit trails.
          </p>
        </div>

        {/* Selected Lecture Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-slate-500">Lecture:</span>
          <select
            value={selectedLectureId}
            onChange={handleLectureChange}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white shadow-xs"
          >
            {lectures.map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.date} • {l.subject?.name} ({l.startTime}-{l.endTime}) - Div {l.division}
              </option>
            ))}
          </select>
        </div>
      </div>

      {lastAuditNotice && (
        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2 animate-fade-in">
          <History className="w-4 h-4 shrink-0" />
          <span>{lastAuditNotice}</span>
        </div>
      )}

      {/* Roster Sheet */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search enrollment or student name..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span>Enrolled Students: {students.length}</span>
            <span className="text-emerald-600">
              Present: {students.filter((s) => s.status === 'present').length}
            </span>
            <span className="text-rose-600">
              Absent: {students.filter((s) => s.status === 'absent').length}
            </span>
          </div>
        </div>

        {/* Table View (Section 20: Student ID | Name | Status) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Student ID / Enrollment</th>
                <th className="py-3.5 px-6">Student Full Name</th>
                <th className="py-3.5 px-6">Verification Source</th>
                <th className="py-3.5 px-6">Current Status</th>
                <th className="py-3.5 px-6 text-right">Modify Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No student records matching query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {st.enrollmentNo}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      {st.name}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 capitalize">
                      {st.markedBy ? st.markedBy.replace('_', ' ') : 'Unrecorded'}
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={st.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {/* Action Pill Group for Present / Absent / Approved Leave */}
                      <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                        <button
                          onClick={() => handleUpdateStatus(st.id, 'present')}
                          disabled={savingId === st.id}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            st.status === 'present'
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(st.id, 'absent')}
                          disabled={savingId === st.id}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            st.status === 'absent'
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-rose-500'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(st.id, 'approved_leave')}
                          disabled={savingId === st.id}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                            st.status === 'approved_leave'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-blue-500'
                          }`}
                        >
                          Leave
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
