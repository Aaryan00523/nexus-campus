'use client';

import React, { useEffect, useState } from 'react';
import { Camera, Wifi, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import QRScannerModal from '@/components/ui/QRScannerModal';
import TiltCard from '@/components/3d/TiltCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { User } from '@/lib/types';

export default function StudentQrScanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user);

      if (data.user) {
        const attRes = await fetch(`/api/attendance/stats?studentId=${data.user.id}`);
        const attData = await attRes.json();
        if (attData.summary?.subjects) {
          const allRecs: any[] = [];
          attData.summary.subjects.forEach((s: any) => {
            s.records.forEach((r: any) => {
              allRecs.push({ ...r, subjectName: s.subjectName });
            });
          });
          setRecentScans(allRecs.slice(0, 5));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Digital Presence Verification
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
          Scan Attendance QR
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Secure biometric-grade temporary session verification with 2-minute token decay and automated class roster check.
        </p>
      </div>

      {/* Main Interactive Scanner Container */}
      <TiltCard className="p-8 sm:p-12 flex flex-col items-center justify-center text-center border-blue-500/30">
        <div className="w-24 h-24 rounded-3xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center mb-6 shadow-xl pulse-glow">
          <Camera className="w-12 h-12 stroke-[1.8]" />
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Ready for Attendance Capture
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1.5 mb-8">
          Launch your camera to scan the dynamic QR displayed on your faculty's projector or screen.
        </p>

        {user && <QRScannerModal student={user} onSuccess={loadData} />}

        {/* Security Safeguards Status Row */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 w-full max-w-lg grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
          <div className="flex items-center justify-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>2-Min Decaying TTL</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span>Campus Wi-Fi Check</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Anti-Duplicate Lock</span>
          </div>
        </div>
      </TiltCard>

      {/* Recent QR Scans Timeline */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Recent Attendance Verifications
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentScans.length === 0 ? (
            <p className="text-xs text-slate-500 py-4">No recent QR captures logged.</p>
          ) : (
            recentScans.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {item.subjectName}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {item.date} • {item.time} ({item.room})
                  </p>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
