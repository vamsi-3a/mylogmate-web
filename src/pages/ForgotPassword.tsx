import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowLeft } from 'lucide-react';
import { authApi } from '@/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// ── Forgot Password Page ──────────────────────────────────────────────────

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function validate(): boolean {
    if (!email.trim() || !/.+@.+\..+/.test(email.trim())) {
      setEmailError("That doesn't look like a valid email");
      return false;
    }
    setEmailError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setServerError('');
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return <ResetSent email={email} />;
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* Card */}
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-2xl px-9 py-10 shadow-card-xl">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-ink dark:text-white tracking-heading mb-2">
            Reset your password
          </h1>
          <p className="text-[14px] text-ink-2 leading-snug text-pretty">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
          {serverError && (
            <div className="rounded-xl bg-red-50 dark:bg-[rgba(196,95,95,0.1)] border border-red-100 dark:border-[rgba(196,95,95,0.2)] px-4 py-3 text-[13.5px] text-red-600 dark:text-red-400">
              {serverError}
            </div>
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError('');
              if (serverError) setServerError('');
            }}
            error={emailError}
          />

          <div className="mt-2">
            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending…' : 'Send reset link'}
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

// ── Reset Sent State ──────────────────────────────────────────────────────

function ResetSent({ email }: { email: string }) {
  return (
    <div className="w-full max-w-[440px]">
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-2xl px-9 py-10 shadow-card-xl">
        <div className="flex flex-col items-center text-center gap-3 py-2">
          {/* Green check circle */}
          <div className="w-14 h-14 rounded-full bg-[#EFF7F1] dark:bg-[rgba(63,150,99,0.12)] border border-[rgba(107,191,138,0.25)] flex items-center justify-center mb-1">
            <Check size={26} className="text-[#3F9663]" strokeWidth={2.5} />
          </div>

          <h2 className="text-[19px] font-bold text-ink dark:text-white tracking-heading">
            Reset link sent!
          </h2>

          <p className="text-[14px] text-ink-2 leading-relaxed text-pretty max-w-xs">
            Check{' '}
            <strong className="font-semibold text-ink dark:text-white">{email}</strong>{' '}
            for instructions to reset your password.
          </p>

          <div className="mt-3.5 w-full">
            <Link to="/login">
              <Button variant="secondary" size="lg" leadingIcon={<ArrowLeft size={14} />} className="w-full">
                Back to Log in
              </Button>
            </Link>
          </div>

          <p className="text-[12.5px] text-ink-3 mt-1">
            Didn't get it? Check your spam folder, or{' '}
            <button
              type="button"
              className="text-accent-active font-medium hover:underline"
              onClick={() => window.location.reload()}
            >
              try again
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
