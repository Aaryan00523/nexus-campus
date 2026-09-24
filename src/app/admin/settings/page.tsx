'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Wifi, Clock, AlertTriangle } from 'lucide-react';
import TiltCard from '@/components/3d/TiltCard';
import { CollegeSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => {
        setSettings(d.settings);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          actorId: 'user_admin_1',
          actorName: 'Dean Robert Sterling',
          actorRole: 'admin',
        }),
      });

      if (res.ok) {
        setSuccessNotice('University policy parameters and attendance safeguards successfully updated!');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          University Policy & Security Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure minimum examination thresholds, dynamic QR session lifetimes, and network verification rules.
        </p>
      </div>

      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      <TiltCard className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Institutional Branding */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              Institutional Metadata
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  University / College Name
                </label>
                <input
                  type="text"
                  value={settings.collegeName}
                  onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Academic Session
                </label>
                <input
                  type="text"
                  value={settings.academicYear}
                  onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Attendance Thresholds */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              Mandatory Attendance Compliance Thresholds
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Exam Eligibility (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={settings.minAttendanceThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, minAttendanceThreshold: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Students below this percentage receive an automated shortage warning and recovery target.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Early Warning Advisory Threshold (%)
                </label>
                <input
                  type="number"
                  min="40"
                  max="90"
                  value={settings.warningThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, warningThreshold: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Triggers preemptive alert notifications to faculty mentors.
                </p>
              </div>
            </div>
          </div>

          {/* Security Safeguards: 2-minute QR & Wi-Fi */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              Biometric & QR Anti-Fraud Regulations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  QR Session Expiry Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  value={settings.qrExpirySeconds}
                  onChange={(e) =>
                    setSettings({ ...settings, qrExpirySeconds: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Standard setting: 120s (2 minutes) to prevent proxy capture.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Authorized Campus Wi-Fi SSID
                </label>
                <input
                  type="text"
                  value={settings.collegeWifiSsid}
                  onChange={(e) => setSettings({ ...settings, collegeWifiSsid: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Students must be connected to this network for check-in validation.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save University Configuration'}</span>
            </button>
          </div>
        </form>
      </TiltCard>
    </div>
  );
}
