import { type ReactNode, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/utils/cn';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-white dark:bg-[#0F0F0F] overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0 h-full">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 min-w-0 overflow-y-auto',
          'px-6 sm:px-10 lg:px-12',
        )}
      >
        {children}
      </main>
    </div>
  );
}
