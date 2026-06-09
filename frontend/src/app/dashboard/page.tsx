'use client';

import React, { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import DashboardNavbar from '@/components/DashboardNavbar';
import TaskStats from '@/features/tasks/components/TaskStats';
import TaskCard from '@/features/tasks/components/TaskCard';
import CreateTaskModal from '@/features/tasks/components/CreateTaskModal';
import { getTasks, updateTaskStatus, deleteTask } from '@/services/tasks';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, ChevronDown, ClipboardList, AlertCircle, RefreshCw } from 'lucide-react';
import { Task } from '@/types';
import axios from 'axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const queryClient = useQueryClient();

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // React Query fetch for all tasks
  const { data, isLoading, isError, refetch } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: getTasks,
  });

  const tasks = data || [];

  // Compute stats dynamically from the fetched task list
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  // Filter and search tasks client-side
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' ? true : task.status === filter;
    return matchesSearch && matchesFilter;
  });

  // Task Status Toggle Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      const verb = updatedTask.status === 'completed' ? 'completed' : 'reopened';
      showNotification('success', `Task marked as ${verb}!`);
    },
    onError: (err) => {
      const message = axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : 'Failed to update task status.';
      showNotification('error', message);
    },
  });

  // Task Delete Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showNotification('success', 'Task deleted successfully.');
    },
    onError: (err) => {
      const message = axios.isAxiosError(err) && err.response?.data?.error
        ? err.response.data.error
        : 'Failed to delete task.';
      showNotification('error', message);
    },
  });

  const handleStatusToggle = (task: Task) => {
    const nextStatus = task.status === 'pending' ? 'completed' : 'pending';
    toggleStatusMutation.mutate({ taskId: task.id, status: nextStatus });
  };

  const handleDeleteTask = (taskId: number) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

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
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-100 hover:bg-blue-700 transition duration-150 ease-in-out shrink-0 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Task
          </button>
        </div>

        {/* Statistics Cards */}
        <TaskStats
          total={totalTasks}
          pending={pendingTasks}
          completed={completedTasks}
          isLoading={isLoading}
        />

        {/* Tasks Section Header */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-slate-900">Task Board</h2>
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                  onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'completed')}
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

          {/* Task Board Body */}
          {isLoading ? (
            /* Loading State Skeleton Grid */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-slate-100 rounded-2xl p-5 space-y-4 bg-slate-50/10 animate-pulse">
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
          ) : isError ? (
            /* Error State Layout */
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-red-100 bg-red-50/30 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-red-550 text-red-500" />
              <h3 className="text-base font-bold text-slate-900">Failed to load tasks</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                There was a problem communicating with the backend server. Please make sure the service is running.
              </p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer transition duration-150"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            /* Empty State Layout */
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No tasks found</h3>
                <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
                  {tasks.length === 0 
                    ? "Your task board is empty. Click 'Create Task' to add your first delegation!"
                    : "No tasks match your current search queries or filters. Try adjusting them."}
                </p>
              </div>
            </div>
          ) : (
            /* Active Task Cards Grid */
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusToggle={handleStatusToggle}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Task Modal Dialog */}
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => showNotification('success', 'Task created successfully!')}
      />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border bg-white px-4 py-3 shadow-lg animate-slide-up max-w-sm border-slate-100">
          <div className={`h-2.5 w-2.5 rounded-full ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className="text-xs font-semibold text-slate-800">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
