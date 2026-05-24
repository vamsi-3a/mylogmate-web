export interface Tag {
  id: string;
  name: string;
  user_id: string;
  use_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTagPayload {
  name: string;
}

export interface UpdateTagPayload {
  name: string;
}
