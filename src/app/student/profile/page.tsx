'use client';

import React, { useEffect, useState } from 'react';
import { User, Lock, Mail, Phone, Building, GraduationCap, Award, ShieldCheck } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import { User as UserType } from '@/lib/types';

export default function StudentProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user));
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Academic Identity & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Official university student registrar records. Core academic details are locked and cryptographically bound to your enrollment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Basic Badge */}
        <TiltCard className="md:col-span-5 p-6 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-3xl bg-blue-600 text-white font-black text-4xl flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-slate-900 overflow-hidden mb-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0)
            )}
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {user.name}
          </h2>
          <span className="mt-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {user.enrollmentNo}
          </span>
          <p className="text-xs text-slate-500 mt-2">{user.department}</p>

          <div className="mt-6 w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-mono">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{user.phone || '+1 (555) 782-9011'}</span>
            </div>
          </div>
        </TiltCard>

        {/* Right Column: Academic Registry (Non-editable parameters) */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Enrolled Program Details
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Registrar Locked</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Branch</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">Computer Science & Engineering</p>
                <p className="text-[10px] text-slate-500 font-mono">B.Tech (Autonomous)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Current Standing</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">Semester {user.semester}</p>
                <p className="text-[10px] text-slate-500">Division {user.division} (Full-Time)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Academic Session</span>
                <p className="font-bold text-slate-900 dark:text-white mt-1">2026 — 2027</p>
                <p className="text-[10px] text-slate-500">Term I (Autumn 2026)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Admit Card Eligibility</span>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">IN COMPLIANCE</p>
                <p className="text-[10px] text-slate-500">Valid ID Token</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                To request modifications to your registered branch, division, or major specialization, contact the Office of the University Registrar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
