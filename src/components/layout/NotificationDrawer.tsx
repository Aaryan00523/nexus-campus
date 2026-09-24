'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, X, CheckCheck, Clock, Calendar, AlertCircle, ShieldCheck } from 'lucide-react';
import { Notification } from '@/lib/types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkRead: (id?: string, markAll?: boolean) => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <CheckCheck className="w-4 h-4 text-emerald-500" />;
      case 'timetable':
        return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'leave':
        return <ShieldCheck className="w-4 h-4 text-purple-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Notifications
              </h3>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onMarkRead(undefined, true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all read
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onMarkRead(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    item.read
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800 opacity-75'
                      : 'bg-white dark:bg-slate-850 border-blue-500/30 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 mt-0.5">
                      {getNotifIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {item.link && (
                          <Link
                            href={item.link}
                            onClick={onClose}
                            className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
