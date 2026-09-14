// App shell — uses CSS vars for background; Tailwind utility classes for layout only.
const GradientBackdrop = () => (
  <div
    className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-300"
    style={{ backgroundColor: "var(--bg-app)" }}
  >
    {/* Ambient glow blobs — themed via accent-primary, hidden in studio light mode */}
    <div
      className="absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full blur-[120px] opacity-30"
      style={{ backgroundColor: "var(--accent-glow, rgba(47,129,247,0.25))" }}
    />
    <div
      className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full blur-[120px] opacity-25"
      style={{ backgroundColor: "var(--accent-glow, rgba(47,129,247,0.20))" }}
    />
    <div
      className="absolute bottom-0 left-1/4 h-[26rem] w-[26rem] rounded-full blur-[120px] opacity-15"
      style={{ backgroundColor: "var(--accent-glow, rgba(139,92,246,0.20))" }}
    />
    {/* Dot-grid texture — subtle in both dark and light themes */}
    <div
      className="absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage: "radial-gradient(circle, var(--border-subtle) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  </div>
);

export default GradientBackdrop;
