'use client';

import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, XCircle, Clock, ShieldCheck, User, Paperclip } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { LeaveApplication, User as UserType } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ProfessorLeavesPage() {
  const [professor, setProfessor] = useState<UserType | null>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setProfessor(userData.user);

      if (userData.user) {
        const leavesRes = await fetch(`/api/leaves?professorId=${userData.user.id}`);
        const leavesData = await leavesRes.json();
        setLeaves(leavesData.leaves || []);
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

  const handleDecision = async (leaveId: string, status: 'approved' | 'rejected') => {
    if (!professor) return;

    setProcessingId(leaveId);
    setSuccessNotice(null);

    const note = actionNotes[leaveId] || (status === 'approved' ? 'Approved on duty/medical grounds' : 'Rejected per policy');

    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewNote: note,
          actorId: professor.id,
          actorName: professor.name,
          actorRole: professor.role,
        }),
      });

      if (res.ok) {
        setSuccessNotice(
          `Leave ${status.toUpperCase()}! Affected lectures converted to approved leave and exempted from attendance denominator.`
        );
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'pending');
  const pastLeaves = leaves.filter((l) => l.status !== 'pending');

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Student Leave Applications & Approvals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review student requests. Approved leaves automatically recalculate attendance percentages using the college formula:
          <code className="ml-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-xs">
            Present / (Conducted - ApprovedLeave)
          </code>
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Pending Reviews Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pending Applications ({pendingLeaves.length})
          </h3>
          <span className="text-xs text-amber-500 font-semibold">Action Required</span>
        </div>

        {pendingLeaves.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No pending leave applications at this time. You're all caught up!
          </div>
        ) : (
          <div className="space-y-4">
            {pendingLeaves.map((leave) => (
              <TiltCard key={leave.id} className="p-6 border-amber-500/30">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {leave.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {leave.studentName}
                        </h4>
                        <span className="text-xs font-mono text-slate-400">
                          ({leave.studentEnrollment})
                        </span>
                        <StatusBadge status={leave.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Duration: <strong>{formatDate(leave.startDate)}</strong> {leave.startDate !== leave.endDate && `to ${formatDate(leave.endDate)}`} • {leave.subjectName || 'All Scheduled Lectures'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Applied: {new Date(leave.appliedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Reason */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white mb-0.5">Applicant Note:</p>
                  <p className="italic leading-relaxed">"{leave.reason}"</p>
                </div>

                {leave.documentName && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                    <span>Attached Document: <strong className="font-mono text-slate-700 dark:text-slate-300">{leave.documentName}</strong></span>
                  </div>
                )}

                {/* Review Remark Input & Action Buttons */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    placeholder="Optional faculty review endorsement note..."
                    value={actionNotes[leave.id] || ''}
                    onChange={(e) =>
                      setActionNotes({ ...actionNotes, [leave.id]: e.target.value })
                    }
                    className="flex-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleDecision(leave.id, 'rejected')}
                      disabled={processingId === leave.id}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleDecision(leave.id, 'approved')}
                      disabled={processingId === leave.id}
                      className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Leave</span>
                    </button>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        )}
      </div>

      {/* Historical Reviews Feed */}
      <div className="space-y-4 pt-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Past Reviewed Applications ({pastLeaves.length})
        </h3>

        <div className="space-y-3">
          {pastLeaves.map((l) => (
            <div
              key={l.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">{l.studentName}</span>
                  <span className="font-mono text-slate-400">({l.studentEnrollment})</span>
                  <StatusBadge status={l.status} size="sm" />
                </div>
                <p className="text-slate-500 mt-0.5">
                  {formatDate(l.startDate)} {l.startDate !== l.endDate && `to ${formatDate(l.endDate)}`} • "{l.reason}"
                </p>
                {l.reviewNote && (
                  <p className="text-[11px] text-slate-400 italic mt-1">
                    Endorsement: "{l.reviewNote}"
                  </p>
                )}
              </div>

              <span className="text-[11px] text-slate-400 font-mono self-start sm:self-center">
                Reviewed {l.reviewedAt ? new Date(l.reviewedAt).toLocaleDateString() : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
