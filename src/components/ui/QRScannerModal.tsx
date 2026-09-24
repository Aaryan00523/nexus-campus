'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Camera, CheckCircle2, AlertCircle, X, Sparkles, Wifi, ArrowRight, RefreshCw } from 'lucide-react';
import TiltCard from '../3d/TiltCard';
import { User } from '@/lib/types';

interface QRScannerModalProps {
  student: User;
  onSuccess?: () => void;
}

export default function QRScannerModal({ student, onSuccess }: QRScannerModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [manualToken, setManualToken] = useState('NEXUS-TOKEN-MATH-7729-ALPHA');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successDetails, setSuccessDetails] = useState<{
    subjectName?: string;
    time?: string;
    topic?: string;
    markedAt?: string;
  } | null>(null);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#6366f1', '#38bdf8'],
      });
    } catch (e) {
      // safe fallback
    }
  };

  const handleScanSubmit = async (tokenToUse?: string) => {
    const token = tokenToUse || manualToken;
    if (!token.trim()) {
      setErrorMessage('Please provide a valid session token.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/attendance/submit-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          sessionToken: token.trim(),
          wifiSsid: 'Campus_AITS_Secure_5G',
          deviceInfo: 'Nexus Student Web Terminal',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to validate QR attendance session.');
        return;
      }

      setSuccessDetails({
        subjectName: data.details?.subjectName || 'Engineering Mathematics III',
        time: data.details?.time || '10:00 - 11:00',
        topic: data.details?.lectureTopic || 'Fourier Transforms & Boundary Value Problems',
        markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      triggerConfetti();
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMessage('Network or server error while communicating with verification hub.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetState = () => {
    setSuccessDetails(null);
    setErrorMessage(null);
    setIsOpen(false);
  };

  return (
    <div>
      {/* Big Action Button as requested in Section 16 */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-extrabold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer select-none card-3d group"
      >
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
          <Camera className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <span className="block text-xs uppercase tracking-widest text-blue-100 font-semibold">
            One-Tap Check-in
          </span>
          <span className="block font-black text-lg tracking-wide">
            OPEN QR SCANNER
          </span>
        </div>
        <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 transition-transform ml-2" />
      </button>

      {/* Modal Viewfinder */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden card-3d">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Scan Attendance QR
                  </h3>
                  <p className="text-xs text-slate-500">
                    Point camera at professor's screen
                  </p>
                </div>
              </div>

              <button
                onClick={resetState}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {successDetails ? (
                // Section 16 Success Screen
                <div className="py-6 flex flex-col items-center text-center animate-fade-in">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mb-4 shadow-lg pulse-glow">
                    <CheckCircle2 className="w-12 h-12 stroke-[2.2]" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                    Validated & Timestamped
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    Attendance Marked
                  </h4>

                  <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 w-full max-w-sm text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subject:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {successDetails.subjectName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Schedule:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {successDetails.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        24 September 2026
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Marked At:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {successDetails.markedAt} (Live Verified)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={resetState}
                    className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Camera Scanner Viewfinder Simulation Box */}
                  <div className="relative aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border-2 border-dashed border-blue-500/50 shadow-inner">
                    {/* Simulated live viewfinder stream */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-blue-900/30" />

                    {/* Corner Guide Reticles */}
                    <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />

                    {/* Laser Scan line animation */}
                    <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-[bounce_2.5s_infinite]" />

                    <div className="text-center z-10 px-4">
                      <Camera className="w-8 h-8 text-blue-400/80 mx-auto mb-2 animate-pulse" />
                      <p className="text-[11px] font-semibold text-blue-200">
                        Align active session QR within frame
                      </p>
                    </div>
                  </div>

                  {/* Wi-Fi & GPS Status Pill */}
                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Campus Wi-Fi Connected: <strong className="text-slate-700 dark:text-slate-300">Campus_AITS_Secure_5G</strong></span>
                  </div>

                  {/* Error Notification */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Validation Error</p>
                        <p className="text-[11px] mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Quick Scan One-Click Simulator Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <button
                      onClick={() => handleScanSubmit('NEXUS-TOKEN-MATH-7729-ALPHA')}
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying Token & Timestamp...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-cyan-300" />
                          <span>Simulate Camera Scan (Math Class)</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        placeholder="Or enter session token manually..."
                        className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleScanSubmit()}
                        disabled={isSubmitting}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
