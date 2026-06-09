'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Authentication was successful! This page is protected.</p>
        
        {user && (
          <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            {user.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={user.avatar_url} 
                alt={user.name} 
                className="h-16 w-16 rounded-full mx-auto border-2 border-white shadow-sm"
              />
            )}
            <p className="font-semibold text-slate-800 text-base">{user.name}</p>
            <p className="text-xs text-slate-500 font-mono">{user.email}</p>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full py-2.5 px-4 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition duration-150 ease-in-out shadow-sm shadow-red-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
