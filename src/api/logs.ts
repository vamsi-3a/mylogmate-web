import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { LogEntry, CreateLogPayload, UpdateLogPayload, LogListParams } from '@/types/log';

export const logsApi = {
  list: async (params?: LogListParams): Promise<{ data: LogEntry[]; total: number }> => {
    const { data } = await apiClient.get<PaginatedResponse<LogEntry>>('/api/v1/logs', { params });
    return { data: data.data, total: data.total };
  },

  get: async (id: string): Promise<LogEntry> => {
    const { data } = await apiClient.get<ApiResponse<LogEntry>>(`/api/v1/logs/${id}`);
    return data.data;
  },

  create: async (payload: CreateLogPayload): Promise<LogEntry> => {
    const { data } = await apiClient.post<ApiResponse<LogEntry>>('/api/v1/logs', payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateLogPayload): Promise<LogEntry> => {
    const { data } = await apiClient.patch<ApiResponse<LogEntry>>(`/api/v1/logs/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/logs/${id}`);
  },
};
