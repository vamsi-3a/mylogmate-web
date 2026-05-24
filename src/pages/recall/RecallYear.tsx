import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Users, Folder, ChevronDown, Check, Sparkles, ArrowUp } from 'lucide-react';
import { contextsApi } from '@/api/contexts';
import { logsApi } from '@/api/logs';
import type { Context, ContextType } from '@/types/context';
import type { LogEntry } from '@/types/log';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { RecallChat } from '@/components/RecallChat';
import { cn } from '@/utils/cn';
import { MONTH_NAMES, fromISODate } from '@/utils/date';

// ── Types ─────────────────────────────────────────────────────────────────

interface YearData {
  year: number;
  count: number;
  months: number[]; // 12 entries, Jan=0
}

// Magic value for the entity dropdown that means "all teammates/projects".
const ALL_ENTITIES = '__all__';

// ── Recall Home (also year overview) ─────────────────────────────────────

export default function RecallYear() {
  const navigate = useNavigate();
  const [contextTab, setContextTab] = useState<ContextType>('self');
  const [entities, setEntities] = useState<Context[]>([]);
  // ALL_ENTITIES means "every team/project context aggregated" — the default
  // so a user with logs under one specific teammate isn't shown an empty page
  // because the dropdown defaulted to the *first* teammate (who may have none).
  const [selectedEntityId, setSelectedEntityId] = useState<string>(ALL_ENTITIES);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI ask bar state
  const [askDraft, setAskDraft] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInitialQuery, setChatInitialQuery] = useState<string | undefined>();

  // Load entities when switching to team/project
  useEffect(() => {
    if (contextTab === 'self') {
      setEntities([]);
      setSelectedEntityId(ALL_ENTITIES);
      return;
    }
    contextsApi
      .list()
      .then((all) => {
        setEntities(all.filter((c) => c.type === contextTab));
        setSelectedEntityId(ALL_ENTITIES);
      })
      .catch(() => {
        setEntities([]);
        setSelectedEntityId(ALL_ENTITIES);
      });
  }, [contextTab]);

  // Load logs when context/entity changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setLogs([]);

    const params: Parameters<typeof logsApi.list>[0] = {};
    if (contextTab === 'self') {
      params.context_id = 'self';
    } else if (selectedEntityId === ALL_ENTITIES) {
      params.context_type = contextTab;
    } else {
      params.context_id = selectedEntityId;
    }

    logsApi
      .list(params)
      .then(({ data }) => setLogs(data))
      .catch(() => setError('Failed to load recall data. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [contextTab, selectedEntityId]);

  // Aggregate logs into year buckets
  const yearData: YearData[] = useMemo(() => {
    const map = new Map<number, number[]>();
    logs.forEach((log) => {
      const d = fromISODate(log.date_start);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      if (!map.has(yr)) map.set(yr, new Array(12).fill(0));
      map.get(yr)![mo] += 1;
    });
    return Array.from(map.entries())
      .map(([year, months]) => ({
        year,
        count: months.reduce((s, n) => s + n, 0),
        months,
      }))
      .sort((a, b) => b.year - a.year);
  }, [logs]);

  const currentEntity = entities.find((e) => e.id === selectedEntityId);
  const totalLogs = yearData.reduce((s, y) => s + y.count, 0);

  function goToYear(year: number) {
    navigate(`/recall/${year}`, {
      state: {
        contextTab,
        entityId: selectedEntityId === ALL_ENTITIES ? null : selectedEntityId,
      },
    });
  }

  // ── AI ask wiring ───────────────────────────────────────────────────────
  // The chat needs a specific context to scope retrieval. For "All" view we
  // fall back to Self so the bar is never dead — but we also surface a hint.
  const askContextId =
    contextTab === 'self'
      ? 'self'
      : selectedEntityId !== ALL_ENTITIES
      ? selectedEntityId
      : null;
  const askContextLabel =
    contextTab === 'self'
      ? 'Self'
      : selectedEntityId !== ALL_ENTITIES
      ? currentEntity?.name ?? '—'
      : `All ${contextTab === 'team' ? 'teammates' : 'projects'}`;

  function submitAsk() {
    const q = askDraft.trim();
    if (!q || !askContextId) return;
    setChatInitialQuery(q);
    setAskDraft('');
    setChatOpen(true);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow="Recall"
        title="Recall your work"
        subtitle="Ask anything about your logs, or pick a year to browse."
      />

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <ContextTabs
          value={contextTab}
          onChange={(v) => {
            setContextTab(v);
            setDropdownOpen(false);
          }}
        />

        {contextTab !== 'self' && (
          <EntityDropdown
            options={entities}
            selectedId={selectedEntityId}
            kind={contextTab}
            open={dropdownOpen}
            onToggle={() => setDropdownOpen((o) => !o)}
            onClose={() => setDropdownOpen(false)}
            onSelect={(id) => {
              setSelectedEntityId(id);
              setDropdownOpen(false);
            }}
          />
        )}

        <div className="flex-1" />

        {!isLoading && yearData.length > 0 && (
          <span className="text-[13px] text-ink-3">
            {totalLogs} logs · {yearData.length} {yearData.length === 1 ? 'year' : 'years'}
          </span>
        )}
      </div>

      {/* AI ask bar */}
      <AskBar
        value={askDraft}
        onChange={setAskDraft}
        onSubmit={submitAsk}
        contextLabel={askContextLabel}
        disabled={!askContextId}
        hint={
          askContextId
            ? undefined
            : `Pick a specific ${contextTab === 'team' ? 'teammate' : 'project'} above to ask AI`
        }
      />

      {/* Loading */}
      {isLoading && (
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} className="h-56 rounded-card-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-card-lg bg-red-50 border border-red-100 p-8 text-center mt-6">
          <p className="text-[14px] text-red-600">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && yearData.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={Search}
            title="Nothing logged yet"
            description={
              contextTab === 'self'
                ? 'Once you start logging, your years will appear here.'
                : entities.length === 0
                ? `Add a ${contextTab === 'team' ? 'teammate' : 'project'} first, then log about them.`
                : 'No logs in this context yet — log something to see it here.'
            }
            action={{ label: 'Start a log', onClick: () => navigate('/log') }}
          />
        </div>
      )}

      {/* Year cards */}
      {!isLoading && !error && yearData.length > 0 && (
        <div
          className={cn(
            'grid gap-4 mt-2',
            yearData.length === 1
              ? 'sm:grid-cols-1 max-w-sm'
              : yearData.length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-3',
          )}
        >
          {yearData.map((y, i) => (
            <YearCard
              key={y.year}
              year={y.year}
              count={y.count}
              months={y.months}
              tint={(['blue', 'cream', 'sage'] as const)[i % 3]}
              onClick={() => goToYear(y.year)}
            />
          ))}
        </div>
      )}

      {/* AI chat overlay */}
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
    </div>
  );
}

