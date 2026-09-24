'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  MapPin,
  Users,
  ShieldAlert,
} from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { Lecture, Room, Subject, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ProfessorTimetablePage() {
  const [professor, setProfessor] = useState<User | null>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeLectureId, setActiveLectureId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    date: '2026-09-24',
    startTime: '10:00',
    endTime: '11:00',
    subjectId: 'subj_math',
    roomId: 'room_c204',
    branchId: 'branch_cs',
    semester: 3,
    division: 'A',
    topic: '',
    status: 'scheduled' as any,
  });

  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setProfessor(userData.user);

      if (userData.user) {
        const ttRes = await fetch(`/api/timetable?view=all&professorId=${userData.user.id}`);
        const ttData = await ttRes.json();
        setLectures(ttData.lectures || []);

        // Also fetch metadata (rooms, subjects)
        const roomsRes = await fetch('/api/timetable?view=week');
        const roomsData = await roomsRes.json();
        const extractedRooms = new Map();
        const extractedSubjects = new Map();

        roomsData.lectures?.forEach((l: any) => {
          if (l.room) extractedRooms.set(l.room.id, l.room);
          if (l.subject) extractedSubjects.set(l.subject.id, l.subject);
        });

        setRooms(Array.from(extractedRooms.values()));
        setSubjects(Array.from(extractedSubjects.values()));
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

  const openCreateModal = () => {
    setModalMode('create');
    setActiveLectureId(null);
    setConflictError(null);
    setFormData({
      date: '2026-09-25',
      startTime: '13:00',
      endTime: '14:00',
      subjectId: subjects[0]?.id || 'subj_math',
      roomId: rooms[0]?.id || 'room_c204',
      branchId: 'branch_cs',
      semester: 3,
      division: 'A',
      topic: 'Special Review Seminar on Algorithmic Design',
      status: 'scheduled',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lec: any) => {
    setModalMode('edit');
    setActiveLectureId(lec.id);
    setConflictError(null);
    setFormData({
      date: lec.date,
      startTime: lec.startTime,
      endTime: lec.endTime,
      subjectId: lec.subjectId,
      roomId: lec.roomId,
      branchId: lec.branchId,
      semester: lec.semester,
      division: lec.division,
      topic: lec.topic || '',
      status: lec.status,
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professor) return;

    setIsSubmitting(true);
    setConflictError(null);
    setSuccessMessage(null);

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/timetable/lecture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lecture: {
              ...formData,
              professorId: professor.id,
            },
            actor: {
              id: professor.id,
              name: professor.name,
              role: professor.role,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setConflictError(data.error || 'Conflict detected');
          return;
        }

        setSuccessMessage('Lecture scheduled successfully and broadcast to enrolled student timetables.');
      } else {
        const res = await fetch('/api/timetable/lecture', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: activeLectureId,
            updates: formData,
            actor: {
              id: professor.id,
              name: professor.name,
              role: professor.role,
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setConflictError(data.error || 'Conflict detected');
          return;
        }

        setSuccessMessage('Lecture details modified and timetable synced with audit trail.');
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setConflictError('Network or server error updating timetable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel and remove this lecture from the official calendar?')) return;
    try {
      const res = await fetch(`/api/timetable/lecture?id=${id}&actorId=${professor?.id}&actorName=${encodeURIComponent(professor?.name || '')}&actorRole=professor`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSuccessMessage('Lecture cancelled and removed from active schedule.');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Faculty Teaching Timetable
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Schedule lectures, adjust venues, and reschedule sessions with real-time room and professor conflict detection.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add / Schedule Lecture</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs opacity-60 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Timetable Table / Card Roster */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Assigned Teaching Sessions ({lectures.length})
          </span>
          <span className="text-xs text-slate-400">Autumn Semester 2026</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {lectures.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No lectures assigned or scheduled.
            </div>
          ) : (
            lectures.map((lec) => (
              <div
                key={lec.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex flex-col items-center justify-center font-mono font-bold text-xs shrink-0 border border-blue-500/20">
                    <span>{lec.startTime}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{lec.endTime}</span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {lec.subject?.name}
                      </h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold">
                        {lec.subject?.code}
                      </span>
                      <StatusBadge status={lec.status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(lec.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        {lec.room?.code || lec.roomId} ({lec.room?.name || 'Hall'})
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Div {lec.division} (Sem {lec.semester})
                      </span>
                    </div>

                    {lec.topic && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic mt-1.5">
                        "{lec.topic}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions: Edit & Cancel */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => openEditModal(lec)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Edit or Reschedule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(lec.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                    title="Cancel Lecture"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Add / Edit Lecture with Conflict Validation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden card-3d">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {modalMode === 'create' ? 'Schedule New Lecture' : 'Modify / Reschedule Lecture'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conflict Error Notice (Section 33) */}
            {conflictError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Timetable Conflict Detected</p>
                  <p className="text-[11px] mt-0.5">{conflictError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Division & Cohort
                  </label>
                  <select
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="A">Division A (Sem 3)</option>
                    <option value="B">Division B (Sem 3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="subj_math">CS-301 Engineering Mathematics III</option>
                  <option value="subj_algo">CS-303 Design & Analysis of Algorithms</option>
                  <option value="subj_dbms">CS-302 Database Management Systems</option>
                  <option value="subj_os">CS-304 Operating Systems & Kernel Design</option>
                  <option value="subj_oop">CS-305 Object Oriented Programming (Java)</option>
                  <option value="subj_ai">CS-306 Artificial Intelligence Fundamentals</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Classroom / Venue
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="room_c204">Room C-204 (Turing Hall - 70 Cap)</option>
                  <option value="room_b102">Room B-102 (Lovelace Hall - 65 Cap)</option>
                  <option value="lab_turing">Lab 2 (Turing Advanced Software Lab - 45 Cap)</option>
                  <option value="room_a301">Room A-301 (Shannon Amphitheater - 120 Cap)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lecture Topic / Syllabus Outline
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Fourier Series & Boundary Conditions"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lecture Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="scheduled">Scheduled / Upcoming</option>
                    <option value="conducted">Conducted</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-colors"
                >
                  {isSubmitting ? 'Validating Conflicts...' : modalMode === 'create' ? 'Confirm Schedule' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
