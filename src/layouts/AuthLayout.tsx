import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface AuthLayoutProps {
  children: ReactNode;
  showBackToHome?: boolean;
}

export function AuthLayout({ children, showBackToHome = true }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] flex flex-col relative overflow-hidden">
      {/* Faint radial accent wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[600px]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(147,181,255,.18), rgba(147,181,255,0) 70%)',
        }}
      />

      {/* Top bar */}
      <header className="relative px-6 sm:px-12 py-5 sm:py-6 flex items-center justify-between">
        <Link to="/">
          <Logo size={22} />
        </Link>
        {showBackToHome && (
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-[14px] font-medium text-ink-2 hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-12 pb-16 pt-8 relative">
        {children}
      </main>
    </div>
  );
}
