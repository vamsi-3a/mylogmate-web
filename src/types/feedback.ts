export interface FeedbackPayload {
  content: string;
}

export interface FeedbackItem {
  id: string;
  user_id: string;
  username: string;
  content: string;
  is_read: boolean;
  created_at: string;
}
