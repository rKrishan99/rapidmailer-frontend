// Button — primary stays gradient with white text across all themes, secondary uses tokens so it is legible in light mode.
const VARIANT_CLASSES = {
  primary: "grad-bg text-white shadow-lg shadow-violet-900/20 hover:brightness-110",
  danger: "bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20",
  ghost: "hover:bg-[var(--bg-surface-hover)]",
};

const Button = ({
  as: Component = "button",
  variant = "primary",
  className = "",
  children,
  style = {},
  ...props
}) => {
  const isPrimary = variant === "primary";
  const isSecondary = variant === "secondary";
  const isGhost = variant === "ghost";

  const computedStyle = isPrimary
    ? { color: "#ffffff", ...style }
    : isSecondary
    ? {
        backgroundColor: "var(--bg-surface-2)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-primary)",
        ...style,
      }
    : isGhost
    ? { color: "var(--text-secondary)", ...style }
    : style;

  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant] ?? ""} ${className}`}
      style={computedStyle}
      onMouseEnter={
        isSecondary
          ? (e) => { e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)"; }
          : isGhost
          ? (e) => { e.currentTarget.style.color = "var(--text-primary)"; }
          : undefined
      }
      onMouseLeave={
        isSecondary
          ? (e) => { e.currentTarget.style.backgroundColor = "var(--bg-surface-2)"; }
          : isGhost
          ? (e) => { e.currentTarget.style.color = "var(--text-secondary)"; }
          : undefined
      }
      {...props}
    >
      {children}
    </Component>
  );
};

export default Button;
