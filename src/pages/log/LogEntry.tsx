import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hash,
  LayoutTemplate,
  Mic,
  MicOff,
  ArrowUp,
  Check,
  X,
  Plus,
  Search,
  ArrowRight,
  User,
  CalendarDays,
} from 'lucide-react';
import { logsApi } from '@/api/logs';
import { tagsApi } from '@/api/tags';
import { templatesApi } from '@/api/templates';
import type { Tag } from '@/types/tag';
import type { Template } from '@/types/template';
import { useLogFlowStore } from '@/store/logFlowStore';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';
import { TagChip } from '@/components/ui/TagChip';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { toISODate, formatDateRange, startOfDay } from '@/utils/date';

// ── Log Entry Page ────────────────────────────────────────────────────────

export default function LogEntry() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { contextId, contextType, contextName, dateType, dateStart, dateEnd, reset } =
    useLogFlowStore();

  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedText, setSubmittedText] = useState('');
  const [submittedTags, setSubmittedTags] = useState<Tag[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Guard: redirect back if no flow state
  useEffect(() => {
    if (!contextId || !dateStart || !dateEnd || !dateType) {
      navigate('/log', { replace: true });
    }
  }, [contextId, dateStart, dateEnd, dateType, navigate]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const canSubmit = text.trim().length > 0 && !isVoiceActive && !isSubmitting;

  // Build display labels
  const contextLabel = contextName ?? 'Self';
  const dateLabel =
    dateStart && dateEnd
      ? formatDateRange(startOfDay(dateStart), startOfDay(dateEnd))
      : '';

  async function handleSubmit() {
    if (!canSubmit || !contextId || !dateStart || !dateEnd || !dateType) return;
    setIsSubmitting(true);
    try {
      await logsApi.create({
        context_id: contextId,
        content: text.trim(),
        date_type: dateType,
        date_start: toISODate(dateStart),
        date_end: toISODate(dateEnd),
        tag_ids: selectedTags.map((t) => t.id),
      });
      setSubmittedText(text);
      setSubmittedTags(selectedTags);
      setSubmitted(true);
      toast('Log saved!', 'success');
    } catch {
      toast('Failed to save log. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleAddAnother() {
    setText('');
    setSelectedTags([]);
    setSubmitted(false);
    setTagPickerOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (submitted) {
    return (
      <SubmittedView
        contextLabel={contextLabel}
        dateLabel={dateLabel}
        text={submittedText}
        tags={submittedTags}
        onAddAnother={handleAddAnother}
        onDone={() => {
          reset();
          navigate('/home');
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Context + date chips */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <ContextChip icon={contextType === 'self' ? User : User} label={contextLabel} />
        <ContextChip icon={CalendarDays} label={dateLabel} />
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setTemplateModalOpen(true)}
          className="h-7 px-3 inline-flex items-center gap-1.5 bg-white dark:bg-surface-2 border border-gray-200 dark:border-[#2A2A2A] rounded-full text-[12.5px] font-semibold text-ink dark:text-white hover:bg-accent-tint hover:border-accent/30 hover:text-accent-active transition-colors"
        >
          <LayoutTemplate size={13} className="text-accent" />
          Use template
        </button>
      </div>

      {/* Heading */}
      <div className="mb-4">
        <h1 className="text-[28px] sm:text-[32px] font-bold text-ink dark:text-white tracking-heading leading-tight">
          {isVoiceActive ? 'Listening…' : 'What did you work on?'}
        </h1>
        <p className="mt-1.5 text-[14px] text-ink-2">
          {isVoiceActive
            ? "We'll transcribe to the input below — you can edit before saving."
            : 'A few sentences is plenty. You can add tags after.'}
        </p>
      </div>

      {/* Prompt card */}
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-xl overflow-hidden shadow-card-lg">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isVoiceActive
              ? 'Listening — your words will appear here…'
              : 'What did you work on?'
          }
          rows={6}
          className={cn(
            'w-full resize-none bg-transparent border-0 outline-none',
            'px-5 pt-5 pb-3',
            'text-[15px] text-ink dark:text-white placeholder:text-ink-3',
            'leading-[1.55] min-h-[148px]',
          )}
        />

        {/* Inline tag chips */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 pb-3">
            {selectedTags.map((t) => (
              <TagChip
                key={t.id}
                label={t.name}
                onRemove={() => setSelectedTags(selectedTags.filter((x) => x.id !== t.id))}
              />
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 dark:border-[#2A2A2A]">
          {/* Tag picker */}
          <div className="relative">
            <ToolbarBtn
              active={tagPickerOpen}
              onClick={() => setTagPickerOpen((o) => !o)}
            >
              <Hash size={15} />
              <span>Add tags</span>
            </ToolbarBtn>
            {tagPickerOpen && (
              <TagPickerPopover
                selected={selectedTags}
                onChange={setSelectedTags}
                onClose={() => setTagPickerOpen(false)}
              />
            )}
          </div>

          <ToolbarBtn onClick={() => setTemplateModalOpen(true)}>
            <LayoutTemplate size={15} />
            <span>Use template</span>
          </ToolbarBtn>

          <div className="flex-1" />

          {/* Mic button */}
          <MicBtn active={isVoiceActive} onClick={() => setIsVoiceActive((v) => !v)} />

          {/* Send button */}
          <SendBtn enabled={canSubmit} loading={isSubmitting} onClick={handleSubmit} />
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-2.5 flex items-center gap-1.5 text-[12.5px] text-ink-3">
        <Check size={13} className="text-sage-accent" />
        <span>Saved privately to your account. ⌘↵ to submit.</span>
      </div>

      {/* Template modal */}
      {templateModalOpen && (
        <TemplateModal
          onClose={() => setTemplateModalOpen(false)}
          onPick={(content) => {
            setText(content);
            setTemplateModalOpen(false);
            textareaRef.current?.focus();
          }}
          onCreateNew={() => {
            setTemplateModalOpen(false);
            navigate('/templates');
          }}
        />
      )}
    </div>
  );
}

// ── Submitted View ────────────────────────────────────────────────────────

function SubmittedView({
  contextLabel,
  dateLabel,
  text,
  tags,
  onAddAnother,
  onDone,
}: {
  contextLabel: string;
  dateLabel: string;
  text: string;
  tags: Tag[];
  onAddAnother: () => void;
  onDone: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Success pill */}
      <div className="flex justify-center mb-7">
        <span className="inline-flex items-center gap-2 bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-full px-4 py-2 text-[13px] font-medium text-ink dark:text-white shadow-card">
          <Check size={14} className="text-sage-accent" />
          Log added
        </span>
      </div>

      {/* Log card */}
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-xl p-7 shadow-card-lg">
        <div className="flex flex-wrap gap-2 mb-4">
          <ContextChip icon={User} label={contextLabel} />
          <ContextChip icon={CalendarDays} label={dateLabel} />
        </div>
        <p className="text-[15px] text-ink dark:text-white leading-[1.6] whitespace-pre-wrap text-pretty">
          {text}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-5">
            {tags.map((t) => (
              <TagChip key={t.id} label={t.name} />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center mt-7 gap-4">
        <Button variant="secondary" size="lg" leadingIcon={<Plus size={14} />} onClick={onAddAnother}>
          Add another log
        </Button>
        <Button size="lg" trailingIcon={<ArrowRight size={14} />} onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  );
}

// ── Context Chip ──────────────────────────────────────────────────────────

function ContextChip({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number | string; className?: string }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-gray-50 dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] rounded-full px-3 py-1.5 text-[12.5px] font-medium text-ink-2">
      <Icon size={13} className="text-accent flex-shrink-0" />
      <span>{label}</span>
    </span>
  );
}

// ── Toolbar Btn ───────────────────────────────────────────────────────────

function ToolbarBtn({
  children,
  onClick,
  active = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-9 px-3 inline-flex items-center gap-1.5 rounded-[10px] text-[13px] font-medium transition-colors',
        active
          ? 'bg-accent-tint border border-accent/30 text-accent-active'
          : 'text-ink-2 hover:bg-gray-100 dark:hover:bg-surface-3 hover:text-ink dark:hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

// ── Mic Button ────────────────────────────────────────────────────────────

function MicBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={active ? 'Stop listening' : 'Voice input'}
      onClick={onClick}
      className={cn(
        'relative w-10 h-10 rounded-full inline-flex items-center justify-center transition-colors',
        active
          ? 'bg-red-50 dark:bg-[rgba(196,95,95,0.12)] border border-red-200 dark:border-[rgba(196,95,95,0.3)] text-red-500'
          : 'bg-white dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] text-ink-2 hover:text-ink',
      )}
    >
      {active ? <MicOff size={17} /> : <Mic size={17} />}
      {active && (
        <span className="absolute inset-[-4px] rounded-full border-2 border-red-400/40 animate-[pulse-ring_1.4s_ease-out_infinite]" />
      )}
    </button>
  );
}

// ── Send Button ───────────────────────────────────────────────────────────

function SendBtn({
  enabled,
  loading,
  onClick,
}: {
  enabled: boolean;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label="Save log"
      disabled={!enabled || loading}
      onClick={onClick}
      className={cn(
        'w-10 h-10 rounded-full inline-flex items-center justify-center transition-all',
        enabled && !loading
          ? 'bg-accent text-white shadow-button-primary hover:bg-accent-hover cursor-pointer'
          : 'bg-gray-200 dark:bg-surface-3 text-gray-400 cursor-not-allowed',
      )}
    >
      <ArrowUp size={17} />
    </button>
  );
}

// ── Tag Picker Popover ────────────────────────────────────────────────────

function TagPickerPopover({
  selected,
  onChange,
  onClose,
}: {
  selected: Tag[];
  onChange: (tags: Tag[]) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedIds = new Set(selected.map((t) => t.id));
  const q = query.trim().toLowerCase();
  const filtered = q ? allTags.filter((t) => t.name.toLowerCase().includes(q)) : allTags;
  const exactExists = allTags.some((t) => t.name.toLowerCase() === q);

  useEffect(() => {
    tagsApi
      .list()
      .then(setAllTags)
      .catch(() => setAllTags([]))
      .finally(() => setIsLoading(false));
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggle(tag: Tag) {
    if (selectedIds.has(tag.id)) onChange(selected.filter((t) => t.id !== tag.id));
    else onChange([...selected, tag]);
  }

  async function createAndAdd() {
    if (!q) return;
    try {
      const newTag = await tagsApi.create({ name: q });
      setAllTags((prev) => [...prev, newTag]);
      onChange([...selected, newTag]);
      setQuery('');
    } catch {
      // Ignore — tag creation failed
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-lg shadow-float z-20 p-2">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-surface-3 rounded-[10px] mb-1.5">
          <Hash size={14} className="text-ink-3 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or create tag"
            className="flex-1 min-w-0 bg-transparent text-[13.5px] text-ink dark:text-white placeholder:text-ink-3 outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-ink-3 hover:text-ink-2 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Tags list */}
        <div className="max-h-52 overflow-y-auto flex flex-col gap-px">
          {isLoading && (
            <div className="py-3 text-center text-[12.5px] text-ink-3">Loading…</div>
          )}
          {!isLoading && filtered.map((t) => {
            const sel = selectedIds.has(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t)}
                className={cn(
                  'w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13.5px] transition-colors',
                  sel
                    ? 'bg-accent-tint text-accent-active'
                    : 'text-ink dark:text-white hover:bg-gray-50 dark:hover:bg-surface-3',
                )}
              >
                <span className="text-ink-3">#</span>
                <span className="flex-1">{t.name}</span>
                {sel && <Check size={13} className="text-accent-active" />}
              </button>
            );
          })}
          {!isLoading && filtered.length === 0 && !q && (
            <p className="py-3 px-3 text-[12.5px] text-ink-3">
              No tags yet — create one above.
            </p>
          )}
        </div>

        {/* Create new */}
        {q && !exactExists && (
          <button
            type="button"
            onClick={createAndAdd}
            className="mt-1.5 w-full flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-surface-3 border border-dashed border-gray-300 dark:border-[#3A3A3A] rounded-[10px] text-[13px] text-ink dark:text-white hover:bg-accent-tint hover:border-accent/30 transition-colors"
          >
            <Plus size={13} className="text-accent" />
            Create <strong className="font-semibold">#{q}</strong>
          </button>
        )}
      </div>
    </>
  );
}

// ── Template Modal ────────────────────────────────────────────────────────

function TemplateModal({
  onClose,
  onPick,
  onCreateNew,
}: {
  onClose: () => void;
  onPick: (content: string) => void;
  onCreateNew: () => void;
}) {
  const [myTemplates, setMyTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  useEffect(() => {
    templatesApi
      .list()
      .then(setMyTemplates)
      .catch(() => setMyTemplates([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredMy = q
    ? myTemplates.filter(
        (t) =>
          t.name.toLowerCase().includes(q) || t.content.toLowerCase().includes(q),
      )
    : myTemplates;

  const filteredSamples = q
    ? SAMPLE_TEMPLATES.filter(
        (s) => s.category.toLowerCase().includes(q) || s.content.toLowerCase().includes(q),
      )
    : SAMPLE_TEMPLATES;

  return (
    <Modal open onClose={onClose} className="max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-[#2A2A2A]">
        <div className="w-8 h-8 rounded-[10px] bg-accent-tint border border-accent/20 flex items-center justify-center flex-shrink-0">
          <LayoutTemplate size={16} className="text-accent-active" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-ink dark:text-white">Use a template</p>
          <p className="text-[12.5px] text-ink-3">Pick one to pre-fill your log.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-3 flex items-center justify-center text-ink-2 hover:text-ink transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] rounded-[10px]">
          <Search size={14} className="text-ink-3 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates…"
            className="flex-1 bg-transparent text-[13.5px] text-ink dark:text-white placeholder:text-ink-3 outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-ink-3 hover:text-ink-2">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 pb-6 overflow-y-auto max-h-[60vh]">
        {/* My templates */}
        <div className="flex items-baseline justify-between py-2">
          <span className="text-[13px] font-bold text-ink dark:text-white">My Templates</span>
          <span className="text-[12px] text-ink-3">{filteredMy.length}</span>
        </div>
        {isLoading ? (
          <div className="py-3 text-center text-[12.5px] text-ink-3">Loading…</div>
        ) : filteredMy.length === 0 ? (
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-surface-3 border border-dashed border-gray-300 dark:border-[#3A3A3A] rounded-card-lg p-4 mb-4 text-[13px] text-ink-2">
            <LayoutTemplate size={16} className="text-ink-3 flex-shrink-0" />
            <span className="flex-1 text-pretty">
              {myTemplates.length === 0
                ? 'No custom templates. Create one from Templates.'
                : 'No matches.'}
            </span>
            {myTemplates.length === 0 && (
              <button
                type="button"
                onClick={onCreateNew}
                className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-active hover:underline"
              >
                <Plus size={12} /> Create
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {filteredMy.map((t) => (
              <TemplateRow
                key={t.id}
                title={t.name}
                content={t.content}
                onClick={() => onPick(t.content)}
              />
            ))}
          </div>
        )}

        {/* Sample templates */}
        <div className="flex items-baseline justify-between py-2">
          <div>
            <span className="text-[13px] font-bold text-ink dark:text-white">Sample Templates</span>
            <span className="text-[12px] text-ink-3 ml-2">· ready-made formats</span>
          </div>
          <span className="text-[12px] text-ink-3">{filteredSamples.length}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {filteredSamples.map((s) => (
            <TemplateRow
              key={s.id}
              title={s.category}
              content={s.content}
              isSample
              onClick={() => onPick(s.content)}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}

function TemplateRow({
  title,
  content,
  isSample = false,
  onClick,
}: {
  title: string;
  content: string;
  isSample?: boolean;
  onClick: () => void;
}) {
  const preview = content
    .split('\n')
    .filter((l) => l.trim().length > 0)
    .slice(0, 2)
    .map((l) => l.replace(/^[-•\s]+/, '• ').trim())
    .join(' · ');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group w-full text-left flex items-center gap-3 rounded-xl border px-3.5 py-3',
        'transition-all duration-150',
        isSample
          ? 'bg-gray-50 dark:bg-surface-3 border-gray-100 dark:border-[#2A2A2A] hover:bg-accent-tint hover:border-accent/25'
          : 'bg-white dark:bg-surface-2 border-gray-100 dark:border-[#2A2A2A] hover:bg-accent-tint hover:border-accent/25',
      )}
    >
      <span className="w-8 h-8 rounded-[9px] bg-white dark:bg-surface-2 border border-black/5 flex items-center justify-center flex-shrink-0">
        <LayoutTemplate size={13} className={isSample ? 'text-cream-text' : 'text-accent-active'} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13.5px] font-semibold text-ink dark:text-white truncate">{title}</span>
          {isSample && (
            <span className="text-[10px] font-semibold text-ink-3 bg-gray-100 dark:bg-surface-3 border border-gray-200 dark:border-[#3A3A3A] rounded-full px-2 py-0.5 uppercase tracking-[0.06em] flex-shrink-0">
              Sample
            </span>
          )}
        </div>
        <p className="text-[12px] text-ink-3 truncate mt-0.5">{preview}</p>
      </div>
      <ArrowRight size={13} className="text-ink-3 group-hover:text-accent-active transition-colors flex-shrink-0" />
    </button>
  );
}

// ── Sample Templates ──────────────────────────────────────────────────────

const SAMPLE_TEMPLATES = [
  {
    id: 'dev',
    category: 'Software Engineer',
    content: `- Tasks completed today
- Code reviews done
- Bugs fixed / issues resolved
- New things learned
- Blockers or dependencies`,
  },
  {
    id: 'manager',
    category: 'Engineering Manager',
    content: `- Team highlights this week
- 1:1s conducted — key takeaways
- Projects unblocked or escalated
- Hiring / performance actions
- My own work & decisions`,
  },
  {
    id: 'pm',
    category: 'Product Manager',
    content: `- Decisions made and rationale
- Customer insights gathered
- Features shipped or spec'd
- Metrics moved (or missed)
- Cross-functional alignment`,
  },
  {
    id: 'design',
    category: 'Designer',
    content: `- Designs delivered or iterated
- User research sessions
- Feedback incorporated
- Tools / explorations
- Pending reviews`,
  },
  {
    id: 'sales',
    category: 'Sales',
    content: `- Prospects contacted
- Demos / calls completed
- Deals advanced or closed
- Objections encountered
- Pipeline updates`,
  },
  {
    id: 'executive',
    category: 'Executive / CXO',
    content: `- Strategic decisions made
- Key stakeholder conversations
- Team health & morale notes
- External relationships
- Personal priorities`,
  },
];
