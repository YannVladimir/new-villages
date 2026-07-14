import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import type { PageResponse } from '../types/api';
import type { CommunityEvent } from '../types/event';

export interface CreateEventPayload {
  communityId?: string;
  organizationId?: string;
  title: string;
  description?: string;
  type: string;
  startAt: string;
  online: boolean;
  location?: string;
  onlineLink?: string;
  coverImageUrl?: string;
}

export function useEvents(opts: { communityId?: string; upcoming?: boolean; page?: number; size?: number } = {}) {
  const { communityId, upcoming, page = 0, size = 20 } = opts;
  const params = new URLSearchParams();
  if (communityId) params.set('communityId', communityId);
  if (upcoming) params.set('upcoming', 'true');
  params.set('page', String(page));
  params.set('size', String(size));

  return useQuery({
    queryKey: ['events', communityId ?? null, upcoming ?? false, page, size],
    queryFn: () => api.get<PageResponse<CommunityEvent>>(`/api/events?${params.toString()}`),
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', 'detail', id],
    queryFn: () => api.get<CommunityEvent>(`/api/events/${id}`),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => api.post<CommunityEvent>('/api/events', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.del<void>(`/api/events/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });
}

export function useRsvpToEvent(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: 'GOING' | 'INTERESTED' | 'DECLINED') =>
      api.post<CommunityEvent>(`/api/events/${eventId}/rsvp`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
