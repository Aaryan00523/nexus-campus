'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, Search, Filter, History, Clock } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import { AuditLog } from '@/lib/types';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((d) => {
        setLogs(d.recentAuditLogs || []);
        setLoading(false);
      });
  }, []);

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          University Audit & Compliance Registry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Immutable records of manual attendance overrides, faculty leave approvals, timetable alterations, and regulation adjustments.
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <span className="text-xs text-slate-400">Total Entries: {logs.length}</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors text-xs space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.actorName}
                  </span>
                  <span className="text-[10px] uppercase font-mono text-slate-400">
                    ({log.actorRole})
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {log.details}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 font-mono">
                <span>Entity: {log.entity}</span>
                <span>•</span>
                <span>ID: {log.entityId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
