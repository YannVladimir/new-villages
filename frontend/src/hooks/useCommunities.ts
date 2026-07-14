import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import type { PageResponse } from '../types/api';
import type {
  Community,
  CommunityAnalytics,
  CommunityCreationRequest,
  CommunityInvitation,
  CommunityMember,
} from '../types/community';

export interface CreateCommunityPayload {
  name: string;
  description?: string;
  category?: string;
  city?: string;
  visibility?: string;
  coverImageUrl?: string;
}

export function useCommunitySearch(query: string, category: string, page = 0, size = 20) {
  return useQuery({
    queryKey: ['communities', 'search', query, category, page, size],
    queryFn: () =>
      api.get<PageResponse<Community>>(
        `/api/communities?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}&page=${page}&size=${size}`
      ),
  });
}

export function useMyCommunities() {
  return useQuery({
    queryKey: ['communities', 'mine'],
    queryFn: () => api.get<Community[]>('/api/communities/mine'),
  });
}

export function useCommunityInvitations() {
  return useQuery({
    queryKey: ['communities', 'invitations'],
    queryFn: () => api.get<CommunityInvitation[]>('/api/communities/invitations'),
  });
}

export function useMyCreationRequests() {
  return useQuery({
    queryKey: ['communities', 'my-requests'],
    queryFn: () => api.get<CommunityCreationRequest[]>('/api/communities/my-requests'),
  });
}

export function useCommunity(id: string | undefined) {
  return useQuery({
    queryKey: ['communities', id],
    queryFn: () => api.get<Community>(`/api/communities/${id}`),
    enabled: !!id,
  });
}

export function useCommunityMembers(id: string | undefined) {
  return useQuery({
    queryKey: ['communities', id, 'members'],
    queryFn: () => api.get<CommunityMember[]>(`/api/communities/${id}/members`),
    enabled: !!id,
  });
}

function useInvalidateCommunities() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['communities'] });
  };
}

export function useJoinCommunity() {
  const invalidate = useInvalidateCommunities();
  return useMutation({
    mutationFn: (communityId: string) => api.post<Community>(`/api/communities/${communityId}/join`),
    onSuccess: invalidate,
  });
}

export function useLeaveCommunity() {
  const invalidate = useInvalidateCommunities();
  return useMutation({
    mutationFn: (communityId: string) => api.post<void>(`/api/communities/${communityId}/leave`),
    onSuccess: invalidate,
  });
}

export function useCreateCommunityRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommunityPayload) =>
      api.post<CommunityCreationRequest>('/api/communities', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['communities', 'my-requests'] }),
  });
}

export function useInviteMember(communityId: string) {
  return useMutation({
    mutationFn: (email: string) => api.post<void>(`/api/communities/${communityId}/invite`, { email }),
  });
}

export function useRespondToInvitation() {
  const invalidate = useInvalidateCommunities();
  return useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      api.post<void>(`/api/invitations/${id}/${accept ? 'accept' : 'decline'}`),
    onSuccess: invalidate,
  });
}

// --- Leader dashboard ---

export function useLeaderPendingRequests(communityId: string | undefined) {
  return useQuery({
    queryKey: ['leader', communityId, 'requests'],
    queryFn: () => api.get<CommunityMember[]>(`/api/leader/communities/${communityId}/requests`),
    enabled: !!communityId,
  });
}

export function useLeaderAnalytics(communityId: string | undefined) {
  return useQuery({
    queryKey: ['leader', communityId, 'analytics'],
    queryFn: () => api.get<CommunityAnalytics>(`/api/leader/communities/${communityId}/analytics`),
    enabled: !!communityId,
  });
}

export function useApproveJoinRequest(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post<void>(`/api/leader/communities/${communityId}/requests/${userId}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leader', communityId] }),
  });
}

export function useRejectJoinRequest(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post<void>(`/api/leader/communities/${communityId}/requests/${userId}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leader', communityId] }),
  });
}
