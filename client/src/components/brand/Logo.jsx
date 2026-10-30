import { useId } from 'react';

// Marca do FinView: "olho" (visão/clareza) + linha de alta (crescimento).
// - tone color/mono: tile com gradiente (versão aplicativo)
// - tone white/black: símbolo monocromático (fundo escuro / claro)

const EYE_TOP = 'M17 34 Q32 15 47 34';
const EYE_BOT = 'M17 34 Q32 53 47 34';
const LINE = 'M25 40.5 L31.5 35.5 L39 29.5';

export function Mark({ size = 36, tone = 'color', className = '', title = undefined }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gid = `finview-g-${uid}`;
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': 'true' };

  if (tone === 'color' || tone === 'mono') {
    const [from, to] = tone === 'mono' ? ['#64748B', '#475569'] : ['#3B82F6', '#1D4ED8'];
    const lineColor = tone === 'mono' ? '#E2E8F0' : '#34D399';
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className={className} {...a11y}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="16" fill={`url(#${gid})`} />
        <path d={EYE_TOP} fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d={EYE_BOT} fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d={LINE} fill="none" stroke={lineColor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const stroke = tone === 'black' ? '#0F172A' : '#ffffff';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} {...a11y}>
      <g transform="translate(0,-2)">
        <path d={EYE_TOP} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d={EYE_BOT} fill="none" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
        <path d={LINE} fill="none" stroke={stroke} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

export default function Logo({ variant = 'horizontal', tone = 'color', size = 32, className = '' }) {
  const wordColor = tone === 'white' ? '#ffffff' : '#0F172A';

  if (variant === 'mark') {
    return <Mark size={size} tone={tone} className={className} title="FinView" />;
  }

  const markSize = variant === 'vertical' ? Math.round(size * 0.92) : size;
  const wordSize = variant === 'vertical' ? Math.round(size * 0.34) : Math.round(size * 0.92);

  const word = (
    <span
      className="whitespace-nowrap font-bold tracking-tight"
      style={{ fontSize: wordSize, lineHeight: 1, color: wordColor }}
    >
      FinView
    </span>
  );

  return (
    <span
      className={`inline-flex items-center ${
        variant === 'vertical' ? 'flex-col gap-2' : 'gap-2.5'
      } ${className}`}
    >
      <Mark size={markSize} tone={tone} />
      {word}
    </span>
  );
}
