import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, Folder, ArrowRight, Plus } from 'lucide-react';
import { contextsApi } from '@/api/contexts';
import type { Context, ContextType } from '@/types/context';
import { useLogFlowStore } from '@/store/logFlowStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { PickerCard } from '@/components/ui/PickerCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

type Step = 'pick-type' | 'pick-entity';

// ── Log Context Page ───────────────────────────────────────────────────────

export default function LogContext() {
  const navigate = useNavigate();
  const { setContext, reset } = useLogFlowStore();
  const [step, setStep] = useState<Step>('pick-type');
  const [entityKind, setEntityKind] = useState<'team' | 'project' | null>(null);

  // Reset flow state when entering
  useEffect(() => {
    reset();
  }, [reset]);

  function handlePickType(type: ContextType) {
    if (type === 'self') {
      // Self context: no entity to pick — go straight to date
      setContext('self', 'self', 'Self');
      navigate('/log/date');
    } else if (type === 'team') {
      setEntityKind('team');
      setStep('pick-entity');
    } else {
      setEntityKind('project');
      setStep('pick-entity');
    }
  }

  if (step === 'pick-entity' && entityKind) {
    return (
      <EntityList
        kind={entityKind}
        onBack={() => setStep('pick-type')}
        onSelect={(ctx) => {
          setContext(ctx.type, ctx.id, ctx.name);
          navigate('/log/date');
        }}
        onAddNew={() => navigate(entityKind === 'team' ? '/teammates' : '/projects')}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow="New log"
        title="What are you logging?"
        subtitle="Choose what this entry is about. You can always change it later."
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <PickerCard
          tint="blue"
          icon={User}
          title="Self"
          subtitle="Your own work"
          onClick={() => handlePickType('self')}
        />
        <PickerCard
          tint="cream"
          icon={Users}
          title="Teammate"
          subtitle="About a team member"
          onClick={() => handlePickType('team')}
        />
        <PickerCard
          tint="sage"
          icon={Folder}
          title="Project"
          subtitle="About a project"
          onClick={() => handlePickType('project')}
        />
      </div>
    </div>
  );
}

// ── Entity List ────────────────────────────────────────────────────────────

interface EntityListProps {
  kind: 'team' | 'project';
  onBack: () => void;
  onSelect: (ctx: Context) => void;
  onAddNew: () => void;
}

function EntityList({ kind, onBack, onSelect, onAddNew }: EntityListProps) {
  const [items, setItems] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cfg =
    kind === 'team'
      ? {
          eyebrow: 'New log · Teammate',
          title: 'Select a teammate',
          subtitle: 'Pick the person this log is about.',
          emptyTitle: 'No teammates yet',
          emptyDesc:
            'Add teammates from the Teammates section first, then come back here.',
          emptyCta: 'Go to Teammates',
        }
      : {
          eyebrow: 'New log · Project',
          title: 'Select a project',
          subtitle: 'Pick the project this log is about.',
          emptyTitle: 'No projects yet',
          emptyDesc:
            'Create a project from the Projects section first, then come back here.',
          emptyCta: 'Go to Projects',
        };

  const contextType: ContextType = kind === 'team' ? 'team' : 'project';

  useEffect(() => {
    setIsLoading(true);
    contextsApi
      .list()
      .then((all) => setItems(all.filter((c) => c.type === contextType)))
      .catch(() => setError('Failed to load. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [contextType]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="mb-6 text-[13px] font-medium text-ink-2 hover:text-ink flex items-center gap-1 transition-colors"
      >
        ← Back
      </button>

      <PageHeader
        eyebrow={cfg.eyebrow}
        title={cfg.title}
        subtitle={cfg.subtitle}
      />

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-6 text-center">
          <p className="text-[14px] text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              contextsApi
                .list()
                .then((all) => setItems(all.filter((c) => c.type === contextType)))
                .catch(() => setError('Failed to load. Please try again.'))
                .finally(() => setIsLoading(false));
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && items.length === 0 && (
        <EmptyState
          icon={kind === 'team' ? Users : Folder}
          title={cfg.emptyTitle}
          description={cfg.emptyDesc}
          action={{ label: cfg.emptyCta, onClick: onAddNew }}
        />
      )}

      {/* List */}
      {!isLoading && !error && items.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <EntityRow
              key={item.id}
              item={item}
              kind={kind}
              onClick={() => onSelect(item)}
            />
          ))}

          {/* Add new quick link */}
          <button
            type="button"
            onClick={onAddNew}
            className="mt-2 h-14 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 dark:border-[#3A3A3A] text-[14px] font-medium text-ink-2 hover:text-ink hover:border-gray-400 transition-colors"
          >
            <Plus size={16} />
            <span>{kind === 'team' ? 'Add teammate' : 'Add project'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Entity Row ─────────────────────────────────────────────────────────────

interface EntityRowProps {
  item: Context;
  kind: 'team' | 'project';
  onClick: () => void;
}

function EntityRow({ item, kind, onClick }: EntityRowProps) {
  const initials = item.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left rounded-2xl border px-4 py-3.5 flex items-center gap-3.5',
        'bg-white dark:bg-surface-2 border-gray-100 dark:border-[#2A2A2A]',
        'hover:bg-gray-50 dark:hover:bg-surface-3 hover:-translate-y-px',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
      )}
    >
      {kind === 'team' ? (
        <span className="w-10 h-10 rounded-full bg-accent-tint border border-accent/20 flex items-center justify-center text-[14px] font-bold text-accent-active flex-shrink-0">
          {initials}
        </span>
      ) : (
        <span className="w-10 h-10 rounded-xl bg-cream-tint border border-black/5 flex items-center justify-center flex-shrink-0">
          <Folder size={18} className="text-cream-text" strokeWidth={1.75} />
        </span>
      )}
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-semibold text-ink dark:text-white truncate">
          {item.name}
        </span>
      </span>
      <ArrowRight
        size={16}
        className="text-ink-3 group-hover:text-ink-2 transition-colors flex-shrink-0"
      />
    </button>
  );
}
