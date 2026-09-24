'use client';

import React, { useEffect, useState } from 'react';
import { User as UserIcon, BookOpen, Layers, Mail, Phone, Award, ShieldCheck } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import { User } from '@/lib/types';

export default function ProfessorProfilePage() {
  const [professor, setProfessor] = useState<User | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => setProfessor(data.user));
  }, []);

  if (!professor) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Faculty Dossier & Appointments
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Official departmental identity, assigned courses, and laboratory oversight.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Avatar & Designation */}
        <TiltCard className="md:col-span-5 p-6 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-3xl bg-indigo-600 text-white font-black text-4xl flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-slate-900 overflow-hidden mb-4">
            {professor.avatarUrl ? (
              <img src={professor.avatarUrl} alt={professor.name} className="w-full h-full object-cover" />
            ) : (
              professor.name.charAt(0)
            )}
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {professor.name}
          </h2>
          <span className="mt-1 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {professor.professorId}
          </span>
          <p className="text-xs text-slate-500 mt-2">{professor.designation}</p>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
            {professor.department}
          </p>

          <div className="mt-6 w-full pt-4 border-t border-slate-100 dark:border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate font-mono">{professor.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{professor.phone || '+1 (555) 301-4491'}</span>
            </div>
          </div>
        </TiltCard>

        {/* Right Column: Assigned Subjects & Classes */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Teaching Appointments & Cohorts
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Active Faculty Roster
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">
                Assigned Courses (Curriculum 2026)
              </span>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      CS-301 Engineering Mathematics III
                    </p>
                    <p className="text-[11px] text-slate-500">4 Credits • Discrete Transforms & ODE</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Lead Faculty
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      CS-303 Design & Analysis of Algorithms
                    </p>
                    <p className="text-[11px] text-slate-500">4 Credits • Advanced Data Structures</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    Lead Faculty
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-2">
                Assigned Divisions & Sections
              </span>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  CSE Sem 3 — Division A (70 Students)
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                  CSE Sem 3 — Division B (68 Students)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
