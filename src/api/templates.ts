import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Template, CreateTemplatePayload, UpdateTemplatePayload } from '@/types/template';

export const templatesApi = {
  list: async (): Promise<Template[]> => {
    const { data } = await apiClient.get<PaginatedResponse<Template>>('/api/v1/templates');
    return data.data;
  },

  get: async (id: string): Promise<Template> => {
    const { data } = await apiClient.get<ApiResponse<Template>>(`/api/v1/templates/${id}`);
    return data.data;
  },

  create: async (payload: CreateTemplatePayload): Promise<Template> => {
    const { data } = await apiClient.post<ApiResponse<Template>>('/api/v1/templates', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateTemplatePayload): Promise<Template> => {
    const { data } = await apiClient.patch<ApiResponse<Template>>(
      `/api/v1/templates/${id}`,
      payload,
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/templates/${id}`);
  },
};
