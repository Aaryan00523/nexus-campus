'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Send, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Upload, Paperclip } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { LeaveApplication, Subject, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function StudentLeavesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedProfessor, setSelectedProfessor] = useState('prof_1');
  const [startDate, setStartDate] = useState('2026-09-28');
  const [endDate, setEndDate] = useState('2026-09-29');
  const [reason, setReason] = useState('');
  const [documentName, setDocumentName] = useState('Official_Medical_Certificate.pdf');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setUser(userData.user);

      if (userData.user) {
        // Fetch leaves
        const leavesRes = await fetch(`/api/leaves?studentId=${userData.user.id}`);
        const leavesData = await leavesRes.json();
        setLeaves(leavesData.leaves || []);

        // Fetch subjects & professors
        const ttRes = await fetch(`/api/timetable?branchId=${userData.user.branchId}&semester=${userData.user.semester}`);
        const ttData = await ttRes.json();
        // Extract subjects from lectures
        const subMap = new Map();
        ttData.lectures?.forEach((l: any) => {
          if (l.subject) subMap.set(l.subject.id, l.subject);
        });
        setSubjects(Array.from(subMap.values()));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reason.trim()) return;

    setSubmitting(true);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          subjectId: selectedSubject || undefined,
          professorId: selectedProfessor,
          startDate,
          endDate,
          reason,
          documentName,
        }),
      });

      if (res.ok) {
        setSuccessNotice('Leave application submitted successfully. Current status: PENDING faculty review.');
        setReason('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Leave Applications & On-Duty Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Apply for medical, academic, or on-duty leaves. Approved leaves are automatically exempted from your attendance denominator.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form: Section 21 */}
        <div className="lg:col-span-5">
          <TiltCard className="p-6">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Submit Leave Application
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Scope
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">All Subjects (Full Day Exemption)</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reviewing Faculty / Department Head
                </label>
                <select
                  value={selectedProfessor}
                  onChange={(e) => setSelectedProfessor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="prof_1">Dr. Vikram Roy (HOD & Mathematics)</option>
                  <option value="prof_2">Prof. Sarah Jenkins (Database Systems)</option>
                  <option value="prof_3">Dr. Rajesh Kothari (OOP & Networks)</option>
                  <option value="prof_5">Prof. Meera Nair (AI Fundamentals)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Absence
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail the academic event, medical emergency, or university representation..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supporting Document
                </label>
                <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Paperclip className="w-4 h-4 text-blue-500" />
                    <span className="truncate max-w-[200px] font-mono text-[11px]">{documentName}</span>
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer">Attached</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {submitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </form>
          </TiltCard>
        </div>

        {/* Status Timeline Feed: Pending, Approved, Rejected */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Application History & Decisions
            </h3>
            <span className="text-xs text-slate-500">{leaves.length} Applications</span>
          </div>

          <div className="space-y-3">
            {leaves.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No leave requests filed yet.
              </div>
            ) : (
              leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs card-3d space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={leave.status} size="sm" />
                        <span className="text-[11px] font-mono text-slate-400">
                          {formatDate(leave.startDate)} {leave.startDate !== leave.endDate && `→ ${formatDate(leave.endDate)}`}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                        {leave.subjectName || 'All Scheduled Lectures'}
                      </h4>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      Applied {new Date(leave.appliedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    "{leave.reason}"
                  </p>

                  {/* Review Note if available */}
                  {leave.reviewNote && (
                    <div className="pt-2 text-xs border-t border-slate-100 dark:border-slate-800 flex items-start gap-2 text-slate-500">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        Reviewer ({leave.reviewedBy || 'Faculty'}):
                      </span>
                      <span className="italic">{leave.reviewNote}</span>
                    </div>
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
