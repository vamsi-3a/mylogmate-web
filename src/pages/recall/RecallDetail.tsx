import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowUp,
  Pencil,
  Trash2,
  ArrowLeft,
  X,
  User,
} from 'lucide-react';
import { logsApi } from '@/api/logs';
import type { LogEntry } from '@/types/log';
import type { ContextType } from '@/types/context';
import { TagChip } from '@/components/ui/TagChip';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { RecallChat } from '@/components/RecallChat';
import { cn } from '@/utils/cn';
import {
  MONTH_NAMES,
  startOfDay,
  sameDay,
  fromISODate,
  formatDate,
  formatDateRange,
} from '@/utils/date';

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

  // AI chat — handled by the shared <RecallChat> component
  const [chatOpen, setChatOpen] = useState(false);
  const [aiBarValue, setAiBarValue] = useState('');
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>();

  const contextLabel =
    contextTab === 'self' ? 'Self' : contextTab === 'team' ? 'Teammate' : 'Project';
  const monthLabel = `${MONTH_NAMES[month]} ${year}`;

  // Load logs for this month
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const pad = (n: number) => String(n).padStart(2, '0');
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const params: Parameters<typeof logsApi.list>[0] = {
      date_start: `${year}-${pad(month + 1)}-01`,
      date_end: `${year}-${pad(month + 1)}-${pad(daysInMonth)}`,
    };
    if (contextTab === 'self') {
      params.context_id = 'self';
    } else if (entityId) {
      params.context_id = entityId;
    } else {
      // "All teammates" or "All projects" view from /recall
      params.context_type = contextTab;
    }

    logsApi
      .list(params)
      .then(({ data }) => setLogs(data))
      .catch(() => setError('Failed to load logs.'))
      .finally(() => setIsLoading(false));
  }, [year, month, contextTab, entityId]);

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

  // Open the chat overlay seeded with whatever's in the persistent AIBar
  function submitAsk() {
    const q = aiBarValue.trim();
    if (!q) return;
    setChatInitialQuery(q);
    setAiBarValue('');
    setChatOpen(true);
  }

  const askContextId = contextTab === 'self' ? 'self' : entityId;
  const askContextLabel =
    contextTab === 'self'
      ? 'Self'
      : entityId
      ? `${contextLabel} · ${monthLabel}`
      : `All ${contextTab === 'team' ? 'teammates' : 'projects'} · ${monthLabel}`;

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
          onSend={submitAsk}
        />
      )}

      {/* Chat overlay — shared component, owns chat_session_id continuity */}
      <RecallChat
        open={chatOpen}
        onClose={() => {
          setChatOpen(false);
          setChatInitialQuery(undefined);
        }}
        contextId={askContextId}
        contextLabel={askContextLabel}
        logs={logs}
        initialQuery={chatInitialQuery}
      />

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
