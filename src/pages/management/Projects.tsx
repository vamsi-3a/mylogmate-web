import { useEffect, useState } from 'react';
import { Folder, Plus } from 'lucide-react';
import { contextsApi } from '@/api/contexts';
import type { Context } from '@/types/context';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ManagementRow, InlineAddRow } from './Teammates';

// ── Projects Page ─────────────────────────────────────────────────────────

export default function Projects() {
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
      .then((all) => setItems(all.filter((c) => c.type === 'project')))
      .catch(() => setError('Failed to load projects.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function commitAdd() {
    const name = addDraft.trim();
    if (!name) return;
    try {
      const created = await contextsApi.create({ name, type: 'project' });
      setItems((prev) => [created, ...prev]);
      setAddDraft('');
      setAdding(false);
      toast('Project added.', 'success');
    } catch {
      toast('Failed to add project.', 'error');
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
        title="Projects"
        subtitle="Work areas you log about. Rename anytime — your logs follow."
      />

      {/* Counter + add button */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[13px] text-ink-3">
          {isLoading ? '…' : `${items.length} ${items.length === 1 ? 'project' : 'projects'}`}
        </span>
        {!adding && !isLoading && items.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => setAdding(true)}
          >
            Add project
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
              kind="project"
              value={addDraft}
              onChange={setAddDraft}
              onCommit={commitAdd}
              onCancel={() => { setAdding(false); setAddDraft(''); }}
              placeholder="Project name"
            />
          )}

          {/* Empty state */}
          {items.length === 0 && !adding && (
            <EmptyState
              icon={Folder}
              title="No projects yet"
              description="Add a project to start logging about it."
              action={{ label: 'Add project', onClick: () => setAdding(true) }}
            />
          )}

          {/* Items */}
          {items.map((item) => (
            <ManagementRow
              key={item.id}
              kind="project"
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
              Add project
            </button>
          )}
        </div>
      )}
    </div>
  );
}
