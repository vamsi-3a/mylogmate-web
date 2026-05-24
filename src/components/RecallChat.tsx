import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, ArrowUp, ExternalLink } from 'lucide-react';
import { recallApi } from '@/api/recall';
import type { LogEntry } from '@/types/log';
import { formatDate, fromISODate } from '@/utils/date';
import { cn } from '@/utils/cn';

// ── Types ─────────────────────────────────────────────────────────────────

interface ChatMsg {
  role: 'user' | 'ai';
  text?: string;
  thinking?: boolean;
  sources?: string[];
}

// ── RecallChat — self-contained Ask-AI surface ────────────────────────────
//
// Mounted on the /recall pages. Owns its own chat_session_id so follow-up
// turns extend the same conversation instead of spawning a fresh session
// per question (the bug that made Chat History show one chat as many).

interface RecallChatProps {
  /** Public scope label shown in the overlay header */
  contextLabel: string;
  /** Real UUID of the context to query, OR the magic string "self".
   *  Null means "no specific context" — the AI bar will be disabled. */
  contextId: string | null;
  /** Logs already loaded by the parent — used to resolve
   *  source_log_ids → readable date labels. */
  logs: LogEntry[];
  /** Optional initial query — if set, the overlay opens immediately and
   *  sends this query (used when user submits from a hero ask bar). */
  initialQuery?: string;
  /** Whether the overlay is open */
  open: boolean;
  /** Called when the user closes the overlay (X / Esc). The parent should
   *  setOpen(false) AND clear initialQuery to allow re-triggering. */
  onClose: () => void;
}

export function RecallChat({
  contextLabel,
  contextId,
  logs,
  initialQuery,
  open,
  onClose,
}: RecallChatProps) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const seededRef = useRef(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset chat state when context changes — a new context means a new
  // conversation. (We intentionally do NOT reset on open/close so the user
  // can dismiss the overlay and reopen it to continue the same chat.)
  useEffect(() => {
    setMessages([]);
    setSessionId(null);
    seededRef.current = false;
  }, [contextId]);

  // ESC closes the overlay
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Seed an opening question (e.g., from the hero ask bar)
  useEffect(() => {
    if (open && initialQuery && !seededRef.current) {
      seededRef.current = true;
      void sendQuery(initialQuery);
    }
    if (!open) {
      seededRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialQuery]);

  async function sendQuery(q: string) {
    if (!q.trim() || !contextId) return;

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: q },
      { role: 'ai', thinking: true },
    ]);

    try {
      const result = await recallApi.query({
        query: q,
        context_id: contextId,
        chat_session_id: sessionId ?? undefined,
      });

      if (!sessionId) setSessionId(result.chat_session_id);

      const sourceLabels = result.source_log_ids
        .map((id) => {
          const l = logs.find((log) => log.id === id);
          return l ? formatDate(fromISODate(l.date_start), 'medium') : null;
        })
        .filter(Boolean) as string[];

      setMessages((prev) => [
        ...prev.slice(0, -1), // drop the thinking placeholder
        { role: 'ai', text: result.answer, sources: sourceLabels },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'ai', text: 'Sorry, something went wrong. Please try again.' },
      ]);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-3 sm:inset-4 z-40 flex flex-col bg-white/96 backdrop-blur border border-gray-100 rounded-card-2xl shadow-float overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-accent-tint flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-accent-active" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-ink">Ask MyLogMate</div>
          <div className="text-[12px] text-ink-3">Asking across {contextLabel}</div>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-ink-2 hover:text-ink transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center text-[13.5px] text-ink-3 py-10">
            Ask anything about your logs…
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} />
        ))}
      </div>

      {/* Composer */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && draft.trim()) {
                void sendQuery(draft.trim());
                setDraft('');
              }
            }}
            placeholder="Ask a follow-up…"
            autoFocus
            className="flex-1 min-w-0 bg-transparent text-[14px] text-ink placeholder:text-ink-3 outline-none px-1"
          />
          <button
            type="button"
            aria-label="Send"
            disabled={!draft.trim()}
            onClick={() => {
              if (draft.trim()) {
                void sendQuery(draft.trim());
                setDraft('');
              }
            }}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
              draft.trim()
                ? 'bg-accent text-white cursor-pointer hover:bg-accent-hover'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            )}
          >
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Chat Message ──────────────────────────────────────────────────────────

function ChatMessage({ message }: { message: ChatMsg }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-[#1A1A1A] text-white rounded-[18px_18px_4px_18px] px-4 py-3 text-[14px] leading-[1.5]">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-full bg-accent-tint flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles size={13} className="text-accent-active" />
      </div>
      <div className="max-w-[75%]">
        {message.thinking ? (
          <div className="inline-flex items-center gap-2 bg-gray-100 rounded-[18px] px-4 py-3 text-[13px] text-ink-2">
            <ThinkingDots />
            <span>Reading your logs…</span>
          </div>
        ) : (
          <>
            <div className="bg-gray-100 rounded-[18px_18px_18px_4px] px-4 py-3.5 text-[14px] leading-[1.55] text-ink whitespace-pre-wrap text-pretty">
              {message.text}
            </div>
            {message.sources && message.sources.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {message.sources.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-accent-active bg-accent-tint border border-accent/20 rounded-full px-2.5 py-1"
                  >
                    <ExternalLink size={10} />
                    {s}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Thinking Dots ─────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-accent-active"
          style={{ animation: `thinking-dot 1.1s ease-in-out ${i * 0.18}s infinite` }}
        />
      ))}
    </span>
  );
}
