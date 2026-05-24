import type { User } from './auth';

export interface AdminStats {
  total_users: number;
  active_users_7d: number;
  active_users_30d: number;
  total_logs: number;
  total_ai_queries: number;
  new_signups_period: number;
  ai_queries_period: number;
}

export interface AdminUser extends User {
  log_count: number;
  query_count: number;
  last_active_days: number;
}

export interface TimeSeries {
  date: string;
  signups: number;
  queries: number;
}

export interface AdminDashboard {
  stats: AdminStats;
  series: TimeSeries[];
  top_users: { username: string; count: number }[];
}

export type AdminRange = '7d' | '30d' | '90d' | 'all';
