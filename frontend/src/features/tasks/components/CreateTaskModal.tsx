'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers } from '@/services/users';
import { createTask, CreateTaskInput } from '@/services/tasks';
import { X, Loader2 } from 'lucide-react';

const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  description: z.string().optional(),
  assigned_to: z.string().optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTaskModal({ isOpen, onClose }: CreateTaskModalProps) {
  const queryClient = useQueryClient();

  // Reset form when modal opens/closes
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      assigned_to: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  // Fetch users for the assignee dropdown
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: isOpen, // Only fetch when modal is open
  });

  // Mutation to create a task
  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate tasks query to trigger fresh list reload
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: CreateTaskFormValues) => {
    const input: CreateTaskInput = {
      title: data.title,
      description: data.description || undefined,
      assigned_to: data.assigned_to ? parseInt(data.assigned_to, 10) : null,
    };
    mutation.mutate(input);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-slide-up z-10 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Create New Task</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition duration-155 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
          {mutation.isError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-650 border border-red-100 text-red-600">
              { (mutation.error as any)?.response?.data?.error || 'Failed to create task. Please try again.' }
            </div>
          )}

          {/* Title Field */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-semibold text-slate-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              disabled={mutation.isPending}
              placeholder="e.g. Design Landing Page"
              {...register('title')}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none transition duration-150 ${
                errors.title 
                  ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                  : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            {errors.title && (
              <p className="text-xs font-semibold text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              disabled={mutation.isPending}
              rows={4}
              placeholder="Describe the task expectations, details or guidelines..."
              {...register('description')}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 bg-slate-50/50 focus:bg-white focus:outline-none transition duration-150 focus:border-blue-500"
            />
          </div>

          {/* Assignee Selection Field */}
          <div className="space-y-1.5">
            <label htmlFor="assigned_to" className="text-sm font-semibold text-slate-700">
              Assign to User
            </label>
            <div className="relative">
              <select
                id="assigned_to"
                disabled={mutation.isPending || isLoadingUsers}
                {...register('assigned_to')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition duration-150 cursor-pointer appearance-none disabled:opacity-60"
              >
                <option value="">Unassigned (Assign later)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id.toString()}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              {isLoadingUsers && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer disabled:opacity-70"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
