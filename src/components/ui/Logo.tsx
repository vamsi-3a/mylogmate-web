interface LogoProps {
  size?: number;
  showWordmark?: boolean;
}

/** MlmLogo — two offset rounded rectangles + wordmark */
export function Logo({ size = 24, showWordmark = true }: LogoProps) {
  const r = size * 0.29; // corner radius
  const offset = size * 0.175;

  return (
    <span className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ display: 'block', flexShrink: 0 }}
      >
        {/* Back rect — lighter */}
        <rect
          x={offset * 24 / size}
          y={offset * 24 / size}
          width={16 * 24 / size}
          height={16 * 24 / size}
          rx={r}
          fill="#93B5FF"
          opacity={0.55}
        />
        {/* Front rect */}
        <rect
          x={0}
          y={0}
          width={16 * 24 / size}
          height={16 * 24 / size}
          rx={r}
          fill="#7EB0F7"
        />
      </svg>
      {showWordmark && (
        <span
          className="font-bold text-ink dark:text-white tracking-tight"
          style={{ fontSize: size * 0.75, letterSpacing: '-0.02em' }}
        >
          MyLogMate
        </span>
      )}
    </span>
  );
}
