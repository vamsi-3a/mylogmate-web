import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUp,
  X,
  Pencil,
  Trash2,
  ArrowLeft,
  User,
  ExternalLink,
} from 'lucide-react';
import { logsApi } from '@/api/logs';
import { recallApi } from '@/api/recall';
import type { LogEntry } from '@/types/log';
import type { ContextType } from '@/types/context';
import type { RecallQueryPayload } from '@/types/recall';
import { TagChip } from '@/components/ui/TagChip';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';
import {
  MONTH_NAMES,
  startOfDay,
  sameDay,
  fromISODate,
  formatDate,
  formatDateRange,
} from '@/utils/date';

// ── Types ─────────────────────────────────────────────────────────────────

interface ChatMsg {
  role: 'user' | 'ai';
  text?: string;
  thinking?: boolean;
  sources?: string[];
}

// ── Recall Detail Page ────────────────────────────────────────────────────

export default function RecallDetail() {
  const navigate = useNavigate();
  const { year: yearParam, month: monthParam } = useParams<{ year: string; month: string }>();
  const location = useLocation();
  const state = location.state as { contextTab?: ContextType; entityId?: string } | null;
  const { toast } = useToast();

  const year = Number(yearParam ?? new Date().getFullYear());
  // month in URL is 1-based → convert to 0-based
  const month = Number(monthParam ?? new Date().getMonth() + 1) - 1;
  const contextTab = state?.contextTab ?? 'self';
  const entityId = state?.entityId ?? null;

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // AI chat
  const [chatOpen, setChatOpen] = useState(false);
  const [aiBarValue, setAiBarValue] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const contextLabel =
    contextTab === 'self' ? 'Self' : contextTab === 'team' ? 'Teammate' : 'Project';
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  // Load logs for this month
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const contextId = contextTab === 'self' ? 'self' : entityId;
    const pad = (n: number) => String(n).padStart(2, '0');
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    logsApi
      .list({
        context_id: contextId ?? undefined,
        date_start: `${year}-${pad(month + 1)}-01`,
        date_end: `${year}-${pad(month + 1)}-${pad(daysInMonth)}`,
      })
      .then(({ data }) => setLogs(data))
      .catch(() => setError('Failed to load logs.'))
      .finally(() => setIsLoading(false));
  }, [year, month, contextTab, entityId]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Filtered logs by selected day
  const displayedLogs = selectedDay
    ? logs.filter((l) => {
        const start = fromISODate(l.date_start);
        const end = fromISODate(l.date_end);
        const d = selectedDay;
        return (
          (sameDay(d, start) ||
            (d >= startOfDay(start) && d <= startOfDay(end)))
        );
      })
    : logs;

  const expandedLog = logs.find((l) => l.id === expandedLogId);

  async function handleAskAI() {
    const q = aiBarValue.trim();
    if (!q) return;
    setAiBarValue('');
    setChatOpen(true);
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: q },
      { role: 'ai', thinking: true },
    ]);

    try {
      const contextId = contextTab === 'self' ? 'self' : (entityId ?? 'self');
      const payload: RecallQueryPayload = {
        query: q,
        context_id: contextId,
      };
      const result = await recallApi.query(payload);
      // Map source_log_ids back to date labels using loaded logs
      const sourceLabels = result.source_log_ids
        .map((id) => {
          const l = logs.find((log) => log.id === id);
          return l ? formatDate(fromISODate(l.date_start), 'medium') : null;
        })
        .filter(Boolean) as string[];
      setChatMessages((prev) => [
        ...prev.slice(0, -1), // remove thinking
        {
          role: 'ai',
          text: result.answer,
          sources: sourceLabels,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    }
  }

  async function handleDeleteLog(id: string) {
    try {
      await logsApi.delete(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setExpandedLogId(null);
      toast('Log deleted.', 'success');
    } catch {
      toast('Failed to delete log.', 'error');
    } finally {
      setDeleteConfirmId(null);
    }
  }

  function navMonth(direction: -1 | 1) {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear -= 1; }
    if (newMonth > 11) { newMonth = 0; newYear += 1; }
    navigate(`/recall/${newYear}/${newMonth + 1}`, {
      state: { contextTab, entityId },
    });
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)] pb-24">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12.5px] text-ink-3 mb-3">
          <button type="button" onClick={() => navigate('/recall')} className="hover:text-ink transition-colors">
            Recall
          </button>
          <span>/</span>
          <span>{contextLabel}</span>
          <span>/</span>
          <button type="button" onClick={() => navigate(`/recall/${year}`, { state: { contextTab, entityId } })} className="hover:text-ink transition-colors">
            {year}
          </button>
          <span>/</span>
          <span className="text-ink dark:text-white font-semibold">{MONTH_NAMES[month]}</span>
        </nav>

        <h1 className="text-[26px] font-bold text-ink dark:text-white tracking-heading mb-1">
          {monthLabel}
        </h1>
        <p className="text-[13.5px] text-ink-2 mb-6">
          {isLoading
            ? 'Loading…'
            : `${logs.length} log${logs.length !== 1 ? 's' : ''}. Pick a date or ask anything below.`}
        </p>

        {/* Split view */}
        <div className="flex gap-6 items-start flex-col lg:flex-row">
          {/* Calendar — left */}
          <div className="w-full lg:w-[40%] lg:flex-shrink-0">
            <RecallCalendar
              year={year}
              month={month}
              logs={logs}
              selectedDay={selectedDay}
              onSelect={(d) => setSelectedDay(sameDay(d, selectedDay ?? new Date(0)) ? null : d)}
              onPrev={() => navMonth(-1)}
              onNext={() => navMonth(1)}
            />
          </div>

          {/* Log list — right */}
          <div className="flex-1 min-w-0">
            {isLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <CardSkeleton key={i} className="h-32 rounded-card-lg" />
                ))}
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-6 text-center">
                <p className="text-[14px] text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {!isLoading && !error && logs.length === 0 && (
              <EmptyState
                icon={Sparkles}
                title="No logs this month"
                description="Start logging to build a history you can search."
                action={{ label: 'Add a log', onClick: () => navigate('/log') }}
              />
            )}

            {!isLoading && !error && logs.length > 0 && expandedLog ? (
              <ExpandedLogView
                log={expandedLog}
                onBack={() => setExpandedLogId(null)}
                onDelete={() => setDeleteConfirmId(expandedLog.id)}
              />
            ) : !isLoading && !error && logs.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1 mb-1">
                  <span className="text-[14px] font-semibold text-ink dark:text-white">
                    {displayedLogs.length} {selectedDay ? 'matching ' : ''}log{displayedLogs.length !== 1 ? 's' : ''}
                  </span>
                  {selectedDay && (
                    <button
                      type="button"
                      onClick={() => setSelectedDay(null)}
                      className="text-[12.5px] text-ink-3 hover:text-ink flex items-center gap-1"
                    >
                      <X size={12} /> Clear filter
                    </button>
                  )}
                </div>
                {displayedLogs.map((log) => (
                  <LogCard
                    key={log.id}
                    log={log}
                    highlighted={selectedDay != null}
                    onOpen={() => setExpandedLogId(log.id)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* AI bar */}
      {!chatOpen && (
        <AIBar
          value={aiBarValue}
          onChange={setAiBarValue}
          onSend={handleAskAI}
        />
      )}

      {/* Chat overlay */}
      {chatOpen && (
        <ChatOverlay
          messages={chatMessages}
          bodyRef={chatBodyRef}
          context={`${monthLabel} · ${contextLabel}`}
          onClose={() => setChatOpen(false)}
          onSend={(q) => {
            setChatMessages((prev) => [
              ...prev,
              { role: 'user', text: q },
              { role: 'ai', thinking: true },
            ]);
            // same AI call as handleAskAI but inline
            const contextId = contextTab === 'self' ? 'self' : (entityId ?? 'self');
            recallApi
              .query({ query: q, context_id: contextId })
              .then((result) => {
                const sourceLabels = result.source_log_ids
                  .map((id) => {
                    const l = logs.find((log) => log.id === id);
                    return l ? formatDate(fromISODate(l.date_start), 'medium') : null;
                  })
                  .filter(Boolean) as string[];
                setChatMessages((prev) => [
                  ...prev.slice(0, -1),
                  {
                    role: 'ai',
                    text: result.answer,
                    sources: sourceLabels,
                  },
                ]);
              })
              .catch(() => {
                setChatMessages((prev) => [
                  ...prev.slice(0, -1),
                  { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
                ]);
              });
          }}
        />
      )}

      {/* Delete confirm */}
      <Modal
        open={deleteConfirmId != null}
        onClose={() => setDeleteConfirmId(null)}
        className="max-w-sm"
      >
        <div className="p-6">
          <div className="flex gap-3.5 items-start mb-5">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-[rgba(196,95,95,0.12)] flex items-center justify-center flex-shrink-0">
              <Trash2 size={16} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-ink dark:text-white tracking-tight">Delete this log?</h3>
              <p className="text-[13.5px] text-ink-2 mt-1.5 leading-relaxed">
                This cannot be undone. The log and its tags will be removed permanently.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDeleteLog(deleteConfirmId)}
            >
              Delete log
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Recall Calendar ───────────────────────────────────────────────────────

function RecallCalendar({
  year,
  month,
  logs,
  selectedDay,
  onSelect,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  logs: LogEntry[];
  selectedDay: Date | null;
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const today = startOfDay(new Date());
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  // Days that have logs
  const daysWithLogs = new Set<number>();
  logs.forEach((log) => {
    const start = fromISODate(log.date_start);
    const end = fromISODate(log.date_end);
    if (start.getFullYear() === year && start.getMonth() === month) {
      daysWithLogs.add(start.getDate());
    }
    // For multi-day logs, mark all days in range within this month
    const s = new Date(Math.max(+new Date(year, month, 1), +start));
    const e = new Date(Math.min(+new Date(year, month + 1, 0), +end));
    let cur = new Date(s);
    while (cur <= e) {
      if (cur.getFullYear() === year && cur.getMonth() === month) {
        daysWithLogs.add(cur.getDate());
      }
      cur.setDate(cur.getDate() + 1);
    }
  });

  return (
    <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-xl p-5 shadow-card-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-[16px] font-bold text-ink dark:text-white" style={{ letterSpacing: '-0.012em' }}>
            {MONTH_NAMES[month]} {year}
          </div>
          <div className="text-[12.5px] text-ink-3 mt-0.5">
            {logs.length} log{logs.length !== 1 ? 's' : ''} this month
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={onPrev}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] text-ink-2 hover:text-ink transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={onNext}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] text-ink-2 hover:text-ink transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Weekday row */}
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-center text-[11px] font-semibold text-ink-3 uppercase tracking-[0.04em] py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const date = new Date(year, month, d);
          const has = daysWithLogs.has(d);
          const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === d;
          const isSelected =
            selectedDay != null &&
            selectedDay.getFullYear() === year &&
            selectedDay.getMonth() === month &&
            selectedDay.getDate() === d;

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(date)}
              className={cn(
                'relative h-11 flex items-center justify-center text-[13px] font-medium rounded-[10px]',
                'transition-all duration-100 cursor-pointer focus:outline-none',
                isSelected
                  ? 'ring-[2px] ring-inset ring-accent-active bg-accent-tint text-accent-active font-bold'
                  : has
                  ? 'bg-accent-tint text-ink dark:text-white hover:bg-[rgba(126,176,247,0.25)]'
                  : 'text-ink dark:text-white hover:bg-gray-100 dark:hover:bg-surface-3',
                isToday && !isSelected && 'ring-[1.5px] ring-inset ring-accent-light',
              )}
            >
              {d}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-active" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3.5 mt-4 text-[11.5px] text-ink-2 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-accent-tint border border-accent/30 inline-block" />
          Has logs
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded ring-[2px] ring-accent-active inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-active inline-block" />
          Today
        </span>
      </div>
    </div>
  );
}

// ── Log Card ──────────────────────────────────────────────────────────────

function LogCard({
  log,
  highlighted,
  onOpen,
}: {
  log: LogEntry;
  highlighted: boolean;
  onOpen: () => void;
}) {
  const dateLabel =
    log.date_start === log.date_end
      ? formatDate(fromISODate(log.date_start), 'medium')
      : formatDateRange(fromISODate(log.date_start), fromISODate(log.date_end));

  const truncated =
    log.content.length > 220 ? log.content.slice(0, 220) + '…' : log.content;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'group w-full text-left rounded-card-lg border flex flex-col gap-2.5 p-4.5 p-[18px]',
        'bg-white dark:bg-surface-2 shadow-card',
        'hover:shadow-card-lg hover:-translate-y-px',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        highlighted
          ? 'border-accent/30 dark:border-accent/20'
          : 'border-gray-100 dark:border-[#2A2A2A]',
      )}
    >
      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
        <span className="font-semibold text-accent-active">{dateLabel}</span>
        <span className="text-ink-3">·</span>
        <span className="text-ink-3 flex items-center gap-1">
          <User size={11} />
          <span>Self</span>
        </span>
        {log.date_type !== 'daily' && (
          <span className="text-[11px] text-ink-3 uppercase tracking-[0.06em]">
            {log.date_type}
          </span>
        )}
      </div>

      {/* Content */}
      <p className="text-[14px] text-ink dark:text-white leading-[1.55] text-pretty">
        {truncated}
        {log.content.length > 220 && (
          <span className="text-accent-active font-medium ml-1">Read more</span>
        )}
      </p>

      {/* Tags */}
      {log.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {log.tags.map((t) => (
            <TagChip key={t.id} label={t.name} />
          ))}
        </div>
      )}
    </button>
  );
}

