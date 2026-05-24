import { useEffect, useRef, useState } from 'react';
import { Users, Plus, Pencil, Check, X } from 'lucide-react';
import { contextsApi } from '@/api/contexts';
import type { Context } from '@/types/context';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ── Teammates Page ────────────────────────────────────────────────────────

export default function Teammates() {
  const { toast } = useToast();
  const [items, setItems] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);

  useEffect(() => {
    contextsApi
      .list()
      .then((all) => setItems(all.filter((c) => c.type === 'team')))
      .catch(() => setError('Failed to load teammates.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function commitAdd() {
    const name = addDraft.trim();
    if (!name) return;
    try {
      const created = await contextsApi.create({ name, type: 'team' });
      setItems((prev) => [created, ...prev]);
      setAddDraft('');
      setAdding(false);
      toast('Teammate added.', 'success');
    } catch {
      toast('Failed to add teammate.', 'error');
    }
  }

  async function commitRename(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) { setRenamingId(null); return; }
    try {
      const updated = await contextsApi.update(id, { name: trimmed });
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      toast('Renamed.', 'success');
    } catch {
      toast('Failed to rename.', 'error');
    } finally {
      setRenamingId(null);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow="Manage"
        title="Teammates"
        subtitle="People you log about. Rename anytime — your logs follow."
      />

      {/* Counter + add button */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[13px] text-ink-3">
          {isLoading ? '…' : `${items.length} ${items.length === 1 ? 'teammate' : 'teammates'}`}
        </span>
        {!adding && !isLoading && items.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => setAdding(true)}
          >
            Add teammate
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-6 text-center">
          <p className="text-[14px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex flex-col gap-2.5">
          {/* Inline add row */}
          {adding && (
            <InlineAddRow
              kind="team"
              value={addDraft}
              onChange={setAddDraft}
              onCommit={commitAdd}
              onCancel={() => { setAdding(false); setAddDraft(''); }}
              placeholder="Teammate's name"
            />
          )}

          {/* Empty state */}
          {items.length === 0 && !adding && (
            <EmptyState
              icon={Users}
              title="No teammates yet"
              description="Add your first teammate to start logging about them."
              action={{ label: 'Add teammate', onClick: () => setAdding(true) }}
            />
          )}

          {/* Items */}
          {items.map((item) => (
            <ManagementRow
              key={item.id}
              kind="team"
              item={item}
              renaming={renamingId === item.id}
              onStartRename={() => setRenamingId(item.id)}
              onCancelRename={() => setRenamingId(null)}
              onCommitRename={(v) => commitRename(item.id, v)}
            />
          ))}

          {/* Bottom add button */}
          {!adding && items.length > 0 && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-1.5 h-14 w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 dark:border-[#3A3A3A] text-[14px] font-medium text-ink-2 hover:text-ink hover:border-gray-400 dark:hover:border-[#4A4A4A] transition-colors"
            >
              <Plus size={15} />
              Add teammate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components (exported for Projects.tsx reuse) ───────────────

export interface ManagementItem {
  id: string;
  name: string;
}

interface ManagementRowProps {
  kind: 'team' | 'project';
  item: ManagementItem;
  renaming: boolean;
  onStartRename: () => void;
  onCancelRename: () => void;
  onCommitRename: (name: string) => void;
}

export function ManagementRow({
  kind,
  item,
  renaming,
  onStartRename,
  onCancelRename,
  onCommitRename,
}: ManagementRowProps) {
  const [nameDraft, setNameDraft] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renaming) {
      setNameDraft(item.name);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [renaming, item.name]);

  const initials = item.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={cn(
        'flex items-center gap-3.5 rounded-2xl border px-4 py-3',
        'bg-white dark:bg-surface-2 transition-all duration-150',
        renaming
          ? 'border-accent shadow-[0_0_0_4px_rgba(126,176,247,0.18)]'
          : 'border-gray-100 dark:border-[#2A2A2A] hover:shadow-card',
      )}
    >
      {kind === 'team' ? (
        <span className="w-10 h-10 rounded-full bg-accent-tint border border-accent/20 flex items-center justify-center text-[14px] font-bold text-accent-active flex-shrink-0">
          {initials}
        </span>
      ) : (
        <span className="w-10 h-10 rounded-xl bg-cream-tint border border-black/5 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" fill="none" stroke="#9C7A3C" strokeWidth="1.75" viewBox="0 0 24 24">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </span>
      )}

      <div className="flex-1 min-w-0">
        {renaming ? (
          <input
            ref={inputRef}
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRename(nameDraft);
              if (e.key === 'Escape') onCancelRename();
            }}
            className="w-full bg-transparent text-[15px] font-semibold text-ink dark:text-white outline-none"
          />
        ) : (
          <span className="block text-[15px] font-semibold text-ink dark:text-white truncate">
            {item.name}
          </span>
        )}
        <span className="block text-[12.5px] text-ink-3 mt-0.5">
          {renaming ? 'Press Enter to save · Esc to cancel' : ''}
        </span>
      </div>

      <div className="flex gap-1.5">
        {renaming ? (
          <>
            <IconBtn
              label="Save"
              onClick={() => onCommitRename(nameDraft)}
              className="bg-accent text-white hover:bg-accent-hover"
            >
              <Check size={13} />
            </IconBtn>
            <IconBtn label="Cancel" onClick={onCancelRename}>
              <X size={13} />
            </IconBtn>
          </>
        ) : (
          <IconBtn label={`Rename ${item.name}`} onClick={onStartRename} ghost>
            <Pencil size={13} />
          </IconBtn>
        )}
      </div>
    </div>
  );
}

interface InlineAddRowProps {
  kind: 'team' | 'project';
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  placeholder: string;
}

export function InlineAddRow({ kind, value, onChange, onCommit, onCancel, placeholder }: InlineAddRowProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-accent shadow-[0_0_0_4px_rgba(126,176,247,0.18)] px-4 py-3 bg-white dark:bg-surface-2">
      {kind === 'team' ? (
        <span className="w-10 h-10 rounded-full bg-accent-tint border border-dashed border-accent/40 flex items-center justify-center flex-shrink-0">
          <Plus size={16} className="text-accent-light" />
        </span>
      ) : (
        <span className="w-10 h-10 rounded-xl bg-cream-tint border border-dashed border-cream-accent/40 flex items-center justify-center flex-shrink-0">
          <Plus size={16} className="text-cream-text" />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommit();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] font-semibold text-ink dark:text-white placeholder:text-ink-3 outline-none"
        />
        <span className="text-[12.5px] text-ink-3">Press Enter to save · Esc to cancel</span>
      </div>
      <div className="flex gap-1.5">
        <IconBtn
          label="Save"
          onClick={onCommit}
          disabled={!value.trim()}
          className="bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
        >
          <Check size={13} />
        </IconBtn>
        <IconBtn label="Cancel" onClick={onCancel}>
          <X size={13} />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  children,
  className,
  ghost = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  ghost?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
        ghost
          ? 'text-ink-3 hover:text-ink hover:bg-gray-100 dark:hover:bg-surface-3'
          : 'text-ink-2 hover:bg-gray-100 dark:hover:bg-surface-3',
        className,
      )}
    >
      {children}
    </button>
  );
}
