import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/apiClient';
import { useStore } from '../store/useStore';
import type { AuthResponse, TermsStatusResponse, TermsVersionResponse } from '../types/api';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  country: string;
  city: string;
  preferredLanguage: string;
  accountType: 'MEMBER' | 'COMMUNITY_LEADER' | 'ORGANIZATION';
  acceptedTermsVersion: string;
}

export function useCurrentTerms() {
  return useQuery({
    queryKey: ['terms', 'current'],
    queryFn: () => api.get<TermsVersionResponse>('/api/terms/current'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTermsStatus(enabled: boolean) {
  return useQuery({
    queryKey: ['terms', 'status'],
    queryFn: () => api.get<TermsStatusResponse>('/api/terms/status'),
    enabled,
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) =>
      api.post<{ email: string; message: string }>('/api/auth/register', payload),
  });
}

export function useLogin() {
  const setSession = useStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      api.post<AuthResponse>('/api/auth/login', payload),
    onSuccess: (data) => setSession(data.user, data.accessToken),
  });
}

export function useLogout() {
  const clearSession = useStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post<void>('/api/auth/logout'),
    onSettled: () => {
      clearSession();
      queryClient.clear();
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => api.get<void>(`/api/auth/verify-email?token=${encodeURIComponent(token)}`),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => api.post<void>('/api/auth/resend-verification', { email }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => api.post<void>('/api/auth/forgot-password', { email }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      api.post<void>('/api/auth/reset-password', payload),
  });
}

export function useAcceptTerms() {
  const updateCurrentUser = useStore((s) => s.updateCurrentUser);
  const currentUser = useStore((s) => s.currentUser);
  return useMutation({
    mutationFn: (version: string) => api.post<void>('/api/terms/accept', { version }),
    onSuccess: (_data, version) => {
      if (currentUser) {
        updateCurrentUser({ ...currentUser, acceptedTermsVersion: version, acceptedTermsDate: new Date().toISOString() });
      }
    },
  });
}
