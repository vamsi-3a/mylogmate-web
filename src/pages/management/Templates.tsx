import { useEffect, useRef, useState } from 'react';
import { FileText, Plus, Pencil, Check, Trash2, Lock } from 'lucide-react';
import { templatesApi } from '@/api/templates';
import type { Template } from '@/types/template';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ── Sample / read-only templates ──────────────────────────────────────────

interface SampleTemplateItem {
  id: string;
  name: string;
  preview: string;
  tint: 'blue' | 'cream' | 'sage';
}

const SAMPLE_TEMPLATES: SampleTemplateItem[] = [
  {
    id: 'sample-daily',
    name: 'Daily standup',
    preview: "Today I worked on… · Blocked by… · Tomorrow I'll…",
    tint: 'blue',
  },
  {
    id: 'sample-weekly',
    name: 'Weekly review',
    preview: 'Key wins this week… · Challenges… · Next week focus…',
    tint: 'cream',
  },
  {
    id: 'sample-pr',
    name: 'PR shipped',
    preview: 'Merged PR for… · Impact: … · Review notes…',
    tint: 'sage',
  },
  {
    id: 'sample-feedback',
    name: 'Feedback received',
    preview: 'Feedback from… · Key points: … · Action items…',
    tint: 'blue',
  },
  {
    id: 'sample-incident',
    name: 'Incident response',
    preview: 'Incident: … · Timeline… · Root cause… · Next steps…',
    tint: 'cream',
  },
  {
    id: 'sample-1on1',
    name: '1-on-1 notes',
    preview: 'Discussed… · Action items… · Follow-up by…',
    tint: 'sage',
  },
];

const TINT_CLASSES: Record<string, string> = {
  blue: 'bg-accent-tint border-accent/15 dark:border-accent/10',
  cream: 'bg-cream-tint border-[#C9A35A]/15 dark:border-[#C9A35A]/10',
  sage: 'bg-sage-tint border-[#6BBF8A]/15 dark:border-[#6BBF8A]/10',
};

// ── Templates Page ────────────────────────────────────────────────────────

export default function Templates() {
  const { toast } = useToast();
  const [items, setItems] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create
  const [creating, setCreating] = useState(false);

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    templatesApi
      .list()
      .then(setItems)
      .catch(() => setError('Failed to load templates.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleCreate(name: string, content: string) {
    try {
      const created = await templatesApi.create({ name, content });
      setItems((prev) => [created, ...prev]);
      setCreating(false);
      toast('Template created.', 'success');
    } catch {
      toast('Failed to create template.', 'error');
      throw new Error('create failed');
    }
  }

  async function handleUpdate(id: string, name: string, content: string) {
    try {
      const updated = await templatesApi.update(id, { name, content });
      setItems((prev) => prev.map((t) => (t.id === id ? updated : t)));
      setEditingId(null);
      toast('Template saved.', 'success');
    } catch {
      toast('Failed to save template.', 'error');
      throw new Error('update failed');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    try {
      await templatesApi.delete(deleteTarget.id);
      setItems((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast('Template deleted.', 'success');
      setDeleteTarget(null);
    } catch {
      toast('Failed to delete template.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow="Manage"
        title="Templates"
        subtitle="Reusable formats for your logs. Sample templates are read-only."
      />

      {/* ── My templates ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-[13px] font-semibold text-ink-2 uppercase tracking-wider">
            My templates
          </h2>
          {!isLoading && !creating && (
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Plus size={14} />}
              onClick={() => { setCreating(true); setEditingId(null); }}
            >
              New template
            </Button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => <CardSkeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-6 text-center">
            <p className="text-[14px] text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex flex-col gap-3">
            {/* Inline create form */}
            {creating && (
              <TemplateEditCard
                onSave={handleCreate}
                onCancel={() => setCreating(false)}
              />
            )}

            {/* Empty state */}
            {items.length === 0 && !creating && (
              <EmptyState
                icon={FileText}
                title="No templates yet"
                description="Create your own templates to speed up logging."
                action={{ label: 'Create template', onClick: () => setCreating(true) }}
              />
            )}

            {/* Template cards */}
            {items.map((template) =>
              editingId === template.id ? (
                <TemplateEditCard
                  key={template.id}
                  initial={template}
                  onSave={(name, content) => handleUpdate(template.id, name, content)}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={() => { setEditingId(template.id); setCreating(false); }}
                  onDelete={() => setDeleteTarget(template)}
                />
              ),
            )}
          </div>
        )}
      </section>

      {/* ── Sample templates ── */}
      <section>
        <div className="flex items-center gap-2 mb-3 px-1">
          <h2 className="text-[13px] font-semibold text-ink-2 uppercase tracking-wider">
            Sample templates
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-surface-3 text-[11.5px] text-ink-3">
            <Lock size={10} />
            Read-only
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {SAMPLE_TEMPLATES.map((s) => (
            <SampleTemplateCard key={s.id} sample={s} />
          ))}
        </div>
      </section>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete template"
        maxWidth="max-w-sm"
      >
        <div className="px-6 py-5 space-y-4">
          <p className="text-[14px] text-ink-2 leading-relaxed">
            Delete{' '}
            <span className="font-semibold text-ink dark:text-white">
              {deleteTarget?.name}
            </span>
            ? This can't be undone.
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

// ── Template Card (view mode) ─────────────────────────────────────────────

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group rounded-2xl border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-surface-2 px-5 py-4 hover:shadow-card transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-[15px] font-semibold text-ink dark:text-white leading-snug">
          {template.name}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit template"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink hover:bg-gray-100 dark:hover:bg-surface-3 transition-colors"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label="Delete template"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-3 hover:text-red-500 hover:bg-red-50 dark:hover:bg-[rgba(196,95,95,0.08)] transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <p className="text-[13px] text-ink-2 leading-relaxed line-clamp-3 whitespace-pre-line">
        {template.content}
      </p>
    </div>
  );
}

// ── Template Edit Card ────────────────────────────────────────────────────

function TemplateEditCard({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Template;
  onSave: (name: string, content: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  async function handleSave() {
    if (!name.trim() || !content.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(name.trim(), content.trim());
    } catch {
      // parent already toasted
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-accent shadow-[0_0_0_4px_rgba(126,176,247,0.18)] bg-white dark:bg-surface-2 p-4 flex flex-col gap-3">
      <input
        ref={nameRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Template name"
        className="w-full bg-transparent text-[15px] font-semibold text-ink dark:text-white placeholder:text-ink-3 outline-none border-b border-gray-100 dark:border-[#2A2A2A] pb-2.5"
        onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Template content…"
        rows={5}
        className="w-full resize-none bg-transparent text-[14px] text-ink dark:text-white placeholder:text-ink-3 outline-none leading-relaxed"
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel();
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave();
        }}
      />
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-[#2A2A2A]">
        <span className="text-[11.5px] text-ink-3">⌘↵ to save · Esc to cancel</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            leadingIcon={<Check size={13} />}
            onClick={handleSave}
            disabled={!name.trim() || !content.trim() || saving}
          >
            {saving ? 'Saving…' : initial ? 'Save' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Sample Template Card ──────────────────────────────────────────────────

function SampleTemplateCard({ sample }: { sample: SampleTemplateItem }) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        TINT_CLASSES[sample.tint],
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-ink-2 flex-shrink-0" />
        <span className="text-[14px] font-semibold text-ink dark:text-white">
          {sample.name}
        </span>
      </div>
      <p className="text-[12.5px] text-ink-2 leading-relaxed">{sample.preview}</p>
    </div>
  );
}
