import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TagChipProps {
  label: string;
  onRemove?: () => void;
  small?: boolean;
  className?: string;
}

export function TagChip({ label, onRemove, small = false, className }: TagChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'bg-accent-tint text-accent-active border border-accent/25',
        'rounded-full font-medium',
        small ? 'text-[12px] px-2.5 py-0.5' : 'text-[12.5px] pl-2.5 py-1',
        !small && onRemove ? 'pr-1' : !small ? 'pr-2.5' : '',
        className,
      )}
    >
      <span>#{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove tag ${label}`}
          className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-accent/20 transition-colors text-accent-active"
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
