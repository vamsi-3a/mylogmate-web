import type { Tag } from './tag';

export type DateType = 'daily' | 'weekly' | 'custom';

export interface LogEntry {
  id: string;
  context_id: string;
  user_id: string;
  content: string; // decrypted on response
  date_type: DateType;
  date_start: string; // ISO date YYYY-MM-DD
  date_end: string;   // ISO date YYYY-MM-DD
  tags: Tag[];
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLogPayload {
  context_id: string;
  content: string;
  date_type: DateType;
  date_start: string;
  date_end: string;
  tag_ids: string[];
}

export interface UpdateLogPayload {
  content?: string;
  date_type?: DateType;
  date_start?: string;
  date_end?: string;
  tag_ids?: string[];
}

export interface LogListParams {
  context_id?: string;
  date_start?: string;
  date_end?: string;
  tag_ids?: string[];
  page?: number;
  page_size?: number;
}

/** Lightweight summary returned by GET /logs/:year/:month for recall calendar */
export interface LogCalendarEntry {
  id: string;
  date_start: string;
  date_end: string;
  date_type: DateType;
  tag_names: string[];
}
