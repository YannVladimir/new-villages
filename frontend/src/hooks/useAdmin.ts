import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import type { PageResponse } from '../types/api';
import type { CommunityCreationRequest, Community } from '../types/community';
import type { ReportResponse } from './useReports';

export interface AdminStats {
  totalUsers: number;
  totalCommunities: number;
  activeSubscriptions: number;
  openReports: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  city: string | null;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  createdAt: string;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  actorName: string;
  targetType: string | null;
  targetId: string | null;
  description: string | null;
  createdAt: string;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/api/admin/stats/overview'),
  });
}

export function useAdminUsers(search: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['admin', 'users', search, page, size],
    queryFn: () => api.get<PageResponse<AdminUser>>(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&size=${size}`),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.patch<void>(`/api/admin/users/${userId}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useReinstateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.patch<void>(`/api/admin/users/${userId}/reinstate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useAdminLeaderApplications() {
  return useQuery({
    queryKey: ['admin', 'leader-applications'],
    queryFn: () => api.get<CommunityCreationRequest[]>('/api/admin/leader-applications'),
  });
}

export function useApproveLeaderApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/admin/leader-applications/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useRejectLeaderApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<void>(`/api/admin/leader-applications/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useAdminCommunities() {
  return useQuery({
    queryKey: ['admin', 'communities'],
    queryFn: () => api.get<Community[]>('/api/admin/communities'),
  });
}

export function useAdminRemoveCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/admin/communities/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'communities'] }),
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => api.get<ReportResponse[]>('/api/admin/reports'),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'REMOVE_CONTENT' | 'SUSPEND_USER' | 'DISMISS' }) =>
      api.post<void>(`/api/admin/reports/${id}/resolve`, { action }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin'] }),
  });
}

export function useAdminSubscriptions() {
  return useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => api.get<AdminSubscription[]>('/api/admin/subscriptions'),
  });
}

export function useAdminLogs() {
  return useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () => api.get<ActivityLog[]>('/api/admin/logs'),
  });
}
