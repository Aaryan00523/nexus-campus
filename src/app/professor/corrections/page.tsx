'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { User } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ProfessorCorrectionsPage() {
  const [professor, setProfessor] = useState<User | null>(null);
  const [corrections, setCorrections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      setProfessor(userData.user);

      if (userData.user) {
        const corrRes = await fetch(`/api/attendance/correction?professorId=${userData.user.id}`);
        const corrData = await corrRes.json();
        setCorrections(corrData.corrections || []);
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

  const handleDecision = async (corrId: string, status: 'approved' | 'rejected') => {
    if (!professor) return;

    setProcessingId(corrId);
    setSuccessNotice(null);

    const comment = comments[corrId] || (status === 'approved' ? 'Verified in classroom logs' : 'Denied per physical roster');

    try {
      const res = await fetch('/api/attendance/correction', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correctionId: corrId,
          status,
          reviewComment: comment,
          actorId: professor.id,
          actorName: professor.name,
          actorRole: professor.role,
        }),
      });

      if (res.ok) {
        setSuccessNotice(`Correction request ${status.toUpperCase()} and logged in permanent audit trail.`);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Attendance Discrepancy & Correction Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review student appeals regarding missed QR scans, device power failures, or hardware connectivity glitches.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Requests Queue ({corrections.length})
          </h3>
          <span className="text-xs text-slate-500">Audit-enforced decisions</span>
        </div>

        {corrections.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
            No attendance correction requests submitted for your lectures.
          </div>
        ) : (
          corrections.map((corr) => {
            const isPending = corr.status === 'pending';
            return (
              <TiltCard key={corr.id} className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {corr.studentName}
                      </h4>
                      <span className="text-xs font-mono text-slate-400">
                        ({corr.studentEnrollment})
                      </span>
                      <StatusBadge status={corr.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Session: <strong>{corr.subjectName}</strong> ({corr.lectureTime}) on {formatDate(corr.lectureDate)}
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    Submitted: {new Date(corr.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                  <p className="font-semibold text-slate-900 dark:text-white">Student Reason:</p>
                  <p className="italic mt-0.5">"{corr.reason}"</p>
                  {corr.proofNote && (
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">
                      Corroboration: {corr.proofNote}
                    </p>
                  )}
                </div>

                {isPending ? (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="text"
                      placeholder="Reviewer justification comment..."
                      value={comments[corr.id] || ''}
                      onChange={(e) =>
                        setComments({ ...comments, [corr.id]: e.target.value })
                      }
                      className="flex-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleDecision(corr.id, 'rejected')}
                        disabled={processingId === corr.id}
                        className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleDecision(corr.id, 'approved')}
                        disabled={processingId === corr.id}
                        className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve as Present</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800 text-slate-500 flex items-center justify-between">
                    <span>Decision comment: "{corr.reviewComment || 'Processed'}"</span>
                    <span className="font-mono text-[10px]">
                      Reviewed {corr.reviewedAt ? new Date(corr.reviewedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                )}
              </TiltCard>
            );
          })
        )}
      </div>
    </div>
  );
}
