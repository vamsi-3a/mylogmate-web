import { useEffect, useRef, useState } from 'react';
import { Hash, Plus, Pencil, Check, X, Trash2 } from 'lucide-react';
import { tagsApi } from '@/api/tags';
import type { Tag } from '@/types/tag';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ── Tags Page ─────────────────────────────────────────────────────────────

export default function Tags() {
  const { toast } = useToast();
  const [items, setItems] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add
  const [adding, setAdding] = useState(false);
  const [addDraft, setAddDraft] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Rename
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    tagsApi
      .list()
      .then(setItems)
      .catch(() => setError('Failed to load tags.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (adding) addInputRef.current?.focus();
  }, [adding]);

  useEffect(() => {
    if (renamingId) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renamingId]);

  async function commitAdd() {
    const name = addDraft.trim();
    if (!name || addLoading) return;
    setAddLoading(true);
    try {
      const created = await tagsApi.create({ name });
      setItems((prev) => [created, ...prev]);
      setAddDraft('');
      setAdding(false);
      toast('Tag created.', 'success');
    } catch {
      toast('Failed to create tag.', 'error');
    } finally {
      setAddLoading(false);
    }
  }

  function startRename(tag: Tag) {
    setRenamingId(tag.id);
    setRenameDraft(tag.name);
  }

  async function commitRename() {
    if (!renamingId) return;
    const name = renameDraft.trim();
    if (!name) { setRenamingId(null); return; }
    try {
      const updated = await tagsApi.update(renamingId, { name });
      setItems((prev) => prev.map((t) => (t.id === renamingId ? updated : t)));
      toast('Tag renamed.', 'success');
    } catch {
      toast('Failed to rename tag.', 'error');
    } finally {
      setRenamingId(null);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    try {
      await tagsApi.delete(deleteTarget.id);
      setItems((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast(`"${deleteTarget.name}" deleted.`, 'success');
      setDeleteTarget(null);
    } catch {
      toast('Failed to delete tag.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow="Manage"
        title="Tags"
        subtitle="Organize your logs with tags. Rename or remove them anytime."
      />

      {/* Counter + add button */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-[13px] text-ink-3">
          {isLoading ? '…' : `${items.length} ${items.length === 1 ? 'tag' : 'tags'}`}
        </span>
        {!adding && !isLoading && items.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<Plus size={14} />}
            onClick={() => setAdding(true)}
          >
            Add tag
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-wrap gap-2.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-6 text-center">
          <p className="text-[14px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          {/* Inline add row */}
          {adding && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl border border-accent shadow-[0_0_0_4px_rgba(126,176,247,0.18)] bg-white dark:bg-surface-2">
              <Hash size={14} className="text-accent flex-shrink-0" />
              <input
                ref={addInputRef}
                value={addDraft}
                onChange={(e) => setAddDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitAdd();
                  if (e.key === 'Escape') { setAdding(false); setAddDraft(''); }
                }}
                placeholder="Tag name"
                className="flex-1 bg-transparent text-[14px] font-semibold text-ink dark:text-white placeholder:text-ink-3 outline-none"
              />
              <span className="text-[11.5px] text-ink-3 hidden sm:block">Enter to save · Esc to cancel</span>
              <button
                type="button"
                onClick={commitAdd}
                disabled={!addDraft.trim() || addLoading}
                className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent-hover disabled:opacity-50 transition-colors"
                aria-label="Save tag"
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                onClick={() => { setAdding(false); setAddDraft(''); }}
                className="w-7 h-7 rounded-lg text-ink-2 hover:bg-gray-100 dark:hover:bg-surface-3 flex items-center justify-center transition-colors"
                aria-label="Cancel"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Empty state */}
          {items.length === 0 && !adding && (
            <EmptyState
              icon={Hash}
              title="No tags yet"
              description="Create tags to categorize and filter your logs."
              action={{ label: 'Add tag', onClick: () => setAdding(true) }}
            />
          )}

          {/* Tag pill grid */}
          {items.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {items.map((tag) => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  isRenaming={renamingId === tag.id}
                  renameDraft={renameDraft}
                  renameInputRef={renameInputRef}
                  onRenameDraftChange={setRenameDraft}
                  onStartRename={() => startRename(tag)}
                  onCommitRename={commitRename}
                  onCancelRename={() => setRenamingId(null)}
                  onDelete={() => setDeleteTarget(tag)}
                />
              ))}

              {/* Add pill */}
              {!adding && (
                <button
                  type="button"
                  onClick={() => setAdding(true)}
                  className="h-9 px-3.5 flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 dark:border-[#3A3A3A] text-[13px] text-ink-3 hover:text-ink hover:border-gray-400 dark:hover:border-[#4A4A4A] transition-colors"
                >
                  <Plus size={13} />
                  Add
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete tag"
        maxWidth="max-w-sm"
      >
        <div className="px-6 py-5 space-y-4">
          <p className="text-[14px] text-ink-2 dark:text-ink-2 leading-relaxed">
            Delete{' '}
            <span className="font-semibold text-ink dark:text-white">
              #{deleteTarget?.name}
            </span>
            ? It will be removed from all logs. This can't be undone.
          </p>
          <div className="flex gap-2.5 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              leadingIcon={<Trash2 size={14} />}
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Tag Pill ──────────────────────────────────────────────────────────────

interface TagPillProps {
  tag: Tag;
  isRenaming: boolean;
  renameDraft: string;
  renameInputRef: React.RefObject<HTMLInputElement>;
  onRenameDraftChange: (v: string) => void;
  onStartRename: () => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onDelete: () => void;
}

function TagPill({
  tag,
  isRenaming,
  renameDraft,
  renameInputRef,
  onRenameDraftChange,
  onStartRename,
  onCommitRename,
  onCancelRename,
  onDelete,
}: TagPillProps) {
  if (isRenaming) {
    return (
      <div className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-accent shadow-[0_0_0_3px_rgba(126,176,247,0.18)] bg-white dark:bg-surface-2">
        <Hash size={12} className="text-accent flex-shrink-0" />
        <input
          ref={renameInputRef}
          value={renameDraft}
          onChange={(e) => onRenameDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommitRename();
            if (e.key === 'Escape') onCancelRename();
          }}
          className="w-24 bg-transparent text-[13px] font-semibold text-ink dark:text-white outline-none"
        />
        <button
          type="button"
          onClick={onCommitRename}
          className="w-5 h-5 rounded-md bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors"
          aria-label="Save"
        >
          <Check size={11} />
        </button>
        <button
          type="button"
          onClick={onCancelRename}
          className="w-5 h-5 rounded-md text-ink-3 hover:text-ink hover:bg-gray-100 dark:hover:bg-surface-3 flex items-center justify-center transition-colors"
          aria-label="Cancel"
        >
          <X size={11} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-1 h-9 px-3 rounded-full',
        'border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-surface-2',
        'hover:border-gray-300 dark:hover:border-[#3A3A3A] transition-colors',
      )}
    >
      <Hash size={12} className="text-ink-3 flex-shrink-0" />
      <span className="text-[13px] font-semibold text-ink dark:text-white">{tag.name}</span>
      {tag.use_count !== undefined && tag.use_count > 0 && (
        <span className="text-[11px] text-ink-3 ml-0.5">{tag.use_count}</span>
      )}

      {/* Action icons — appear on hover */}
      <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onStartRename}
          aria-label={`Rename ${tag.name}`}
          className="w-5 h-5 rounded-md flex items-center justify-center text-ink-3 hover:text-ink hover:bg-gray-100 dark:hover:bg-surface-3 transition-colors"
        >
          <Pencil size={11} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${tag.name}`}
          className="w-5 h-5 rounded-md flex items-center justify-center text-ink-3 hover:text-red-500 hover:bg-red-50 dark:hover:bg-[rgba(196,95,95,0.08)] transition-colors"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
