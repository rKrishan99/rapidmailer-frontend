const TONES = {
  good: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/30",
  warn: "bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30",
  bad: "bg-rose-400/10 text-rose-300 ring-1 ring-rose-400/30",
  neutral: "bg-white/[0.06] text-slate-300 ring-1 ring-white/10",
  brand: "bg-violet-400/10 text-violet-300 ring-1 ring-violet-400/30",
};

const Badge = ({ tone = "neutral", className = "", children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${TONES[tone] || TONES.neutral} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
