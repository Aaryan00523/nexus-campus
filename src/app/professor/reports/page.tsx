'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Download, Filter, Printer, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { User } from '@/lib/types';

export default function ProfessorReportsPage() {
  const [professor, setProfessor] = useState<User | null>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [branch, setBranch] = useState('branch_cs');
  const [semester, setSemester] = useState('3');
  const [division, setDivision] = useState('A');
  const [reportType, setReportType] = useState('division');

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/reports/export?format=json&branchId=${branch}&semester=${semester}&division=${division}&type=${reportType}`
      );
      const data = await res.json();
      setReportData(data.rows || []);
      setMetadata(data.metadata || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setProfessor(d.user));
    fetchReport();
  }, [branch, semester, division, reportType]);

  const handleExportCsv = () => {
    window.location.href = `/api/reports/export?format=csv&branchId=${branch}&semester=${semester}&division=${division}&type=${reportType}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Academic Attendance Reports & Registers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate division-wise, subject-wise, and student-wise attendance records with one-click CSV export and print format.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Section 27) */}
      <TiltCard className="p-5">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold">
            <Filter className="w-4 h-4 text-blue-500" />
            <span>Filter Criteria:</span>
          </div>

          <div>
            <label className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
              Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="branch_cs">Computer Science & Engineering</option>
              <option value="branch_ece">Electronics & Communication</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="3">Semester 3</option>
              <option value="5">Semester 5</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
              Division
            </label>
            <select
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="A">Division A</option>
              <option value="B">Division B</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">
              Granularity
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="division">Division Cumulative Register</option>
              <option value="subject">Subject Specific</option>
              <option value="weekly">Weekly Aggregate</option>
            </select>
          </div>
        </div>
      </TiltCard>

      {/* Report Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Division Attendance Register
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Enrolled: {metadata?.totalStudents || reportData.length} • Total Conducted Sessions: {metadata?.totalConductedLectures || 0}
            </p>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Generated: {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-6">Enrollment ID</th>
                <th className="py-3 px-6">Student Name</th>
                <th className="py-3 px-4 text-center">Conducted</th>
                <th className="py-3 px-4 text-center">Present</th>
                <th className="py-3 px-4 text-center">Leave</th>
                <th className="py-3 px-4 text-center">Absent</th>
                <th className="py-3 px-4 text-center">Effective (Total - Leave)</th>
                <th className="py-3 px-6 text-right">Attendance %</th>
                <th className="py-3 px-6 text-center">Exam Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {reportData.map((row, idx) => {
                const isShortage = row.status === 'SHORTAGE_WARNING';
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors ${
                      isShortage ? 'bg-amber-500/[0.02]' : ''
                    }`}
                  >
                    <td className="py-3.5 px-6 font-mono font-bold text-slate-900 dark:text-white">
                      {row.enrollmentNo}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      {row.name}
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-400">
                      {row.totalConducted}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {row.present}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-blue-600 dark:text-blue-400">
                      {row.approvedLeave}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-600 dark:text-rose-400">
                      {row.absent}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-700 dark:text-slate-300">
                      {row.effectiveTotal}
                    </td>
                    <td className="py-3.5 px-6 text-right font-black font-mono text-slate-900 dark:text-white">
                      <span className={isShortage ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}>
                        {row.percentage}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          isShortage
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}
                      >
                        {isShortage ? 'DEFICIT WARNING' : 'ELIGIBLE'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
