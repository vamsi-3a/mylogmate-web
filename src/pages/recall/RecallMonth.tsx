import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import type { ContextType } from '@/types/context';
import { logsApi } from '@/api/logs';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';
import { MONTH_NAMES, fromISODate } from '@/utils/date';

// ── Recall Month Page ─────────────────────────────────────────────────────

export default function RecallMonth() {
  const navigate = useNavigate();
  const { year: yearParam } = useParams<{ year: string }>();
  const location = useLocation();
  const state = location.state as { contextTab?: ContextType; entityId?: string } | null;

  const year = Number(yearParam ?? new Date().getFullYear());
  const contextTab = state?.contextTab ?? 'self';
  const entityId = state?.entityId ?? null;

  const [monthlyCounts, setMonthlyCounts] = useState<number[]>(new Array(12).fill(0));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const contextId = contextTab === 'self' ? 'self' : entityId;

    logsApi
      .list({
        context_id: contextId ?? undefined,
        date_start: `${year}-01-01`,
        date_end: `${year}-12-31`,
      })
      .then(({ data }) => {
        const counts = new Array(12).fill(0);
        data.forEach((log) => {
          const mo = fromISODate(log.date_start).getMonth();
          counts[mo] += 1;
        });
        setMonthlyCounts(counts);
      })
      .catch(() => setError('Failed to load data. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [year, contextTab, entityId]);

  const contextLabel =
    contextTab === 'self' ? 'Self' : contextTab === 'team' ? 'Teammate' : 'Project';
  const total = monthlyCounts.reduce((s, n) => s + n, 0);

  function goToMonth(monthIndex: number) {
    // month in URL is 1-based
    navigate(`/recall/${year}/${monthIndex + 1}`, {
      state: { contextTab, entityId },
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12.5px] text-ink-3 mb-4">
        <button type="button" onClick={() => navigate('/recall')} className="hover:text-ink transition-colors">
          Recall
        </button>
        <span>/</span>
        <span className="text-ink dark:text-white font-semibold">{year}</span>
      </nav>

      <PageHeader
        eyebrow={`Recall · ${contextLabel}`}
        title={String(year)}
        subtitle={
          total > 0
            ? `${total} logs across ${monthlyCounts.filter((c) => c > 0).length} months. Tap a month to view them.`
            : `No logs in ${year}.`
        }
      />

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {new Array(12).fill(0).map((_, i) => (
            <CardSkeleton key={i} className="h-28 rounded-card-lg" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-8 text-center">
          <p className="text-[14px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty year */}
      {!isLoading && !error && total === 0 && (
        <EmptyState
          icon={Search}
          title={`No logs in ${year}`}
          description="Start logging to build a history you can recall anytime."
          action={{ label: 'Start a log', onClick: () => navigate('/log') }}
        />
      )}

      {/* Month grid */}
      {!isLoading && !error && total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MONTH_NAMES.map((name, i) => (
            <MonthCard
              key={name}
              name={name}
              count={monthlyCounts[i]}
              onClick={monthlyCounts[i] > 0 ? () => goToMonth(i) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Month Card ────────────────────────────────────────────────────────────

function MonthCard({
  name,
  count,
  onClick,
}: {
  name: string;
  count: number;
  onClick?: () => void;
}) {
  const has = count > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!has}
      className={cn(
        'text-left rounded-card-lg border flex flex-col gap-2.5 min-h-[110px] p-4.5 p-[18px]',
        'transition-all duration-150',
        has
          ? [
              'bg-[#F8FAFE] dark:bg-[rgba(107,159,255,0.06)] border-accent/15 dark:border-accent/10',
              'hover:bg-accent-tint hover:border-accent/30',
              'hover:-translate-y-px hover:shadow-card',
              'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
            ].join(' ')
          : 'bg-gray-50 dark:bg-surface-3 border-gray-100 dark:border-[#2A2A2A] opacity-55 cursor-not-allowed',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-semibold text-ink dark:text-white" style={{ letterSpacing: '-0.012em' }}>
          {name}
        </span>
        {has && <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
      </div>

      <div className="text-[13px] text-ink-2">
        {has ? `${count} ${count === 1 ? 'log' : 'logs'}` : 'No logs'}
      </div>

      <div className="flex-1" />

      <div
        className={cn(
          'text-[12.5px] font-semibold flex items-center gap-1 transition-colors',
          has ? 'text-ink-2 group-hover:text-ink' : 'text-transparent',
        )}
      >
        Open
        <span className="inline-block">→</span>
      </div>
    </button>
  );
}
