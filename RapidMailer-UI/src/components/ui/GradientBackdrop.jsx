const GradientBackdrop = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--theme-base,#0d1117)] transition-colors duration-300">
    <div className="absolute -top-40 -left-32 h-[32rem] w-[32rem] rounded-full bg-violet-600/15 blur-[120px] dark:opacity-100 opacity-20" />
    <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-[var(--theme-accent,#38bdf8)]/15 blur-[120px] dark:opacity-100 opacity-25" />
    <div className="absolute bottom-0 left-1/4 h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-[120px] dark:opacity-100 opacity-10" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--theme-border-subtle,rgba(255,255,255,0.06))_1px,transparent_0)] bg-[size:28px_28px] opacity-40" />
  </div>
);

export default GradientBackdrop;
