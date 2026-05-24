import { type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type Tint = 'blue' | 'cream' | 'sage';

interface PickerCardProps {
  tint: Tint;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onClick?: () => void;
  big?: boolean;
  className?: string;
}

const tintStyles: Record<Tint, { bg: string; iconBg: string; iconColor: string }> = {
  blue: {
    bg: 'bg-accent-tint dark:bg-[rgba(107,159,255,0.08)]',
    iconBg: 'bg-white dark:bg-surface-3',
    iconColor: 'text-accent',
  },
  cream: {
    bg: 'bg-cream-tint dark:bg-[rgba(201,163,90,0.08)]',
    iconBg: 'bg-white dark:bg-surface-3',
    iconColor: 'text-cream-text',
  },
  sage: {
    bg: 'bg-sage-tint dark:bg-[rgba(107,191,138,0.08)]',
    iconBg: 'bg-white dark:bg-surface-3',
    iconColor: 'text-sage-text',
  },
};

export function PickerCard({
  tint,
  icon: Icon,
  title,
  subtitle,
  onClick,
  big = false,
  className,
}: PickerCardProps) {
  const t = tintStyles[tint];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group text-left w-full rounded-card-xl border-0 cursor-pointer',
        'transition-all duration-200',
        'hover:-translate-y-0.5',
        'hover:shadow-card-lg',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        'shadow-card',
        t.bg,
        big ? 'p-7 min-h-[180px]' : 'p-6',
        className,
      )}
    >
      <div
        className={cn(
          'mb-4 flex items-center justify-center rounded-2xl',
          t.iconBg,
          t.iconColor,
          'border border-black/5 dark:border-white/10',
          big ? 'w-12 h-12' : 'w-10 h-10',
        )}
      >
        <Icon size={big ? 22 : 18} strokeWidth={1.75} />
      </div>
      <h3
        className={cn(
          'font-bold text-ink dark:text-white tracking-tight',
          big ? 'text-[22px]' : 'text-[18px]',
        )}
        style={{ letterSpacing: '-0.018em' }}
      >
        {title}
      </h3>
      <p className="mt-1.5 text-[13.5px] text-ink-2 leading-relaxed text-pretty">{subtitle}</p>
    </button>
  );
}
