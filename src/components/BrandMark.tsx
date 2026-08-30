// Monogramme "Cockpit" — un viseur / cockpit stylisé.
export default function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd23f" />
          <stop offset="0.4" stopColor="#ff7a3d" />
          <stop offset="0.7" stopColor="#ff4fa0" />
          <stop offset="1" stopColor="#b14fff" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="13" stroke="url(#bm)" strokeWidth="2" />
      <path
        d="M16 5v6M16 21v6M5 16h6M21 16h6"
        stroke="url(#bm)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3.2" fill="url(#bm)" />
    </svg>
  );
}
