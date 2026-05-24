import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// ── Login Page ────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, clearError, user } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/home';

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  // Clear store error when user edits fields
  useEffect(() => {
    if (error) clearError();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!username.trim()) errs.username = 'Enter your username';
    if (!password) errs.password = 'Enter your password';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const ok = await login({ username: username.trim(), password });
      if (ok) navigate(from, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* Card */}
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-2xl px-9 py-10 shadow-card-xl">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-ink dark:text-white tracking-heading mb-2">
            Welcome back
          </h1>
          <p className="text-[14px] text-ink-2 leading-snug text-pretty">
            Pick up right where you left off.
          </p>
        </div>

        {/* Google button */}
        <GoogleButton />

        {/* Divider */}
        <OrDivider />

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {/* Server-level error */}
          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-[rgba(196,95,95,0.1)] border border-red-100 dark:border-[rgba(196,95,95,0.2)] px-4 py-3 text-[13.5px] text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Input
            id="username"
            label="Username"
            placeholder="Your username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
          />

          <div>
            <PasswordInput
              id="password"
              label="Password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
            />
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-[13px] font-medium text-accent-hover hover:text-accent-active transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="mt-2">
            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Logging in…' : 'Log in'}
            </Button>
          </div>
        </form>

        {/* Privacy line */}
        <div className="mt-5 pt-[18px] border-t border-gray-100 dark:border-[#2A2A2A] flex items-center justify-center gap-1.5 text-[12.5px] text-ink-3">
          <Check size={13} className="text-sage-accent flex-shrink-0" />
          <span>Your logs stay private. Always.</span>
        </div>
      </div>

      {/* Switch link */}
      <p className="mt-5 text-center text-[14px] text-ink-2">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-semibold text-ink dark:text-white underline decoration-accent-light decoration-2 underline-offset-[3px] hover:decoration-accent transition-colors"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────

export function GoogleButton() {
  return (
    <button
      type="button"
      className="w-full h-12 bg-white dark:bg-surface-3 border border-[#DADCE0] dark:border-[#3A3A3A] rounded-xl flex items-center justify-center gap-3 text-[14.5px] font-semibold text-[#1F1F1F] dark:text-white hover:bg-[#FAFBFC] dark:hover:bg-surface-4 active:bg-[#F6F7F9] transition-colors"
      onClick={() => {
        // TODO: Initiate Google OAuth flow
        alert('Google OAuth — coming soon');
      }}
    >
      <GoogleG />
      <span>Continue with Google</span>
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex items-center gap-2.5 my-[18px] text-ink-3">
      <span className="flex-1 h-px bg-gray-100 dark:bg-[#2A2A2A]" />
      <span className="text-[12px] font-medium tracking-[0.04em] uppercase">or</span>
      <span className="flex-1 h-px bg-gray-100 dark:bg-[#2A2A2A]" />
    </div>
  );
}

function GoogleG() {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden="true" className="block flex-shrink-0">
      <path d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

export { ArrowLeft };
