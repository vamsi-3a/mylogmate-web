export interface Template {
  id: string;
  name: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SampleTemplate {
  id: string;
  category: string;
  icon: string;
  tint: 'blue' | 'cream' | 'sage';
  content: string;
}

export interface CreateTemplatePayload {
  name: string;
  content: string;
}

export interface UpdateTemplatePayload {
  name?: string;
  content?: string;
}
