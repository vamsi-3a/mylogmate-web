import { type InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export function Input({
  id,
  label,
  error,
  hint,
  className,
  containerClassName,
  ...props
}: InputProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-ink dark:text-white">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={cn(
          'h-[46px] w-full rounded-xl border bg-white dark:bg-surface-4 px-4',
          'text-[14px] text-ink dark:text-white placeholder:text-ink-3',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent/25 focus:border-accent',
          error
            ? 'border-red-400 focus:border-red-400 focus:ring-red-200/40'
            : 'border-gray-200 dark:border-[#2A2A2A]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-[12.5px] text-red-500 font-medium">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-[12.5px] text-ink-3">
          {hint}
        </p>
      )}
    </div>
  );
}

interface PasswordInputProps extends Omit<InputProps, 'type'> {}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={show ? 'text' : 'password'}
        className={cn('pr-12', className)}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className={cn(
          'absolute right-3 top-1/2 -translate-y-1/2',
          props.label ? 'translate-y-[calc(-50%+12px)]' : '',
          'text-ink-3 hover:text-ink-2 transition-colors p-1',
        )}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
