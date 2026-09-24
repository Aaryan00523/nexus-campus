'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import ThemeToggle from '../shared/ThemeToggle';
import NotificationDrawer from './NotificationDrawer';
import { Notification, User } from '@/lib/types';

interface TopHeaderProps {
  user: User;
  onSearch?: (query: string) => void;
}

export default function TopHeader({ user, onSearch }: TopHeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}&role=${user.role}`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, [user.id, user.role]);

  const handleMarkRead = async (id?: string, markAll?: boolean) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId: id,
          markAll,
          userId: user.id,
        }),
      });
      fetchNotifs();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const getProfileLink = () => {
    if (user.role === 'student') return '/student/profile';
    if (user.role === 'professor') return '/professor/profile';
    return '/admin/settings';
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lectures, subjects, professors, rooms..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
            />
          </form>
        </div>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Academic Status Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Autumn 2026 • Live Sync</span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            aria-label="View notifications"
            className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-700/60 cursor-pointer shadow-xs"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-black text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight pr-1">
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                  {user.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  {user.role}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                onMouseLeave={() => setIsMenuOpen(false)}
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-fade-in card-3d"
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                  {user.enrollmentNo && (
                    <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400">
                      {user.enrollmentNo}
                    </span>
                  )}
                  {user.professorId && (
                    <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-500">
                      {user.professorId}
                    </span>
                  )}
                </div>

                <div className="py-1 text-xs">
                  <Link
                    href={getProfileLink()}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer Component */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
      />
    </>
  );
}
