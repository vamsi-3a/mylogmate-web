import { type LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-gray-50 dark:bg-surface-2 border border-gray-200 dark:border-[#2A2A2A] rounded-card-xl p-14 flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-[18px] bg-white dark:bg-surface-3 border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-center mb-1.5">
        <Icon size={24} className="text-accent" />
      </div>
      <h3 className="text-[18px] font-bold text-ink dark:text-white tracking-tight">{title}</h3>
      <p className="text-[14px] text-ink-2 max-w-sm text-pretty leading-relaxed">{description}</p>
      {action && (
        <div className="mt-4">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
