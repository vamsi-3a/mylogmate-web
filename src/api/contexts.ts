import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Context, CreateContextPayload, UpdateContextPayload } from '@/types/context';

export const contextsApi = {
  list: async (): Promise<Context[]> => {
    const { data } = await apiClient.get<PaginatedResponse<Context>>('/api/v1/contexts');
    return data.data;
  },

  get: async (id: string): Promise<Context> => {
    const { data } = await apiClient.get<ApiResponse<Context>>(`/api/v1/contexts/${id}`);
    return data.data;
  },

  create: async (payload: CreateContextPayload): Promise<Context> => {
    const { data } = await apiClient.post<ApiResponse<Context>>('/api/v1/contexts', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateContextPayload): Promise<Context> => {
    const { data } = await apiClient.patch<ApiResponse<Context>>(
      `/api/v1/contexts/${id}`,
      payload,
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/contexts/${id}`);
  },
};
