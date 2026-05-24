import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Trash2, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { recallApi } from '@/api/recall';
import type { ChatSession, ChatSessionDetail, ChatMessage } from '@/types/recall';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ── Chat History Page ─────────────────────────────────────────────────────

export default function ChatHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detail view
  const [selectedSession, setSelectedSession] = useState<ChatSessionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    recallApi
      .listSessions()
      .then(({ data, total: t }) => {
        setSessions(data);
        setTotal(t);
      })
      .catch(() => setError('Failed to load chat history.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function openSession(session: ChatSession) {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const detail = await recallApi.getSession(session.id);
      setSelectedSession(detail);
    } catch {
      setDetailError('Failed to load conversation.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteLoading) return;
    setDeleteLoading(true);
    try {
      await recallApi.deleteSession(deleteTarget.id);
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setTotal((t) => t - 1);
      if (selectedSession?.id === deleteTarget.id) setSelectedSession(null);
      toast('Conversation deleted.', 'success');
      setDeleteTarget(null);
    } catch {
      toast('Failed to delete conversation.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Detail view ──
  if (selectedSession) {
    return (
      <SessionDetailView
        session={selectedSession}
        onBack={() => setSelectedSession(null)}
        onDelete={() => {
          setDeleteTarget(selectedSession);
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      <PageHeader
        eyebrow="Recall"
        title="Chat history"
        subtitle="All your AI recall conversations, sorted newest first."
      />

      {/* Count */}
      {!isLoading && !error && sessions.length > 0 && (
        <p className="text-[13px] text-ink-3 mb-4 px-1">
          {total} {total === 1 ? 'conversation' : 'conversations'}
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="rounded-card-lg bg-red-50 dark:bg-[rgba(196,95,95,0.08)] border border-red-100 dark:border-[rgba(196,95,95,0.18)] p-6 text-center">
          <p className="text-[14px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && sessions.length === 0 && (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Ask the AI to recall your work and your conversations will appear here."
          action={{ label: 'Go to Recall', onClick: () => navigate('/recall') }}
        />
      )}

      {/* Session list */}
      {!isLoading && !error && sessions.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              loading={detailLoading}
              onClick={() => openSession(session)}
              onDelete={() => setDeleteTarget(session)}
            />
          ))}
        </div>
      )}

      {/* Detail load error toast */}
      {detailError && (
        <p className="mt-4 text-center text-[13px] text-red-500">{detailError}</p>
      )}

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete conversation"
        maxWidth="max-w-sm"
      >
        <div className="px-6 py-5 space-y-4">
          <p className="text-[14px] text-ink-2 leading-relaxed">
            Delete{' '}
            <span className="font-semibold text-ink dark:text-white">
              "{deleteTarget?.title}"
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

// ── Session Row ───────────────────────────────────────────────────────────

function SessionRow({
  session,
  loading,
  onClick,
  onDelete,
}: {
  session: ChatSession;
  loading: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const date = new Date(session.updated_at);
  const dateLabel = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });

  return (
    <div
      className={cn(
        'group flex items-center gap-3.5 rounded-2xl border px-4 py-3.5',
        'bg-white dark:bg-surface-2 border-gray-100 dark:border-[#2A2A2A]',
        'hover:shadow-card transition-all duration-150',
        loading && 'opacity-60 pointer-events-none',
      )}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-accent-tint border border-accent/15 flex items-center justify-center flex-shrink-0">
        <Sparkles size={16} className="text-accent-active" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0" onClick={onClick} style={{ cursor: 'pointer' }}>
        <p className="text-[14px] font-semibold text-ink dark:text-white truncate">
          {session.title}
        </p>
        <p className="text-[12.5px] text-ink-3 mt-0.5">
          {session.message_count} {session.message_count === 1 ? 'message' : 'messages'} · {dateLabel}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete conversation"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-red-500 hover:bg-red-50 dark:hover:bg-[rgba(196,95,95,0.08)] opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={13} />
        </button>
        <button
          type="button"
          onClick={onClick}
          aria-label="Open conversation"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-3 hover:text-ink hover:bg-gray-100 dark:hover:bg-surface-3 transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Session Detail View ───────────────────────────────────────────────────

function SessionDetailView({
  session,
  onBack,
  onDelete,
}: {
  session: ChatSessionDetail;
  onBack: () => void;
  onDelete: () => void;
}) {
  const date = new Date(session.created_at);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
      {/* Back nav */}
      <nav className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink transition-colors"
        >
          <ArrowLeft size={14} />
          Chat history
        </button>
        <span className="text-ink-3">/</span>
        <span className="text-[13px] text-ink dark:text-white font-semibold truncate max-w-[200px]">
          {session.title}
        </span>
      </nav>

      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-[22px] font-bold text-ink dark:text-white tracking-tight leading-tight">
            {session.title}
          </h1>
          <p className="text-[13px] text-ink-3 mt-1">{dateLabel}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<Trash2 size={13} />}
          onClick={onDelete}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-[rgba(196,95,95,0.08)] flex-shrink-0"
        >
          Delete
        </Button>
      </div>

      {/* Messages */}
      <div className="flex flex-col gap-4">
        {session.messages.map((msg) => (
          <ChatMessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Read-only notice */}
      <div className="mt-8 flex items-center justify-center gap-2 text-[12.5px] text-ink-3">
        <MessageSquare size={13} />
        <span>Read-only · Continue this recall from the Recall page</span>
      </div>
    </div>
  );
}

// ── Chat Message Bubble ───────────────────────────────────────────────────

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-accent-tint border border-accent/20 flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
          <Sparkles size={13} className="text-accent-active" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed',
          isUser
            ? 'bg-ink dark:bg-white text-white dark:text-ink rounded-br-sm'
            : 'bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] text-ink dark:text-white rounded-bl-sm',
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        {!isUser && message.source_log_ids.length > 0 && (
          <p className="text-[11.5px] text-ink-3 mt-2 pt-2 border-t border-gray-100 dark:border-[#2A2A2A]">
            From {message.source_log_ids.length} log{message.source_log_ids.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
