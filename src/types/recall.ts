export interface ChatSession {
  id: string;
  user_id: string;
  context_id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string; // decrypted on response
  source_log_ids: string[];
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export interface RecallQueryPayload {
  context_id: string;
  query: string;
  chat_session_id?: string;
}

export interface RecallQueryResponse {
  answer: string;
  source_log_ids: string[];
  latency_ms: number;
  chat_session_id: string;
}
