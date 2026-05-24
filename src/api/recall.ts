import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type {
  ChatSession,
  ChatSessionDetail,
  RecallQueryPayload,
  RecallQueryResponse,
} from '@/types/recall';

export const recallApi = {
  query: async (payload: RecallQueryPayload): Promise<RecallQueryResponse> => {
    const { data } = await apiClient.post<ApiResponse<RecallQueryResponse>>(
      '/api/v1/recall',
      payload,
    );
    return data.data;
  },

  listSessions: async (
    page = 1,
    pageSize = 20,
  ): Promise<{ data: ChatSession[]; total: number }> => {
    const { data } = await apiClient.get<PaginatedResponse<ChatSession>>(
      '/api/v1/recall/sessions',
      { params: { page, page_size: pageSize } },
    );
    return { data: data.data, total: data.total };
  },

  getSession: async (sessionId: string): Promise<ChatSessionDetail> => {
    const { data } = await apiClient.get<ApiResponse<ChatSessionDetail>>(
      `/api/v1/recall/sessions/${sessionId}`,
    );
    return data.data;
  },

  deleteSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/recall/sessions/${sessionId}`);
  },
};
