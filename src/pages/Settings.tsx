import { useState } from 'react';
import { User, Lock, LogOut, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { useToast } from '@/components/ui/Toast';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

// ── Settings Page ─────────────────────────────────────────────────────────

export default function Settings() {
  const { user, logout } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-16 space-y-8">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Manage your profile and security."
      />

      {/* Profile section */}
      <SettingsSection icon={<User size={16} />} title="Profile">
        <ProfileForm user={user} />
      </SettingsSection>

      {/* Password section — only for local auth */}
      {user?.auth_provider === 'local' && (
        <SettingsSection icon={<Lock size={16} />} title="Password">
          <PasswordForm />
        </SettingsSection>
      )}

      {/* Sign out */}
      <SettingsSection icon={<LogOut size={16} />} title="Account">
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-[14px] font-semibold text-ink dark:text-white">Sign out</p>
            <p className="text-[12.5px] text-ink-3 mt-0.5">
              Signed in as <span className="font-medium text-ink-2">@{user?.username}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={<LogOut size={14} />}
            onClick={() => logout()}
            className="text-red-500 hover:bg-red-50 dark:hover:bg-[rgba(196,95,95,0.08)]"
          >
            Sign out
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────

function SettingsSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-surface-2 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 dark:border-[#2A2A2A]">
        <span className="text-ink-2">{icon}</span>
        <h2 className="text-[14px] font-bold text-ink dark:text-white">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  );
}

// ── Profile Form ──────────────────────────────────────────────────────────

function ProfileForm({
  user,
}: {
  user: { username: string; email: string | null; auth_provider: string } | null;
}) {
  const { toast } = useToast();
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = email !== (user?.email ?? '');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!isDirty || saving) return;
    setSaving(true);
    try {
      await authApi.updateProfile({ email: email.trim() || undefined });
      setSaved(true);
      toast('Profile updated.', 'success');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {/* Username (read-only) */}
      <div className="space-y-1.5">
        <label className="block text-[12.5px] font-semibold text-ink-2 uppercase tracking-wider">
          Username
        </label>
        <div className="flex items-center gap-2.5 h-10 px-3.5 rounded-xl bg-gray-50 dark:bg-surface-3 border border-gray-100 dark:border-[#2A2A2A]">
          <span className="text-ink-3">@</span>
          <span className="text-[14px] font-medium text-ink-2">{user?.username}</span>
          <span className="ml-auto text-[11.5px] text-ink-3 bg-gray-100 dark:bg-surface-2 px-2 py-0.5 rounded-full">
            Read-only
          </span>
        </div>
        <p className="text-[11.5px] text-ink-3">Username cannot be changed.</p>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="settings-email"
          className="block text-[12.5px] font-semibold text-ink-2 uppercase tracking-wider"
        >
          Email
        </label>
        <input
          id="settings-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={cn(
            'w-full h-10 px-3.5 rounded-xl border text-[14px] font-medium',
            'bg-white dark:bg-surface-3 text-ink dark:text-white placeholder:text-ink-3',
            'border-gray-200 dark:border-[#2A2A2A]',
            'focus:outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(126,176,247,0.18)]',
            'transition-all',
          )}
        />
        {user?.auth_provider === 'google' && (
          <p className="text-[11.5px] text-ink-3">Signed in via Google.</p>
        )}
      </div>

      {/* Save */}
      {isDirty && (
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            leadingIcon={saved ? <Check size={14} /> : undefined}
            disabled={saving}
          >
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
          </Button>
        </div>
      )}
    </form>
  );
}

// ── Password Form ─────────────────────────────────────────────────────────

function PasswordForm() {
  const { toast } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);

  const mismatch = confirm.length > 0 && next !== confirm;
  const valid = current.length > 0 && next.length >= 8 && next === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    try {
      await authApi.updatePassword({ current_password: current, new_password: next });
      toast('Password updated.', 'success');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch {
      toast('Current password is incorrect or update failed.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        id="current-password"
        label="Current password"
        value={current}
        onChange={setCurrent}
        placeholder="Enter current password"
        autoComplete="current-password"
      />
      <PasswordField
        id="new-password"
        label="New password"
        value={next}
        onChange={setNext}
        placeholder="Minimum 8 characters"
        autoComplete="new-password"
        hint={next.length > 0 && next.length < 8 ? 'At least 8 characters required' : undefined}
      />
      <PasswordField
        id="confirm-password"
        label="Confirm new password"
        value={confirm}
        onChange={setConfirm}
        placeholder="Repeat new password"
        autoComplete="new-password"
        error={mismatch ? "Passwords don't match" : undefined}
      />

      <div className="flex justify-end pt-1">
        <Button type="submit" variant="primary" size="sm" disabled={!valid || saving}>
          {saving ? 'Updating…' : 'Update password'}
        </Button>
      </div>
    </form>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
}) {
  const hasError = !!error;
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[12.5px] font-semibold text-ink-2 uppercase tracking-wider"
      >
        {label}
      </label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          'w-full h-10 px-3.5 rounded-xl border text-[14px] font-medium',
          'bg-white dark:bg-surface-3 text-ink dark:text-white placeholder:text-ink-3',
          'focus:outline-none transition-all',
          hasError
            ? 'border-red-300 dark:border-red-700 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(196,95,95,0.12)]'
            : 'border-gray-200 dark:border-[#2A2A2A] focus:border-accent focus:shadow-[0_0_0_3px_rgba(126,176,247,0.18)]',
        )}
      />
      {error && <p className="text-[12px] text-red-500">{error}</p>}
      {hint && !error && <p className="text-[12px] text-ink-3">{hint}</p>}
    </div>
  );
}
