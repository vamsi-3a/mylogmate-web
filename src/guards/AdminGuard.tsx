import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/Spinner';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0F0F0F]">
        <Spinner size={28} className="text-accent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.is_admin) {
    return <AdminUnauthorized />;
  }

  return <>{children}</>;
}

function AdminUnauthorized() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0F0F0F] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-surface-2 border border-gray-200 dark:border-[#2A2A2A] rounded-card-2xl p-10 text-center shadow-card-xl">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-[rgba(196,95,95,0.1)] border border-red-100 dark:border-[rgba(196,95,95,0.2)] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={26} className="text-red-500" />
        </div>
        <h1 className="text-[22px] font-bold text-ink dark:text-white tracking-heading mb-2">
          Admin area — restricted
        </h1>
        <p className="text-[14px] text-ink-2 leading-relaxed mb-6">
          You don't have access to this page.
        </p>
        <Button onClick={() => (window.location.href = '/home')}>
          Back to MyLogMate
        </Button>
      </div>
    </div>
  );
}
