export type ContextType = 'self' | 'team' | 'project';

export interface Context {
  id: string;
  name: string;
  type: ContextType;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateContextPayload {
  name: string;
  type: ContextType;
}

export interface UpdateContextPayload {
  name: string;
}
