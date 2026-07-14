import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/apiClient';

export interface ReportResponse {
  id: string;
  reporterName: string;
  targetType: 'USER' | 'COMMUNITY' | 'MESSAGE';
  targetId: string;
  targetLabel: string;
  reason: string;
  details: string | null;
  status: 'OPEN' | 'REVIEWING' | 'RESOLVED';
  createdAt: string;
}

export interface SubmitReportPayload {
  targetType: 'USER' | 'COMMUNITY' | 'MESSAGE';
  targetId: string;
  reason: string;
  details?: string;
}

export function useSubmitReport() {
  return useMutation({
    mutationFn: (payload: SubmitReportPayload) => api.post<ReportResponse>('/api/reports', payload),
  });
}
