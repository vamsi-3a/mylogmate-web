import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton, OrDivider } from './Login';

// ── Signup Page ───────────────────────────────────────────────────────────

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isLoading, error, clearError, user } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/home', { replace: true });
  }, [user, navigate]);

  // Clear store error when user edits any field
  useEffect(() => {
    if (error) clearError();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, email, password]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!username.trim() || username.trim().length < 3)
      errs.username = 'Username must be at least 3 characters';
    if (!email.trim() || !/.+@.+\..+/.test(email.trim()))
      errs.email = "That doesn't look like a valid email";
    if (!password || password.length < 8)
      errs.password = 'Password must be at least 8 characters';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const ok = await signup({
      username: username.trim(),
      email: email.trim(),
      password,
    });
    if (ok) navigate('/home', { replace: true });
  }

  return (
    <div className="w-full max-w-[440px]">
      {/* Card */}
      <div className="bg-white dark:bg-surface-2 border border-gray-100 dark:border-[#2A2A2A] rounded-card-2xl px-9 py-10 shadow-card-xl">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-ink dark:text-white tracking-heading mb-2">
            Create your account
          </h1>
          <p className="text-[14px] text-ink-2 leading-snug text-pretty">
            Free, private, no tracking. Start logging in seconds.
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
            placeholder="Pick a username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
          />

          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <PasswordInput
            id="password"
            label="Password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <div className="mt-2">
            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Creating account…' : 'Sign Up'}
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
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-ink dark:text-white underline decoration-accent-light decoration-2 underline-offset-[3px] hover:decoration-accent transition-colors"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
