'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, Send, CheckCircle2, Clock } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { AttendanceCorrectionRequest, Lecture, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function StudentCorrectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [conductedLectures, setConductedLectures] = useState<any[]>([]);
  const [selectedLectureId, setSelectedLectureId] = useState('');
  const [reason, setReason] = useState('');
  const [proofNote, setProofNote] = useState('Professor verified presence in classroom row 3.');
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setUser(userData.user);

      if (userData.user) {
        // Fetch student's corrections
        const corrRes = await fetch(`/api/attendance/correction?studentId=${userData.user.id}`);
        const corrData = await corrRes.json();
        setCorrections(corrData.corrections || []);

        // Fetch conducted lectures
        const ttRes = await fetch(
          `/api/timetable?branchId=${userData.user.branchId}&semester=${userData.user.semester}&division=${userData.user.division}&studentId=${userData.user.id}&view=all`
        );
        const ttData = await ttRes.json();
        const conducted = ttData.lectures?.filter((l: any) => l.status === 'conducted') || [];
        setConductedLectures(conducted);
        if (conducted.length > 0 && !selectedLectureId) {
          setSelectedLectureId(conducted[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedLectureId || !reason.trim()) return;

    setSubmitting(true);
    setSuccessNotice(null);

    const lec = conductedLectures.find((l) => l.id === selectedLectureId);

    try {
      const res = await fetch('/api/attendance/correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          lectureId: selectedLectureId,
          professorId: lec?.professorId || 'prof_1',
          requestedStatus: 'present',
          reason,
          proofNote,
        }),
      });

      if (res.ok) {
        setSuccessNotice('Attendance correction request submitted to professor for review.');
        setReason('');
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Attendance Discrepancy & Correction
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Request official correction if you attended a conducted lecture but were marked absent due to hardware or connectivity faults.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Correction Form */}
        <div className="lg:col-span-5">
          <TiltCard className="p-6">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Request Attendance Correction
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Conducted Lecture
                </label>
                <select
                  value={selectedLectureId}
                  onChange={(e) => setSelectedLectureId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                >
                  {conductedLectures.map((l) => (
                    <option key={l.id} value={l.id}>
                      {formatDate(l.date)} - {l.subject?.name} ({l.startTime}-{l.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Requested Correction Status
                </label>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Mark as PRESENT</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation & Circumstance
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Device ran out of power before QR could be processed, was seated in front row..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corroborating Note / Peer Verification
                </label>
                <input
                  type="text"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send for Faculty Review</span>
                  </>
                )}
              </button>
            </form>
          </TiltCard>
        </div>

        {/* Previous Correction Requests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Correction Requests History
            </h3>
            <span className="text-xs text-slate-500">{corrections.length} Total</span>
          </div>

          <div className="space-y-3">
            {corrections.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No attendance correction requests submitted.
              </div>
            ) : (
              corrections.map((corr) => (
                <div
                  key={corr.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs card-3d space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={corr.status} size="sm" />
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDate(corr.lectureDate)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                        {corr.subjectName} ({corr.lectureTime})
                      </h4>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Faculty: {corr.professorName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{corr.reason}"
                  </p>

                  {corr.reviewComment && (
                    <p className="text-[11px] text-slate-500 italic pt-1">
                      Faculty remark: "{corr.reviewComment}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
