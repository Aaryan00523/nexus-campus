'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Calendar,
  CheckCheck,
  QrCode,
  ShieldCheck,
  Users,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  TrendingUp,
  Shield,
  Layers,
  ChevronRight,
  Bell,
} from 'lucide-react';
import CampusHeroCanvas from '@/components/3d/CampusHeroCanvas';
import TiltCard from '@/components/3d/TiltCard';
import CircularProgress from '@/components/ui/CircularProgress';
import StatusBadge from '@/components/ui/StatusBadge';
import ThemeToggle from '@/components/shared/ThemeToggle';
import DemoSwitcher from '@/components/shared/DemoSwitcher';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 h-20 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-black text-base tracking-tight leading-none">
              NEXUS CAMPUS
            </span>
            <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">
              Academic Operating System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />

          <Link
            href="/login"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            Portal Login
          </Link>

          <Link
            href="/student"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
          >
            Launch Terminal
          </Link>
        </div>
      </nav>

      {/* HERO SECTION (Section 6) */}
      <section className="relative px-6 sm:px-12 pt-12 sm:pt-20 pb-20 max-w-7xl mx-auto overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous College Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
            Your College.{' '}
            <span className="bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 bg-clip-text text-transparent">
              Your Schedule.
            </span>{' '}
            Your Attendance.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A real premium university technology platform combining multi-dimensional timetable resolution, 2-minute dynamic QR verification, and automated leave credit calculations.
          </p>

          {/* Action Portals */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/student"
              className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/professor"
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Professor Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

        {/* SECTION 6: Floating 3D Dashboard Composition */}
        <div className="mt-16 relative z-10 max-w-5xl mx-auto">
          {/* Central 3D Canvas Visual Core */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 dark:opacity-60">
            <CampusHeroCanvas />
          </div>

          {/* Layered Composition: Timetable Card, Attendance Ring, QR Attendance, Notification */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-20">
            {/* 1. Timetable Floating Card (Left) */}
            <TiltCard className="md:col-span-6 p-6 border-blue-500/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Schedule Matrix
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  10:00 — 11:00 AM
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Engineering Mathematics III
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                    Dr. Vikram Roy (HOD)
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-blue-500 font-bold">
                    <MapPin className="w-3.5 h-3.5" /> Room C-204
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <StatusBadge status="conducted" size="sm" />
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  ● Verified Present
                </span>
              </div>
            </TiltCard>

            {/* 2. Attendance Semi-3D Ring & Metric Card (Right) */}
            <TiltCard className="md:col-span-6 p-6 border-indigo-500/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Attendance Health Index
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  87.5% Standing
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-[180px]">
                  15 Present, 2 Approved Leaves, 3 Absents.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Exam Compliant</span>
                </div>
              </div>

              <CircularProgress
                value={87.5}
                size={140}
                strokeWidth={12}
                sublabel="Ratio"
              />
            </TiltCard>

            {/* 3. Layered QR Attendance Card */}
            <TiltCard className="md:col-span-7 p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Dynamic QR Attendance Verification
                  </h4>
                  <p className="text-xs text-slate-500">
                    2-minute server-side token decay with automated duplicate prevention
                  </p>
                </div>
              </div>

              <span className="font-mono text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg shrink-0">
                TTL 02:00
              </span>
            </TiltCard>

            {/* 4. Live Notification Card */}
            <TiltCard className="md:col-span-5 p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  Duty Leave Approved
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  Hackathon Finals attendance credit granted
                </p>
              </div>
            </TiltCard>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Engineered For Higher Education
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            Architected With Real University Business Logic
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Not a generic dashboard template. Built from the ground up for strict academic integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TiltCard className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Permanent Lecture Historical Integrity
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every conducted lecture holds a unique permanent identifier. Modifying or rescheduling future timetable slots never alters or overwrites historical attendance records.
            </p>
          </TiltCard>

          <TiltCard className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Approved Leave Denominator Logic
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enforces the strict college formula: <code>Present / (Conducted - ApprovedLeave) × 100</code>. Approved leaves never degrade percentage and are never falsely counted as present.
            </p>
          </TiltCard>

          <TiltCard className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Multi-Entity Conflict Engine
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automated timetable collision validation prevents professors, physical classrooms, and student cohorts from being simultaneously scheduled across overlapping hours.
            </p>
          </TiltCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-10 px-6 sm:px-12 text-center text-xs text-slate-500">
        <p className="font-bold text-slate-900 dark:text-white">
          Nexus Campus Operating System
        </p>
        <p className="mt-1">
          Designed for Apex Institute of Technology & Science • Built with Next.js, TypeScript & Tailwind CSS
        </p>
      </footer>

      {/* Floating Demo Role Switcher */}
      <DemoSwitcher />
    </div>
  );
}
