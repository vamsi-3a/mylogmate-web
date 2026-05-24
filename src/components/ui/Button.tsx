import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-0 ' +
  'disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent hover:bg-accent-hover active:scale-[0.98] text-white rounded-full ' +
    'shadow-button-primary',
  secondary:
    'bg-transparent border border-gray-200 dark:border-[#2A2A2A] text-ink dark:text-white ' +
    'hover:bg-gray-50 dark:hover:bg-surface-3 active:scale-[0.98] rounded-xl',
  ghost:
    'bg-transparent text-ink-2 hover:bg-gray-100 dark:hover:bg-surface-3 ' +
    'active:scale-[0.98] rounded-xl',
  destructive:
    'bg-red-500 hover:bg-red-600 active:scale-[0.98] text-white rounded-full',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-4 text-[13px]',
  md: 'h-10 px-5 text-[13.5px]',
  lg: 'h-12 px-6 text-[14.5px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? (
        <Spinner size={16} />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}
