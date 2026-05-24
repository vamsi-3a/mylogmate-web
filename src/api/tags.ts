import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Tag, CreateTagPayload, UpdateTagPayload } from '@/types/tag';

export const tagsApi = {
  list: async (): Promise<Tag[]> => {
    const { data } = await apiClient.get<PaginatedResponse<Tag>>('/api/v1/tags');
    return data.data;
  },

  create: async (payload: CreateTagPayload): Promise<Tag> => {
    const { data } = await apiClient.post<ApiResponse<Tag>>('/api/v1/tags', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateTagPayload): Promise<Tag> => {
    const { data } = await apiClient.patch<ApiResponse<Tag>>(`/api/v1/tags/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/tags/${id}`);
  },
};
