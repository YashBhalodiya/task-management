'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import DashboardNavbar from '@/components/DashboardNavbar';
import TaskStats from '@/features/tasks/components/TaskStats';
import { Plus, Search, ChevronDown } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <DashboardNavbar />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Here is what is happening with your tasks today.
            </p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-100 hover:bg-blue-700 transition duration-155 ease-in-out shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Task
          </button>
        </div>

        {/* Statistics Cards */}
        <TaskStats total={0} pending={0} completed={0} isLoading={true} />

        {/* Tasks Section Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Task Board</h2>
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-450" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-150 ease-in-out"
                />
              </div>

              <div className="relative sm:w-44">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-10 py-2 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-150 ease-in-out cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Task Grid Loading Placeholder */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="border border-slate-105 rounded-2xl p-5 space-y-4 bg-slate-50/10 border-slate-100 animate-pulse">
                <div className="flex justify-between items-start">
                  <div className="h-6 w-20 bg-slate-100 rounded-lg" />
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-2/3 bg-slate-100 rounded" />
                  <div className="h-4 w-full bg-slate-100 rounded" />
                  <div className="h-4 w-5/6 bg-slate-100 rounded" />
                </div>
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-slate-100 rounded-full" />
                    <div className="h-4 w-24 bg-slate-100 rounded" />
                  </div>
                  <div className="h-4 w-12 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