// ── Ask Bar ────────────────────────────────────────────────────────────────

function AskBar({
  value,
  onChange,
  onSubmit,
  contextLabel,
  disabled,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  contextLabel: string;
  disabled: boolean;
  hint?: string;
}) {
  return (
    <div className="mb-6">
      <div
        className={cn(
          'flex items-center gap-2.5 bg-white border rounded-2xl px-3.5 py-2.5',
          'shadow-card transition-all',
          disabled ? 'border-gray-200 opacity-60' : 'border-gray-200 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(126,176,247,0.18)]',
        )}
      >
        <div className="w-7 h-7 rounded-full bg-accent-tint flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-accent-active" />
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && value.trim() && !disabled) onSubmit();
          }}
          placeholder={
            disabled
              ? 'Ask AI about your logs…'
              : `Ask AI about ${contextLabel}…`
          }
          disabled={disabled}
          className="flex-1 min-w-0 bg-transparent text-[14.5px] text-ink placeholder:text-ink-3 outline-none px-1 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          aria-label="Ask"
          onClick={onSubmit}
          disabled={!value.trim() || disabled}
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
            value.trim() && !disabled
              ? 'bg-accent text-white hover:bg-accent-hover cursor-pointer'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          )}
        >
          <ArrowUp size={16} />
        </button>
      </div>
      {hint && (
        <p className="text-[12px] text-ink-3 mt-2 px-1">{hint}</p>
      )}
    </div>
  );
}

// ── Context Tabs ──────────────────────────────────────────────────────────

const CONTEXT_TABS: { id: ContextType; label: string; icon: typeof User }[] = [
  { id: 'self', label: 'Self', icon: User },
  { id: 'team', label: 'Teammates', icon: Users },
  { id: 'project', label: 'Projects', icon: Folder },
];

