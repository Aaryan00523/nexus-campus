'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  Building,
  Calendar,
  ShieldAlert,
  Settings,
  TrendingUp,
  AlertTriangle,
  History,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import MetricCard from '@/components/ui/MetricCard';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { AuditLog, CollegeSettings, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data.stats);
      setRecentLogs(data.recentAuditLogs || []);
      setSettings(data.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              Registrar & Executive Suite
            </span>
            <span className="text-xs text-slate-500">
              Autonomous Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            University Operations & Academic Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            System overview for {settings?.collegeName || 'Apex Institute of Technology'} • Academic Session {settings?.academicYear}
          </p>
        </div>

        <Link
          href="/admin/settings"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs shadow-md transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Settings className="w-4 h-4 text-emerald-400" />
          <span>Configure Regulations</span>
        </Link>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Overall Attendance"
          value={stats ? `${stats.overallUniversityAttendance.toFixed(1)}%` : '--%'}
          subtitle={`Enforced Threshold: ${settings?.minAttendanceThreshold || 75}%`}
          icon={TrendingUp}
          iconColor="text-emerald-500"
          badgeText="University Average"
          badgeVariant="success"
        />

        <MetricCard
          title="Enrolled Students"
          value={stats?.totalStudents || 20}
          subtitle={`${stats?.totalBranches || 2} Engineering Departments`}
          icon={GraduationCap}
          iconColor="text-blue-500"
          badgeText="Active Term"
          badgeVariant="info"
        />

        <MetricCard
          title="Faculty Members"
          value={stats?.totalProfessors || 5}
          subtitle={`${stats?.totalSubjects || 8} Accredited Subjects`}
          icon={Users}
          iconColor="text-indigo-500"
          badgeText="Teaching Faculty"
          badgeVariant="info"
        />

        <MetricCard
          title="Shortage Alerts"
          value={stats?.lowAttendanceAlertsCount || 0}
          subtitle="Students below 75% requirement"
          icon={AlertTriangle}
          iconColor="text-rose-500"
          badgeText="Review Required"
          badgeVariant="danger"
        />
      </div>

      {/* Operational Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 card-3d space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Student & Faculty Directory
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage enrollments, inspect attendance standings, and manage departmental appointments.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 pt-1">
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/timetable"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 card-3d space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Master Campus Timetable
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Cross-division scheduler with multi-entity room and professor conflict detection.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-1">
            <span>Open Master Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/academic"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 card-3d space-y-3"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Academic Structure & Calendar
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Branches, Divisions, Venues, Exam weeks, and University declared holidays.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
            <span>Configure Structure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* University Audit Trail (Section 30) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent University Audit Trail & Governance Log
            </h3>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Full Trail ({recentLogs.length}) →
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {recentLogs.slice(0, 6).map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.actorName}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">
                    ({log.actorRole})
                  </span>
                </div>
                <p className="text-slate-500 mt-1">{log.details}</p>
              </div>

              <span className="text-[11px] text-slate-400 font-mono self-start sm:self-center shrink-0">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
