/** Minimal className merger — avoids adding a full clsx/cn dep */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
