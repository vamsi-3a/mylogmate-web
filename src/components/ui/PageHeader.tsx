interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="text-[12.5px] font-semibold text-ink-3 uppercase tracking-[0.06em] mb-2">
          {eyebrow}
        </p>
      )}
      <h1 className="text-[28px] sm:text-[32px] font-bold text-ink dark:text-white tracking-heading leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-[14px] text-ink-2 leading-relaxed text-pretty max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
