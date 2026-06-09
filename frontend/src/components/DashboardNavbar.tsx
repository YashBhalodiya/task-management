'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { CheckSquare, LogOut, User as UserIcon } from 'lucide-react';

export default function DashboardNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left Side: Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-100">
              <CheckSquare className="h-5.5 w-5.5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">TaskFlow</span>
          </div>

          {/* Right Side: User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="h-9 w-9 rounded-full border border-slate-100 shadow-sm"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-sm font-semibold text-slate-800 leading-none">{user.name}</span>
                  <span className="text-xs text-slate-400 mt-0.5 leading-none">{user.email}</span>
                </div>
              </div>

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
