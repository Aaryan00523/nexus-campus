'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Lock,
  Mail,
  UserCheck,
  Shield,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import CampusHeroCanvas from '@/components/3d/CampusHeroCanvas';
import TiltCard from '@/components/3d/TiltCard';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'professor' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('CS-2024-001');
  const [password, setPassword] = useState('nexus@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleTabChange = (newRole: 'student' | 'professor' | 'admin') => {
    setRole(newRole);
    setError(null);
    if (newRole === 'student') {
      setIdentifier('CS-2024-001');
      setPassword('nexus@2026');
    } else if (newRole === 'professor') {
      setIdentifier('PROF-CS-101');
      setPassword('nexus@2026');
    } else {
      setIdentifier('dean.sterling@aits.edu');
      setPassword('nexus@2026');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      if (data.user?.role === 'student') {
        router.push('/student');
      } else if (data.user?.role === 'professor') {
        router.push('/professor');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setError('Connection failure communicating with campus auth server.');
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async (demoUserId: string, targetPath: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDemo: true,
          demoUserId,
        }),
      });

      if (res.ok) {
        window.location.href = targetPath;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {/* Absolute top bar with home link and theme toggle */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          Landing Page
        </Link>
        <ThemeToggle />
      </div>

      {/* LEFT SECTION (Section 8): College branding + 3D abstract visual */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-blue-600/[0.04] via-indigo-600/[0.02] to-transparent relative overflow-hidden">
        {/* College Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl tracking-tight leading-none text-slate-900 dark:text-white">
              NEXUS CAMPUS
            </h2>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase mt-0.5">
              Apex Institute of Technology & Science
            </p>
          </div>
        </div>

        {/* 3D Visual Centerpiece */}
        <div className="my-6 lg:my-0 flex flex-col items-center justify-center relative">
          <CampusHeroCanvas />
          <div className="absolute bottom-4 text-center max-w-sm px-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Next-Gen Academic Engine
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Synchronized 3D schedule orchestration, temporary cryptographic QR presence checks, and automated leave credit calculations.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>Autumn Session 2026</span>
          <span>Security Protocol v4.2</span>
        </div>
      </div>

      {/* RIGHT SECTION (Section 8): Login Card with glassmorphism */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In to Your Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your academic role and enter your institutional credentials.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleRoleTabChange('student')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('professor')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'professor'
                  ? 'bg-white dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Professor</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-white dark:bg-slate-850 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Login Card */}
          <TiltCard className="p-6 sm:p-8 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {role === 'student'
                    ? 'Student Enrollment ID'
                    : role === 'professor'
                    ? 'Professor ID / Official Email'
                    : 'Administrator Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      role === 'student'
                        ? 'e.g. CS-2024-001'
                        : role === 'professor'
                        ? 'e.g. PROF-CS-101'
                        : 'dean.sterling@aits.edu'
                    }
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Security Password
                  </label>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter {role.toUpperCase()} Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Section 8: Quick Demo Account Buttons */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-2.5">
                Instant 1-Click Demo Evaluation
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => quickDemoLogin('stud_1', '/student')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <p className="font-bold text-[11px] text-blue-600 dark:text-blue-400">
                    Aaryan (Student 87%)
                  </p>
                  <p className="text-[10px] text-slate-400">CS-2024-001</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('stud_2', '/student')}
                  className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-left font-semibold text-amber-800 dark:text-amber-200 transition-colors"
                >
                  <p className="font-bold text-[11px] text-rose-500">
                    Priya (Student 68%)
                  </p>
                  <p className="text-[10px] text-slate-400">Low Attendance Test</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('prof_1', '/professor')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <p className="font-bold text-[11px] text-indigo-500">
                    Dr. Vikram Roy
                  </p>
                  <p className="text-[10px] text-slate-400">Faculty & HOD</p>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin('user_admin_1', '/admin')}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <p className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                    Dean Sterling
                  </p>
                  <p className="text-[10px] text-slate-400">University Admin</p>
                </button>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
