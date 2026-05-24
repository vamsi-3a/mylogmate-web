import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { authApi } from '@/api/auth';
import { PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// ── Reset Password Page ───────────────────────────────────────────────────

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!password || password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    if (!confirmPassword)
      errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)
      errs.confirmPassword = "Passwords don't match";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!token) {
      setServerError('Invalid or expired reset link. Please request a new one.');
      return;
    }
    setIsLoading(true);
    setServerError('');
    try {
      await authApi.resetPassword({ token, new_password: password });
      setDone(true);
    } catch {
      setServerError('This link has expired or is invalid. Please request a new reset link.');
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return <ResetDone onLogin={() => navigate('/login', { replace: true })} />;
  }

  // No token in URL → bad link
  if (!token) {
    return (
      <div className="w-full max-w-[440px]">
        <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-2xl px-9 py-10 shadow-card-xl text-center">
          <p className="text-[14px] text-ink-2 mb-6">
            This reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password">
            <Button size="lg" className="w-full">Request new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* Card */}
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-2xl px-9 py-10 shadow-card-xl">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-ink dark:text-white tracking-heading mb-2">
            Set new password
          </h1>
          <p className="text-[14px] text-ink-2 leading-snug text-pretty">
            Choose a strong password — at least 8 characters.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {serverError && (
            <div className="rounded-xl bg-red-50 dark:bg-[rgba(196,95,95,0.1)] border border-red-100 dark:border-[rgba(196,95,95,0.2)] px-4 py-3 text-[13.5px] text-red-600 dark:text-red-400">
              {serverError}
            </div>
          )}

          <PasswordInput
            id="password"
            label="New password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
            }}
            error={fieldErrors.password}
          />

          <PasswordInput
            id="confirmPassword"
            label="Confirm password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword)
                setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
            }}
            error={fieldErrors.confirmPassword}
          />

          <div className="mt-2">
            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Resetting…' : 'Reset password'}
            </Button>
          </div>
        </form>
      </div>

      {/* Back link */}
      <div className="mt-5 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink dark:text-white underline decoration-accent-light decoration-2 underline-offset-[3px] hover:decoration-accent transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Log in
        </Link>
      </div>
    </div>
  );
}

// ── Success State ─────────────────────────────────────────────────────────

function ResetDone({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="w-full max-w-[440px]">
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-2xl px-9 py-10 shadow-card-xl">
        <div className="flex flex-col items-center text-center gap-3 py-2">
          {/* Green check circle */}
          <div className="w-14 h-14 rounded-full bg-[#EFF7F1] dark:bg-[rgba(63,150,99,0.12)] border border-[rgba(107,191,138,0.25)] flex items-center justify-center mb-1">
            <Check size={26} className="text-[#3F9663]" strokeWidth={2.5} />
          </div>

          <h2 className="text-[19px] font-bold text-ink dark:text-white tracking-heading">
            Password updated!
          </h2>

          <p className="text-[14px] text-ink-2 leading-relaxed text-pretty max-w-xs">
            Your password has been reset. Log in with your new credentials.
          </p>

          <div className="mt-3.5 w-full">
            <Button size="lg" onClick={onLogin} className="w-full">
              Go to Log in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
