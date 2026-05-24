import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Users, Folder, ChevronDown, Check } from 'lucide-react';
import { contextsApi } from '@/api/contexts';
import { logsApi } from '@/api/logs';
import type { Context, ContextType } from '@/types/context';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';
import { MONTH_NAMES, fromISODate } from '@/utils/date';

// ── Types ─────────────────────────────────────────────────────────────────

interface YearData {
  year: number;
  count: number;
  months: number[]; // 12 entries, Jan=0
}

// ── Recall Year Page ──────────────────────────────────────────────────────

export default function RecallYear() {
  const navigate = useNavigate();
  const [contextTab, setContextTab] = useState<ContextType>('self');
  const [entities, setEntities] = useState<Context[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [yearData, setYearData] = useState<YearData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load entities when switching to team/project
  useEffect(() => {
    if (contextTab === 'self') {
      setEntities([]);
      setSelectedEntityId(null);
      return;
    }
    contextsApi
      .list()
      .then((all) => {
        const filtered = all.filter((c) => c.type === contextTab);
        setEntities(filtered);
        setSelectedEntityId(filtered[0]?.id ?? null);
      })
      .catch(() => {
        setEntities([]);
        setSelectedEntityId(null);
      });
  }, [contextTab]);

  // Load logs grouped by year when context/entity changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setYearData([]);

    const contextId = contextTab === 'self' ? 'self' : selectedEntityId;
    if (contextTab !== 'self' && !contextId) {
      setIsLoading(false);
      return;
    }

    logsApi
      .list({ context_id: contextId ?? undefined })
      .then(({ data }) => {
        // Group by year and month
        const map = new Map<number, number[]>();
        data.forEach((log) => {
          const d = fromISODate(log.date_start);
          const yr = d.getFullYear();
          const mo = d.getMonth();
          if (!map.has(yr)) map.set(yr, new Array(12).fill(0));
          map.get(yr)![mo] += 1;
        });

        const years: YearData[] = Array.from(map.entries())
          .map(([year, months]) => ({
            year,
            count: months.reduce((s, n) => s + n, 0),
            months,
          }))
          .sort((a, b) => b.year - a.year);

        setYearData(years);
      })
      .catch(() => setError('Failed to load recall data. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [contextTab, selectedEntityId]);

  const currentEntity = entities.find((e) => e.id === selectedEntityId);
  const totalLogs = yearData.reduce((s, y) => s + y.count, 0);

  function goToYear(year: number) {
    navigate(`/recall/${year}`, {
      state: { contextTab, entityId: selectedEntityId },
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow="Recall"
        title="Recall your work"
        subtitle="Pick a year to dive into. Use the tabs to switch between yourself, teammates, and projects."
      />

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap mb-8">
        <ContextTabs value={contextTab} onChange={(v) => { setContextTab(v); setDropdownOpen(false); }} />

        {contextTab !== 'self' && entities.length > 0 && (
          <EntityDropdown
            options={entities}
            selected={currentEntity ?? null}
            kind={contextTab}
            open={dropdownOpen}
            onToggle={() => setDropdownOpen((o) => !o)}
            onClose={() => setDropdownOpen(false)}
            onSelect={(id) => { setSelectedEntityId(id); setDropdownOpen(false); }}
          />
        )}

        <div className="flex-1" />

        {!isLoading && yearData.length > 0 && (
          <span className="text-[13px] text-ink-3">
            {totalLogs} logs · {yearData.length} {yearData.length === 1 ? 'year' : 'years'}
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2].map((i) => (
            <CardSkeleton key={i} className="h-56 rounded-card-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-8 text-center">
          <p className="text-[14px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && yearData.length === 0 && (
        <EmptyState
          icon={Search}
          title="Nothing logged yet"
          description="Once you start logging, your years will appear here."
          action={{ label: 'Start a log', onClick: () => navigate('/log') }}
        />
      )}

      {/* Year cards */}
      {!isLoading && !error && yearData.length > 0 && (
        <div
          className={cn(
            'grid gap-4',
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
    <div className="inline-flex bg-gray-100 dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-1 gap-0.5">
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
                ? 'bg-white dark:bg-surface-2 text-ink dark:text-white font-semibold shadow-card'
                : 'text-ink-2 hover:text-ink dark:hover:text-white',
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
  selected,
  kind,
  open,
  onToggle,
  onClose,
  onSelect,
}: {
  options: Context[];
  selected: Context | null;
  kind: ContextType;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const label = selected?.name ?? 'Select…';

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="h-10 px-3.5 flex items-center gap-2.5 bg-white dark:bg-surface-2 border border-gray-200 dark:border-[#2A2A2A] rounded-xl text-[13.5px] min-w-[200px] text-ink dark:text-white"
      >
        {kind === 'team' ? (
          <Avatar username={label} size={22} />
        ) : (
          <span className="w-5 h-5 rounded-md bg-cream-tint flex items-center justify-center flex-shrink-0">
            <Folder size={11} className="text-cream-text" />
          </span>
        )}
        <span className="flex-1 text-left font-medium truncate">{label}</span>
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
          <div className="absolute top-[calc(100%+6px)] left-0 min-w-[200px] w-full bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-xl shadow-float z-20 p-1.5">
            {options.map((o) => {
              const isSelected = o.id === selected?.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onSelect(o.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] text-[13.5px] text-left transition-colors',
                    isSelected
                      ? 'bg-accent-tint text-accent-active'
                      : 'text-ink dark:text-white hover:bg-gray-50 dark:hover:bg-surface-3',
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
        'group text-left w-full rounded-card-xl border border-black/5 dark:border-white/5 p-7',
        'flex flex-col gap-5 min-h-[220px]',
        'shadow-card hover:shadow-card-lg hover:-translate-y-0.5',
        'transition-all duration-200 cursor-pointer',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        t.bg,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[36px] font-bold text-ink dark:text-white tabular-nums leading-none" style={{ letterSpacing: '-0.025em' }}>
            {year}
          </div>
          <div className="text-[13px] text-ink-2 mt-1.5">
            {count} logs · {activeMonths} active month{activeMonths !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/10 border border-black/5 flex items-center justify-center">
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

      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-2 group-hover:text-ink dark:group-hover:text-white transition-colors">
        <span>Open year</span>
        <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
      </div>
    </button>
  );
}
