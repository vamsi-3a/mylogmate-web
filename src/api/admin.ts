import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { AdminDashboard, AdminUser, AdminRange } from '@/types/admin';
import type { FeedbackItem } from '@/types/feedback';

export const adminApi = {
  getStats: async (range: AdminRange): Promise<AdminDashboard> => {
    const { data } = await apiClient.get<ApiResponse<AdminDashboard>>('/api/v1/admin/stats', {
      params: { range },
    });
    return data.data;
  },

  listUsers: async (
    page = 1,
    pageSize = 20,
    search?: string,
  ): Promise<{ data: AdminUser[]; total: number }> => {
    const { data } = await apiClient.get<PaginatedResponse<AdminUser>>('/api/v1/admin/users', {
      params: { page, page_size: pageSize, ...(search ? { search } : {}) },
    });
    return { data: data.data, total: data.total };
  },

  toggleUserActive: async (userId: string): Promise<AdminUser> => {
    const { data } = await apiClient.post<ApiResponse<AdminUser>>(
      `/api/v1/admin/users/${userId}/toggle-active`,
    );
    return data.data;
  },

  listFeedback: async (
    page = 1,
    unreadOnly = false,
  ): Promise<{ data: FeedbackItem[]; total: number }> => {
    const { data } = await apiClient.get<PaginatedResponse<FeedbackItem>>(
      '/api/v1/admin/feedback',
      { params: { page, ...(unreadOnly ? { unread_only: true } : {}) } },
    );
    return { data: data.data, total: data.total };
  },

  markFeedbackRead: async (feedbackId: string): Promise<void> => {
    await apiClient.post(`/api/v1/admin/feedback/${feedbackId}/mark-read`);
  },
};
