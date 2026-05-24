interface AvatarProps {
  username: string;
  size?: number;
  className?: string;
}

const COLORS = [
  { bg: '#EEF4FF', text: '#5C95E0' },
  { bg: '#EFF5EE', text: '#3F6B4A' },
  { bg: '#FAF7F0', text: '#9C7A3C' },
  { bg: '#F3EEFF', text: '#7B5EA7' },
  { bg: '#FFF0F0', text: '#C45F5F' },
];

function colorForName(name: string): (typeof COLORS)[number] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

/** Initials avatar — consistent color per username */
export function Avatar({ username, size = 32, className }: AvatarProps) {
  const initials = username
    .split(/[\s_-]/)
    .map((p) => p[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const color = colorForName(username);
  const fontSize = Math.round(size * 0.42);

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color.bg,
        color: color.text,
        fontSize,
        fontWeight: 700,
        flexShrink: 0,
        border: `1px solid ${color.text}22`,
        letterSpacing: '-0.01em',
        fontFamily: 'inherit',
      }}
    >
      {initials || '?'}
    </span>
  );
}
