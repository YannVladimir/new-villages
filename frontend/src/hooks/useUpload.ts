import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/apiClient';

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.upload<{ url: string }>('/api/uploads/images', formData);
    },
  });
}
