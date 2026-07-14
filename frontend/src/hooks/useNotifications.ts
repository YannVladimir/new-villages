import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import type { PageResponse } from '../types/api';
import type { AppNotification } from '../types/notification';
import { useStore } from '../store/useStore';

export function useNotifications(page = 0, size = 20) {
  const status = useStore((s) => s.status);
  return useQuery({
    queryKey: ['notifications', page, size],
    queryFn: () => api.get<PageResponse<AppNotification>>(`/api/notifications?page=${page}&size=${size}`),
    enabled: status === 'authenticated',
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<void>(`/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch<void>('/api/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
