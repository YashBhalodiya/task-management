'use client';

import React from 'react';
import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';

interface TaskStatsProps {
  total: number;
  pending: number;
  completed: number;
  isLoading: boolean;
}

export default function TaskStats({ total, pending, completed, isLoading }: TaskStatsProps) {
  const stats = [
    {
      name: 'Total Tasks',
      value: total,
      icon: ClipboardList,
      colorClass: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      name: 'Pending Tasks',
      value: pending,
      icon: Clock,
      colorClass: 'text-amber-600 bg-amber-50 border-amber-100',
    },
    {
      name: 'Completed Tasks',
      value: completed,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={stat.name}
            className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-200"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${stat.colorClass}`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-400">{stat.name}</span>
              {isLoading ? (
                <div className="mt-1.5 h-8 w-12 animate-pulse rounded-lg bg-slate-100" />
              ) : (
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">{stat.value}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
