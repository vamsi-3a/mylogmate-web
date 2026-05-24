import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Pencil,
  Search,
  Users,
  Folder,
  Hash,
  LayoutTemplate,
  MessageSquare,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  Sparkles,
  X,
  ArrowUp,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { feedbackApi } from '@/api/feedback';
import { Logo } from './ui/Logo';
import { Avatar } from './ui/Avatar';
import { useToast } from './ui/Toast';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Pencil;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/log', label: 'Log', icon: Pencil },
  { to: '/recall', label: 'Recall', icon: Search },
  { to: '/teammates', label: 'Teammates', icon: Users },
  { to: '/projects', label: 'Projects', icon: Folder },
  { to: '/tags', label: 'Tags', icon: Hash },
  { to: '/templates', label: 'Templates', icon: LayoutTemplate },
  { to: '/chat-history', label: 'Chat History', icon: MessageSquare },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <aside
        className={cn(
          'relative flex flex-col h-full bg-white dark:bg-surface-1',
          'border-r border-gray-200 dark:border-[#2A2A2A]',
          'transition-all duration-200 shrink-0',
          collapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {/* Logo area */}
        <div
          className={cn(
            'flex items-center px-4 py-5 border-b border-gray-100 dark:border-[#2A2A2A]',
            collapsed ? 'justify-center' : 'justify-between',
          )}
        >
          {collapsed ? (
            <div className="w-8 h-8 rounded-lg bg-accent-tint flex items-center justify-center">
              <Sparkles size={16} className="text-accent-active" />
            </div>
          ) : (
            <Logo size={22} />
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 overflow-y-auto" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <SidebarItem
              key={to}
              to={to}
              label={label}
              icon={Icon}
              collapsed={collapsed}
            />
          ))}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-gray-100 dark:border-[#2A2A2A] py-2">
          {/* Feedback */}
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl',
              'text-[13.5px] font-medium text-ink-2 dark:text-[#A3A3A3]',
              'hover:bg-gray-50 dark:hover:bg-surface-3 hover:text-ink dark:hover:text-white',
              'transition-colors duration-150',
              collapsed ? 'justify-center' : '',
            )}
            title={collapsed ? 'Feedback' : undefined}
          >
            <MessageSquarePlus size={18} strokeWidth={1.75} />
            {!collapsed && <span>Feedback</span>}
          </button>

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl',
                'text-[13.5px] font-medium transition-colors duration-150',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-accent-tint text-accent-active'
                  : 'text-ink-2 dark:text-[#A3A3A3] hover:bg-gray-50 dark:hover:bg-surface-3 hover:text-ink dark:hover:text-white',
              )
            }
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings size={18} strokeWidth={1.75} />
            {!collapsed && <span>Settings</span>}
          </NavLink>

          {/* Profile + Logout */}
          {!collapsed && user && (
            <div className="flex items-center gap-2 px-3 py-2 mx-1 mt-1">
              <Avatar username={user.username} size={28} />
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-ink dark:text-white truncate">
                  {user.username}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Log out"
                className="text-ink-3 hover:text-red-500 transition-colors p-1 rounded"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}

          {collapsed && (
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              className="w-full flex items-center justify-center px-3 py-2.5 mx-1 rounded-xl text-ink-3 hover:text-red-500 hover:bg-red-50 dark:hover:bg-[rgba(196,95,95,0.1)] transition-colors"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>

        {/* Collapse toggle handle */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'absolute -right-3 top-[72px]',
            'w-6 h-6 rounded-full',
            'bg-white dark:bg-surface-2 border border-gray-200 dark:border-[#2A2A2A]',
            'flex items-center justify-center',
            'text-ink-3 hover:text-ink transition-colors shadow-sm z-10',
          )}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Feedback modal */}
      {feedbackOpen && (
        <FeedbackModal
          onClose={() => setFeedbackOpen(false)}
          onSent={() => {
            setFeedbackOpen(false);
            toast('Thanks for your feedback!');
          }}
        />
      )}
    </>
  );
}

// ── SidebarItem ────────────────────────────────────────────────────────────

function SidebarItem({
  to,
  label,
  icon: Icon,
  collapsed,
}: {
  to: string;
  label: string;
  icon: typeof Pencil;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 px-3 py-2.5 mx-1 rounded-xl',
          'text-[13.5px] font-medium transition-colors duration-150',
          collapsed ? 'justify-center' : '',
          isActive
            ? 'bg-accent-tint text-accent-active'
            : 'text-ink-2 dark:text-[#A3A3A3] hover:bg-gray-50 dark:hover:bg-surface-3 hover:text-ink dark:hover:text-white',
        )
      }
      title={collapsed ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {/* Active indicator dot */}
          {isActive && !collapsed && (
            <span className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-accent-active" />
          )}
          <Icon size={18} strokeWidth={1.75} />
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );
}

// ── FeedbackModal ──────────────────────────────────────────────────────────

function FeedbackModal({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    try {
      await feedbackApi.submit({ content: trimmed });
      onSent();
    } catch {
      // Still dismiss — don't block the user on API errors
      onSent();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(20,30,50,0.32)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          'relative z-10 w-full sm:max-w-md',
          'bg-white dark:bg-surface-2',
          'border-t sm:border border-gray-200 dark:border-[#2A2A2A]',
          'rounded-t-[20px] sm:rounded-card-xl',
          'shadow-card-xl',
        )}
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden flex justify-center pt-2">
          <span className="w-10 h-1 rounded-full bg-gray-200 dark:bg-[#2A2A2A]" />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-accent-tint flex items-center justify-center">
                <MessageSquarePlus size={16} className="text-accent-active" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-ink dark:text-white">Send feedback</p>
                <p className="text-[12px] text-ink-3">We read everything.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-surface-3 flex items-center justify-center text-ink-2"
            >
              <X size={14} />
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind? Bug, idea, or just a thought…"
            rows={4}
            autoFocus
            className={cn(
              'w-full rounded-xl border border-gray-200 dark:border-[#2A2A2A]',
              'bg-white dark:bg-surface-4 px-4 py-3',
              'text-[14px] text-ink dark:text-white placeholder:text-ink-3',
              'resize-none focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent',
              'transition-all duration-200',
            )}
          />

          <div className="flex justify-end mt-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() || loading}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                'text-white transition-all duration-200',
                text.trim() && !loading
                  ? 'bg-accent hover:bg-accent-hover shadow-button-primary'
                  : 'bg-gray-200 dark:bg-surface-3 cursor-not-allowed',
              )}
            >
              <ArrowUp size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
