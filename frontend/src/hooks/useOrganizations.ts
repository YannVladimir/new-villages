import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/apiClient';
import type { Organization } from '../types/organization';

export interface CreateOrganizationPayload {
  name: string;
  description?: string;
  services?: string;
  contactEmail?: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  description?: string;
  services?: string;
  contactEmail?: string;
  logoUrl?: string;
}

/** Returns null (not an error) when the current user hasn't created an organization page yet. */
export function useMyOrganization() {
  return useQuery({
    queryKey: ['organizations', 'mine'],
    queryFn: async (): Promise<Organization | null> => {
      try {
        return await api.get<Organization>('/api/organizations/me');
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });
}

export function useOrganizationsList() {
  return useQuery({
    queryKey: ['organizations', 'all'],
    queryFn: () => api.get<Organization[]>('/api/organizations'),
  });
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => api.get<Organization>(`/api/organizations/${id}`),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) => api.post<Organization>('/api/organizations', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });
}

export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrganizationPayload) => api.patch<Organization>(`/api/organizations/${id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['organizations'] }),
  });
}
