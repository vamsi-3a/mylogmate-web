import { useEffect, useState } from 'react';
import { Users, Activity, MessageSquare, TrendingUp, Search, ChevronLeft, ChevronRight, UserCheck, UserX, Mail, MailOpen } from 'lucide-react';
import { adminApi } from '@/api/admin';
import type { AdminDashboard, AdminUser, AdminRange, TimeSeries } from '@/types/admin';
import type { FeedbackItem } from '@/types/feedback';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ── Admin Page ────────────────────────────────────────────────────────────

const RANGES: { id: AdminRange; label: string }[] = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: 'all', label: 'All time' },
];

export default function Admin() {
  const { toast } = useToast();
  const [range, setRange] = useState<AdminRange>('30d');
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [dashLoading, setDashLoading] = useState(true);
  const [dashError, setDashError] = useState<string | null>(null);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);

  // ── Load dashboard stats ──
  useEffect(() => {
    setDashLoading(true);
    setDashError(null);
    adminApi
      .getStats(range)
      .then(setDashboard)
      .catch(() => setDashError('Failed to load stats.'))
      .finally(() => setDashLoading(false));
  }, [range]);

  // ── Load users ──
  useEffect(() => {
    setUsersLoading(true);
    setUsersError(null);
    const search = usersSearch.trim() || undefined;
    adminApi
      .listUsers(usersPage, 20, search)
      .then(({ data, total }) => { setUsers(data); setUsersTotal(total); })
      .catch(() => setUsersError('Failed to load users.'))
      .finally(() => setUsersLoading(false));
  }, [usersPage, usersSearch]);

  // ── Load feedback ──
  useEffect(() => {
    setFeedbackLoading(true);
    setFeedbackError(null);
    adminApi
      .listFeedback(feedbackPage, unreadOnly)
      .then(({ data, total }) => { setFeedback(data); setFeedbackTotal(total); })
      .catch(() => setFeedbackError('Failed to load feedback.'))
      .finally(() => setFeedbackLoading(false));
  }, [feedbackPage, unreadOnly]);

  async function handleToggleActive(userId: string) {
    try {
      const updated = await adminApi.toggleUserActive(userId);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast(`User ${updated.is_active ? 'activated' : 'deactivated'}.`, 'success');
    } catch {
      toast('Failed to toggle user status.', 'error');
    }
  }

  async function handleMarkRead(feedbackId: string) {
    try {
      await adminApi.markFeedbackRead(feedbackId);
      setFeedback((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, is_read: true } : f)),
      );
    } catch {
      toast('Failed to mark as read.', 'error');
    }
  }

  const totalPages = Math.ceil(usersTotal / 20);
  const feedbackTotalPages = Math.ceil(feedbackTotal / 20);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16 space-y-10">
      <PageHeader
        eyebrow="Admin"
        title="Dashboard"
        subtitle="Platform health, user activity, and feedback at a glance."
      />

      {/* ── Range filter ── */}
      <div className="flex items-center gap-2">
        {RANGES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all',
              range === r.id
                ? 'bg-ink dark:bg-white text-white dark:text-ink shadow-card'
                : 'text-ink-2 hover:text-ink hover:bg-gray-100 dark:hover:bg-surface-3',
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* ── Stats cards ── */}
      {dashLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} className="h-28 rounded-card-lg" />)}
        </div>
      ) : dashError ? (
        <ErrorBox message={dashError} />
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<Users size={18} />}
              label="Total users"
              value={dashboard.stats.total_users}
              sub={`${dashboard.stats.new_signups_period} new`}
              tint="blue"
            />
            <StatCard
              icon={<Activity size={18} />}
              label="Active (7d)"
              value={dashboard.stats.active_users_7d}
              sub={`${dashboard.stats.active_users_30d} in 30d`}
              tint="sage"
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="Total logs"
              value={dashboard.stats.total_logs}
              tint="cream"
            />
            <StatCard
              icon={<MessageSquare size={18} />}
              label="AI queries"
              value={dashboard.stats.total_ai_queries}
              sub={`${dashboard.stats.ai_queries_period} in period`}
              tint="blue"
            />
          </div>

          {/* ── Sparkline chart ── */}
          {dashboard.series.length > 0 && (
            <section>
              <h2 className="text-[14px] font-bold text-ink dark:text-white mb-4">
                Activity over time
              </h2>
              <ActivityChart series={dashboard.series} />
            </section>
          )}

          {/* ── Top users ── */}
          {dashboard.top_users.length > 0 && (
            <section>
              <h2 className="text-[14px] font-bold text-ink dark:text-white mb-3">
                Most active loggers
              </h2>
              <div className="flex flex-col gap-2">
                {dashboard.top_users.slice(0, 5).map((u, i) => (
                  <div
                    key={u.username}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A]"
                  >
                    <span className="text-[13px] font-bold text-ink-3 w-5 text-center">{i + 1}</span>
                    <Avatar username={u.username} size={28} />
                    <span className="text-[14px] font-semibold text-ink dark:text-white flex-1">
                      @{u.username}
                    </span>
                    <span className="text-[13px] text-ink-2">
                      {u.count} {u.count === 1 ? 'log' : 'logs'}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : null}

      {/* ── Users table ── */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="text-[14px] font-bold text-ink dark:text-white">
            Users
            {!usersLoading && (
              <span className="ml-2 text-[12.5px] text-ink-3 font-normal">({usersTotal})</span>
            )}
          </h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              type="text"
              value={usersSearch}
              onChange={(e) => { setUsersSearch(e.target.value); setUsersPage(1); }}
              placeholder="Search users…"
              className="h-9 pl-8 pr-3.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-surface-2 text-[13px] text-ink dark:text-white placeholder:text-ink-3 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(126,176,247,0.18)] transition-all w-48"
            />
          </div>
        </div>

        {usersLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        ) : usersError ? (
          <ErrorBox message={usersError} />
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-[14px] text-ink-3">No users found.</div>
        ) : (
          <>
            <div className="rounded-card-lg border border-gray-100 dark:border-[#2A2A2A] overflow-hidden">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_80px_80px_80px_100px] gap-3 px-4 py-2.5 bg-gray-50 dark:bg-surface-3 text-[11.5px] font-semibold text-ink-3 uppercase tracking-wider">
                <span>User</span>
                <span>Email</span>
                <span className="text-right">Logs</span>
                <span className="text-right">Queries</span>
                <span className="text-right">Last active</span>
                <span className="text-right">Status</span>
              </div>

              {/* Rows */}
              {users.map((u, i) => (
                <div
                  key={u.id}
                  className={cn(
                    'flex sm:grid sm:grid-cols-[1fr_1fr_80px_80px_80px_100px] gap-2 sm:gap-3',
                    'items-center px-4 py-3 text-[13.5px]',
                    i % 2 === 0 ? 'bg-white dark:bg-surface-2' : 'bg-gray-50/50 dark:bg-surface-3/50',
                    i !== users.length - 1 && 'border-b border-gray-100 dark:border-[#2A2A2A]',
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar username={u.username} size={26} />
                    <span className="font-semibold text-ink dark:text-white truncate">
                      @{u.username}
                      {u.is_admin && (
                        <span className="ml-1.5 text-[10px] font-bold text-accent-active bg-accent-tint px-1.5 py-0.5 rounded-full">
                          Admin
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="hidden sm:block text-ink-2 truncate">{u.email ?? '—'}</span>
                  <span className="hidden sm:block text-right text-ink-2">{u.log_count}</span>
                  <span className="hidden sm:block text-right text-ink-2">{u.query_count}</span>
                  <span className="hidden sm:block text-right text-ink-3">
                    {u.last_active_days === 0
                      ? 'Today'
                      : u.last_active_days === 1
                      ? '1d ago'
                      : `${u.last_active_days}d ago`}
                  </span>
                  <div className="flex justify-end sm:justify-end gap-1.5 ml-auto sm:ml-0">
                    <span
                      className={cn(
                        'text-[11px] font-semibold px-2 py-0.5 rounded-full',
                        u.is_active
                          ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
                      )}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {!u.is_admin && (
                      <button
                        type="button"
                        onClick={() => handleToggleActive(u.id)}
                        aria-label={u.is_active ? 'Deactivate user' : 'Activate user'}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink hover:bg-gray-100 dark:hover:bg-surface-3 transition-colors"
                      >
                        {u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-[12.5px] text-ink-3">
                  Page {usersPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={<ChevronLeft size={14} />}
                    onClick={() => setUsersPage((p) => p - 1)}
                    disabled={usersPage === 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setUsersPage((p) => p + 1)}
                    disabled={usersPage === totalPages}
                  >
                    Next
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Feedback ── */}
      <section>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h2 className="text-[14px] font-bold text-ink dark:text-white">
            Feedback
            {!feedbackLoading && (
              <span className="ml-2 text-[12.5px] text-ink-3 font-normal">({feedbackTotal})</span>
            )}
          </h2>
          <button
            type="button"
            onClick={() => { setUnreadOnly((v) => !v); setFeedbackPage(1); }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold transition-colors',
              unreadOnly
                ? 'bg-accent-tint text-accent-active border border-accent/20'
                : 'text-ink-2 hover:text-ink border border-gray-200 dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-surface-3',
            )}
          >
            <Mail size={13} />
            Unread only
          </button>
        </div>

        {feedbackLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : feedbackError ? (
          <ErrorBox message={feedbackError} />
        ) : feedback.length === 0 ? (
          <div className="py-8 text-center text-[14px] text-ink-3">
            {unreadOnly ? 'No unread feedback.' : 'No feedback yet.'}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {feedback.map((f) => (
                <FeedbackCard
                  key={f.id}
                  item={f}
                  onMarkRead={() => handleMarkRead(f.id)}
                />
              ))}
            </div>
            {feedbackTotalPages > 1 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-[12.5px] text-ink-3">
                  Page {feedbackPage} of {feedbackTotalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leadingIcon={<ChevronLeft size={14} />}
                    onClick={() => setFeedbackPage((p) => p - 1)}
                    disabled={feedbackPage === 1}
                  >
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setFeedbackPage((p) => p + 1)}
                    disabled={feedbackPage === feedbackTotalPages}
                  >
                    Next
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────

const STAT_TINTS: Record<string, { bg: string; iconBg: string; iconColor: string }> = {
  blue: {
    bg: 'bg-accent-tint dark:bg-[rgba(107,159,255,0.08)]',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent-active',
  },
  sage: {
    bg: 'bg-sage-tint dark:bg-[rgba(107,191,138,0.08)]',
    iconBg: 'bg-[#6BBF8A]/10',
    iconColor: 'text-[#4DA870]',
  },
  cream: {
    bg: 'bg-cream-tint dark:bg-[rgba(201,163,90,0.08)]',
    iconBg: 'bg-[#C9A35A]/10',
    iconColor: 'text-[#9C7A3C]',
  },
};

function StatCard({
  icon,
  label,
  value,
  sub,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  tint: 'blue' | 'sage' | 'cream';
}) {
  const t = STAT_TINTS[tint];
  return (
    <div className={cn('rounded-card-lg border border-black/5 dark:border-white/5 p-5', t.bg)}>
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', t.iconBg)}>
        <span className={t.iconColor}>{icon}</span>
      </div>
      <div className="text-[28px] font-bold text-ink dark:text-white tabular-nums leading-none" style={{ letterSpacing: '-0.02em' }}>
        {value.toLocaleString()}
      </div>
      <div className="text-[12.5px] text-ink-2 mt-1.5">{label}</div>
      {sub && <div className="text-[11.5px] text-ink-3 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Activity Chart ────────────────────────────────────────────────────────

function ActivityChart({ series }: { series: TimeSeries[] }) {
  const maxSignups = Math.max(1, ...series.map((s) => s.signups));
  const maxQueries = Math.max(1, ...series.map((s) => s.queries));
  const maxVal = Math.max(maxSignups, maxQueries);

  // Show only last 30 points for readability
  const slice = series.slice(-30);

  return (
    <div className="rounded-card-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-surface-2 p-5">
      {/* Legend */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
          <span className="w-3 h-3 rounded-sm bg-accent" />
          Signups
        </div>
        <div className="flex items-center gap-1.5 text-[12.5px] text-ink-2">
          <span className="w-3 h-3 rounded-sm bg-[#6BBF8A]" />
          AI queries
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-1 h-32 overflow-hidden">
        {slice.map((s, i) => {
          const signupH = s.signups === 0 ? 2 : Math.max(4, Math.round((s.signups / maxVal) * 120));
          const queryH = s.queries === 0 ? 2 : Math.max(4, Math.round((s.queries / maxVal) * 120));
          return (
            <div key={i} className="flex-1 flex items-end gap-px" title={s.date}>
              <span
                className="flex-1 rounded-t-[2px] transition-all"
                style={{ height: signupH, background: '#7EB0F7', opacity: 0.85 }}
              />
              <span
                className="flex-1 rounded-t-[2px] transition-all"
                style={{ height: queryH, background: '#6BBF8A', opacity: 0.85 }}
              />
            </div>
          );
        })}
      </div>

      {/* X-axis labels — first / mid / last */}
      {slice.length >= 3 && (
        <div className="flex justify-between mt-2 text-[11px] text-ink-3">
          <span>{slice[0].date}</span>
          <span>{slice[Math.floor(slice.length / 2)].date}</span>
          <span>{slice[slice.length - 1].date}</span>
        </div>
      )}
    </div>
  );
}

// ── Feedback Card ─────────────────────────────────────────────────────────

function FeedbackCard({ item, onMarkRead }: { item: FeedbackItem; onMarkRead: () => void }) {
  const date = new Date(item.created_at);
  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        item.is_read
          ? 'bg-white dark:bg-surface-2 border-gray-100 dark:border-[#2A2A2A]'
          : 'bg-accent-tint border-accent/20 dark:bg-[rgba(107,159,255,0.06)] dark:border-accent/10',
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {!item.is_read && (
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
          )}
          <span className="text-[13.5px] font-semibold text-ink dark:text-white">
            @{item.username}
          </span>
          <span className="text-[12px] text-ink-3">{dateLabel}</span>
        </div>
        {!item.is_read && (
          <button
            type="button"
            onClick={onMarkRead}
            aria-label="Mark as read"
            className="flex items-center gap-1 text-[12px] text-ink-3 hover:text-ink transition-colors flex-shrink-0"
          >
            <MailOpen size={12} />
            Mark read
          </button>
        )}
      </div>
      <p className="text-[13.5px] text-ink-2 leading-relaxed whitespace-pre-wrap">
        {item.content}
      </p>
    </div>
  );
}

// ── Error Box ─────────────────────────────────────────────────────────────

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-6 text-center">
      <p className="text-[14px] text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}
