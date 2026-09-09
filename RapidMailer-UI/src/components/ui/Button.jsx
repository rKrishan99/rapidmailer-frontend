const VARIANTS = {
  primary:
    "grad-bg text-white shadow-lg shadow-violet-900/30 hover:brightness-110 hover:shadow-violet-700/40",
  secondary:
    "bg-white/[0.06] text-slate-100 border border-white/10 hover:bg-white/[0.1]",
  danger:
    "bg-rose-500/10 text-rose-300 border border-rose-500/30 hover:bg-rose-500/20",
  ghost: "text-slate-300 hover:text-white hover:bg-white/[0.06]",
};

const Button = ({
  as: Component = "button",
  variant = "primary",
  className = "",
  children,
  ...props
}) => (
  <Component
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export default Button;
