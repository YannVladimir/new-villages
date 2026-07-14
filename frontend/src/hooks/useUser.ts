import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { useStore } from '../store/useStore';
import type { User } from '../types/api';

export interface UpdateProfilePayload {
  fullName?: string;
  bio?: string;
  city?: string;
  preferredLanguage?: string;
  spokenLanguages?: string[];
  selectedCommunityId?: string;
}

export function useUpdateProfile() {
  const updateCurrentUser = useStore((s) => s.updateCurrentUser);
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => api.patch<User>('/api/users/me', payload),
    onSuccess: (user) => updateCurrentUser(user),
  });
}

export function useUploadAvatar() {
  const updateCurrentUser = useStore((s) => s.updateCurrentUser);
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload<User>('/api/users/me/avatar', formData);
    },
    onSuccess: (user) => updateCurrentUser(user),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.patch<void>('/api/users/me/password', payload),
  });
}

export function useDeactivateAccount() {
  const clearSession = useStore((s) => s.clearSession);
  return useMutation({
    mutationFn: () => api.del<void>('/api/users/me'),
    onSuccess: () => clearSession(),
  });
}

export interface PublicUser {
  id: string;
  fullName: string;
  role: string;
  city: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ['users', 'blocked'],
    queryFn: () => api.get<PublicUser[]>('/api/users/me/blocked'),
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.post<void>(`/api/users/${userId}/block`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'blocked'] }),
  });
}

export function useUnblockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.del<void>(`/api/users/${userId}/block`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'blocked'] }),
  });
}
