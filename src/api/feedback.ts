import { apiClient } from './client';
import type { ApiResponse } from '@/types/api';
import type { FeedbackPayload } from '@/types/feedback';

export const feedbackApi = {
  submit: async (payload: FeedbackPayload): Promise<void> => {
    await apiClient.post<ApiResponse<null>>('/api/v1/feedback', payload);
  },
};