function ContextTabs({
  value,
  onChange,
}: {
  value: ContextType;
  onChange: (v: ContextType) => void;
}) {
  return (
    <div className="inline-flex bg-gray-100 border border-gray-200 rounded-xl p-1 gap-0.5">
      {CONTEXT_TABS.map((tab) => {
        const active = value === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3 py-2 rounded-[10px] flex items-center gap-2 text-[13.5px] font-medium transition-all duration-150',
              active
                ? 'bg-white text-ink font-semibold shadow-card'
                : 'text-ink-2 hover:text-ink',
            )}
          >
            <Icon size={14} className={active ? 'text-accent-active' : 'text-ink-3'} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Entity Dropdown ───────────────────────────────────────────────────────

function EntityDropdown({
  options,
  selectedId,
  kind,
  open,
  onToggle,
  onClose,
  onSelect,
}: {
  options: Context[];
  selectedId: string;
  kind: ContextType;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const allLabel = kind === 'team' ? 'All teammates' : 'All projects';
  const selectedLabel =
    selectedId === ALL_ENTITIES
      ? allLabel
      : options.find((o) => o.id === selectedId)?.name ?? 'Select…';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="h-10 px-3.5 flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl text-[13.5px] min-w-[200px] text-ink"
      >
        {selectedId === ALL_ENTITIES ? (
          <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
            {kind === 'team' ? (
              <Users size={11} className="text-ink-2" />
            ) : (
              <Folder size={11} className="text-ink-2" />
            )}
          </span>
        ) : kind === 'team' ? (
          <Avatar username={selectedLabel} size={22} />
        ) : (
          <span className="w-5 h-5 rounded-md bg-cream-tint flex items-center justify-center flex-shrink-0">
            <Folder size={11} className="text-cream-text" />
          </span>
        )}
        <span className="flex-1 text-left font-medium truncate">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={cn(
            'text-ink-3 transition-transform flex-shrink-0',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onClose} />
          <div className="absolute top-[calc(100%+6px)] left-0 min-w-[200px] w-full bg-white border border-gray-100 rounded-xl shadow-float z-20 p-1.5">
            {/* "All" option always first */}
            <button
              type="button"
              onClick={() => onSelect(ALL_ENTITIES)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] text-[13.5px] text-left transition-colors',
                selectedId === ALL_ENTITIES
                  ? 'bg-accent-tint text-accent-active'
                  : 'text-ink hover:bg-gray-50',
              )}
            >
              <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                {kind === 'team' ? (
                  <Users size={11} className="text-ink-2" />
                ) : (
                  <Folder size={11} className="text-ink-2" />
                )}
              </span>
              <span className="flex-1 truncate">{allLabel}</span>
              {selectedId === ALL_ENTITIES && (
                <Check size={13} className="text-accent-active flex-shrink-0" />
              )}
            </button>

            {options.length > 0 && (
              <div className="h-px bg-gray-100 my-1 mx-1" />
            )}

            {options.map((o) => {
              const isSelected = o.id === selectedId;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onSelect(o.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] text-[13.5px] text-left transition-colors',
                    isSelected
                      ? 'bg-accent-tint text-accent-active'
                      : 'text-ink hover:bg-gray-50',
                  )}
                >
                  {kind === 'team' ? (
                    <Avatar username={o.name} size={22} />
                  ) : (
                    <span className="w-5 h-5 rounded-md bg-cream-tint flex items-center justify-center flex-shrink-0">
                      <Folder size={11} className="text-cream-text" />
                    </span>
                  )}
                  <span className="flex-1 truncate">{o.name}</span>
                  {isSelected && <Check size={13} className="text-accent-active flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ── Year Card ─────────────────────────────────────────────────────────────

type Tint = 'blue' | 'cream' | 'sage';

const TINT_STYLES: Record<Tint, { bg: string; bar: string }> = {
  blue: { bg: 'bg-accent-tint', bar: '#7EB0F7' },
  cream: { bg: 'bg-cream-tint', bar: '#C9A35A' },
  sage: { bg: 'bg-sage-tint', bar: '#6BBF8A' },
};

function YearCard({
  year,
  count,
  months,
  tint,
  onClick,
}: {
  year: number;
  count: number;
  months: number[];
  tint: Tint;
  onClick: () => void;
}) {
  const t = TINT_STYLES[tint];
  const max = Math.max(1, ...months);
  const activeMonths = months.filter((m) => m > 0).length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group text-left w-full rounded-card-xl border border-black/5 p-7',
        'flex flex-col gap-5 min-h-[220px]',
        'shadow-card hover:shadow-card-lg hover:-translate-y-0.5',
        'transition-all duration-200 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        t.bg,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[36px] font-bold text-ink tabular-nums leading-none" style={{ letterSpacing: '-0.025em' }}>
            {year}
          </div>
          <div className="text-[13px] text-ink-2 mt-1.5">
            {count} logs · {activeMonths} active month{activeMonths !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/80 border border-black/5 flex items-center justify-center">
          <Search size={16} className="text-ink-2" strokeWidth={1.75} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex items-end gap-1 h-9 mt-auto">
        {months.map((v, i) => {
          const h = v === 0 ? 3 : Math.max(6, Math.round((v / max) * 32));
          return (
            <span
              key={i}
              title={`${MONTH_NAMES[i]}: ${v} log${v !== 1 ? 's' : ''}`}
              className="flex-1 rounded-[3px] transition-colors"
              style={{
                height: h,
                background: v === 0 ? 'rgba(0,0,0,0.08)' : t.bar,
                opacity: v === 0 ? 1 : 0.85,
              }}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-2 group-hover:text-ink transition-colors">
        <span>Open year</span>
        <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
      </div>
    </button>
  );
}
