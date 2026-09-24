'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Sparkles, RefreshCw, AlertTriangle, Shield, GraduationCap } from 'lucide-react';

export default function DemoSwitcher() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const switchAccount = async (userId: string, targetPath: string) => {
    try {
      setLoadingId(userId);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDemo: true,
          demoUserId: userId,
        }),
      });

      if (res.ok) {
        window.location.href = targetPath;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset entire demonstration database back to pristine initial seed?')) return;
    try {
      setResetting(true);
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (res.ok) {
        alert('Database restored to initial state.');
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm">
      {isExpanded ? (
        <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3 animate-fade-in card-3d">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Demo Role Switcher
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Minimize
            </button>
          </div>

          <div className="grid grid-cols-1 gap-1.5 text-xs">
            {/* Student 1 */}
            <button
              onClick={() => switchAccount('stud_1', '/student')}
              disabled={loadingId !== null}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Aaryan Sharma</p>
                  <p className="text-[10px] text-slate-500">Student (87% - Div A)</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">High Att.</span>
            </button>

            {/* Student 2: Low Attendance */}
            <button
              onClick={() => switchAccount('stud_2', '/student')}
              disabled={loadingId !== null}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-left border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Priya Patel</p>
                  <p className="text-[10px] text-slate-500">Student (68.4% - Warning)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-rose-500">Low Att.</span>
            </button>

            {/* Professor */}
            <button
              onClick={() => switchAccount('prof_1', '/professor')}
              disabled={loadingId !== null}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-left border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-indigo-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Dr. Vikram Roy</p>
                  <p className="text-[10px] text-slate-500">Professor & HOD (Math/Algo)</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-indigo-500">Faculty</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => switchAccount('user_admin_1', '/admin')}
              disabled={loadingId !== null}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-left border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Dean Robert Sterling</p>
                  <p className="text-[10px] text-slate-500">Registrar & Admin</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-500">Admin</span>
            </button>
          </div>

          <button
            onClick={handleResetData}
            disabled={resetting}
            className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Seed Data</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="px-3.5 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white dark:bg-blue-600 dark:hover:bg-blue-700 shadow-xl border border-white/20 backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all transform hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Switch Demo Role</span>
        </button>
      )}
    </div>
  );
}
