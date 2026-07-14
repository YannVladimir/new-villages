import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import type { PageResponse } from '../types/api';
import type { CommunityPost } from '../types/post';

export function useActivityFeed(page = 0, size = 20) {
  return useQuery({
    queryKey: ['posts', 'feed', page, size],
    queryFn: () => api.get<PageResponse<CommunityPost>>(`/api/posts/feed?page=${page}&size=${size}`),
  });
}

export function useCommunityPosts(communityId: string | undefined, page = 0, size = 20) {
  return useQuery({
    queryKey: ['posts', 'community', communityId, page, size],
    queryFn: () => api.get<PageResponse<CommunityPost>>(`/api/communities/${communityId}/posts?page=${page}&size=${size}`),
    enabled: !!communityId,
  });
}

export function useCreatePost(communityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post<CommunityPost>(`/api/communities/${communityId}/posts`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