// ── Expanded Log ──────────────────────────────────────────────────────────

function ExpandedLogView({
  log,
  onBack,
  onDelete,
}: {
  log: LogEntry;
  onBack: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(log.content);
  const { toast } = useToast();

  const dateLabel =
    log.date_start === log.date_end
      ? formatDate(fromISODate(log.date_start), 'medium')
      : formatDateRange(fromISODate(log.date_start), fromISODate(log.date_end));

  async function saveEdit() {
    try {
      await logsApi.update(log.id, { content: editText });
      toast('Log updated.', 'success');
      setIsEditing(false);
    } catch {
      toast('Failed to update log.', 'error');
    }
  }

  return (
    <div className="flex flex-col gap-3.5">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink transition-colors py-1.5"
        >
          <ArrowLeft size={14} />
          Back to logs
        </button>
        <div className="flex gap-1.5">
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={saveEdit}>
                Save
              </Button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-8 px-3 inline-flex items-center gap-1.5 bg-white dark:bg-surface-2 border border-gray-200 dark:border-[#2A2A2A] rounded-[10px] text-[12.5px] font-medium text-ink dark:text-white hover:bg-gray-50 dark:hover:bg-surface-3 transition-colors"
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="h-8 px-3 inline-flex items-center gap-1.5 bg-white dark:bg-surface-2 border border-gray-200 dark:border-[#2A2A2A] rounded-[10px] text-[12.5px] font-medium text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Log card */}
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-xl p-7 shadow-card-lg">
        <div className="flex flex-wrap items-center gap-2 text-[12.5px] mb-4">
          <span className="font-semibold text-accent-active">{dateLabel}</span>
          <span className="text-ink-3">·</span>
          <span className="text-ink-3 flex items-center gap-1">
            <User size={11} /> Self
          </span>
          {log.date_type !== 'daily' && (
            <span className="text-[11px] text-ink-3 uppercase tracking-[0.06em]">
              {log.date_type}
            </span>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={6}
            className="w-full border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-3.5 text-[15px] text-ink dark:text-white bg-white dark:bg-surface-3 leading-[1.55] resize-vertical outline-none focus:ring-2 focus:ring-accent/25"
          />
        ) : (
          <p className="text-[15px] text-ink dark:text-white leading-[1.6] whitespace-pre-wrap text-pretty">
            {editText}
          </p>
        )}

        {log.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {log.tags.map((t) => (
              <TagChip key={t.id} label={t.name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Bar ────────────────────────────────────────────────────────────────

function AIBar({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="fixed left-0 right-0 bottom-4 px-4 sm:px-8 z-30 pointer-events-none">
      <div className="max-w-[1100px] mx-auto pointer-events-auto">
        <div className="bg-white/95 dark:bg-surface-2/95 backdrop-blur-sm border border-gray-100 dark:border-[#2A2A2A] rounded-full px-2 py-2 flex items-center gap-2 shadow-float">
          <div className="w-8 h-8 rounded-full bg-accent-tint flex items-center justify-center flex-shrink-0">
            <Sparkles size={15} className="text-accent-active" />
          </div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) onSend();
            }}
            placeholder="Ask about your work…"
            className="flex-1 min-w-0 bg-transparent text-[14px] text-ink dark:text-white placeholder:text-ink-3 outline-none px-2"
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!value.trim()}
            onClick={onSend}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
              value.trim()
                ? 'bg-accent text-white shadow-button-primary hover:bg-accent-hover cursor-pointer'
                : 'bg-gray-200 dark:bg-surface-3 text-gray-400 cursor-not-allowed',
            )}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chat Overlay ──────────────────────────────────────────────────────────

function ChatOverlay({
  messages,
  bodyRef,
  context,
  onClose,
  onSend,
}: {
  messages: ChatMsg[];
  bodyRef: React.RefObject<HTMLDivElement>;
  context: string;
  onClose: () => void;
  onSend: (q: string) => void;
}) {
  const [draft, setDraft] = useState('');

  return (
    <div className="fixed inset-3 sm:inset-4 z-40 flex flex-col bg-white/96 dark:bg-surface-2/96 backdrop-blur border border-gray-100 dark:border-[#2A2A2A] rounded-card-2xl shadow-float overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-[#2A2A2A] flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-accent-tint flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-accent-active" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-ink dark:text-white">Ask MyLogMate</div>
          <div className="text-[12px] text-ink-3">Asking across {context}</div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-3 flex items-center justify-center text-ink-2 hover:text-ink transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center text-[13.5px] text-ink-3 py-10">
            Ask anything about your logs this period…
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} />
        ))}
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
        <div className="flex items-center gap-2 bg-white dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] rounded-full px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) {
                onSend(draft.trim());
                setDraft('');
              }
            }}
            placeholder="Ask a follow-up…"
            autoFocus
            className="flex-1 min-w-0 bg-transparent text-[14px] text-ink dark:text-white placeholder:text-ink-3 outline-none px-1"
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!draft.trim()}
            onClick={() => {
              if (draft.trim()) {
                onSend(draft.trim());
                setDraft('');
              }
            }}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
              draft.trim()
                ? 'bg-accent text-white cursor-pointer hover:bg-accent-hover'
                : 'bg-gray-200 dark:bg-surface-3 text-gray-400 cursor-not-allowed',
            )}
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chat Message ──────────────────────────────────────────────────────────

function ChatMessage({ message }: { message: ChatMsg }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-[#1A1A1A] dark:bg-[#2A2A2A] text-white rounded-[18px_18px_4px_18px] px-4 py-3 text-[14px] leading-[1.5]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-full bg-accent-tint flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles size={13} className="text-accent-active" />
      </div>
      <div className="max-w-[75%]">
        {message.thinking ? (
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-surface-3 rounded-[18px] px-4 py-3 text-[13px] text-ink-2">
            <ThinkingDots />
            <span>Reading your logs…</span>
          </div>
        ) : (
          <>
            <div className="bg-gray-100 dark:bg-surface-3 rounded-[18px_18px_18px_4px] px-4 py-3.5 text-[14px] leading-[1.55] text-ink dark:text-white whitespace-pre-wrap text-pretty">
              {message.text}
            </div>
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {message.sources.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent-active bg-accent-tint border border-accent/20 rounded-full px-2.5 py-1"
                  >
                    <ExternalLink size={10} />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Thinking Dots ─────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-accent-active"
          style={{ animation: `thinking-dot 1.1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </span>
  );
}
