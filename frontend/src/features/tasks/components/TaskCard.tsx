'use client';

import React from 'react';
import { Task } from '@/types';
import { Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface TaskCardProps {
  task: Task;
  onStatusToggle?: (task: Task) => void;
  onDelete?: (taskId: number) => void;
}

export default function TaskCard({ task, onStatusToggle, onDelete }: TaskCardProps) {
  const { user: currentUser } = useAuth();
  const isCompleted = task.status === 'completed';

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const UserAvatar = ({ name, url }: { name: string; url: string | null }) => {
    if (url) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={name}
          className="h-6 w-6 rounded-full border border-white shadow-xs"
        />
      );
    }
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-655 text-slate-600 border border-slate-200">
        {initial}
      </div>
    );
  };

  return (
    <div className={`flex flex-col bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 ${isCompleted ? 'border-slate-100 bg-slate-50/20' : 'border-slate-100'}`}>
      {/* Top Section: Status Badge & Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          isCompleted 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
            : 'bg-amber-50 text-amber-700 border-amber-100'
        }`}>
          {isCompleted ? 'Completed' : 'Pending'}
        </span>
        
        <div className="flex items-center gap-2">
          {/* Quick complete status toggle */}
          <button
            onClick={() => onStatusToggle?.(task)}
            className={`flex h-5 w-5 items-center justify-center rounded-md border text-white transition-colors cursor-pointer ${
              isCompleted 
                ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600' 
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-55'
            }`}
            title={isCompleted ? 'Mark Pending' : 'Mark Completed'}
          >
            {isCompleted && (
              <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
              </svg>
            )}
          </button>

          {/* Delete action, only visible for creator */}
          {currentUser && currentUser.id === task.created_by.id && (
            <button
              onClick={() => onDelete?.(task.id)}
              className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="mt-4 flex-1 space-y-1">
        <h3 className={`text-base font-bold text-slate-800 tracking-tight leading-snug ${isCompleted ? 'line-through text-slate-400' : ''}`}>
          {task.title}
        </h3>
        <p className={`text-sm text-slate-500 leading-relaxed ${isCompleted ? 'text-slate-400/80' : ''}`}>
          {task.description || <span className="italic text-slate-300">No description provided.</span>}
        </p>
      </div>

      {/* Meta details & assignees */}
      <div className="mt-5 pt-4 border-t border-slate-50 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(task.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-slate-500">By:</span>
            <span className="text-slate-600 truncate max-w-[80px]" title={task.created_by.name}>{task.created_by.name}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-slate-400">Assignee</span>
          {task.assigned_to ? (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1">
              <UserAvatar name={task.assigned_to.name} url={task.assigned_to.avatar_url} />
              <span className="text-xs font-medium text-slate-600 max-w-[100px] truncate">{task.assigned_to.name}</span>
            </div>
          ) : (
            <span className="text-xs italic text-slate-400">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
}
