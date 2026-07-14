import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { useStore } from '../store/useStore';
import type { PageResponse } from '../types/api';
import type { Conversation, Message } from '../types/message';

export interface StartConversationPayload {
  type: 'LEADER' | 'ORG' | 'ADMIN';
  communityId?: string;
  organizationId?: string;
  initialMessage: string;
}

export function useConversations() {
  const status = useStore((s) => s.status);
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get<Conversation[]>('/api/conversations'),
    enabled: status === 'authenticated',
    refetchInterval: 15_000,
  });
}

export function useMessages(conversationId: string | undefined, page = 0, size = 30) {
  return useQuery({
    queryKey: ['conversations', conversationId, 'messages', page, size],
    queryFn: () => api.get<PageResponse<Message>>(`/api/conversations/${conversationId}/messages?page=${page}&size=${size}`),
    enabled: !!conversationId,
    refetchInterval: 5_000,
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartConversationPayload) => api.post<Conversation>('/api/conversations', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.post<Message>(`/api/conversations/${conversationId}/messages`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', conversationId, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
