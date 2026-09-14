import { forwardRef } from "react";

export const Input = forwardRef(function Input({ label, className = "", ...props }, ref) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
      )}
      <input
        ref={ref}
        className={`rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${className}`}
        style={{
          backgroundColor: "var(--bg-surface-2)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)",
        }}
        onFocus={e => { e.target.style.borderColor = "var(--accent-primary)"; e.target.style.backgroundColor = "var(--bg-surface)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--border-subtle)"; e.target.style.backgroundColor = "var(--bg-surface-2)"; }}
        {...props}
      />
    </label>
  );
});

export const Textarea = forwardRef(function Textarea({ label, className = "", ...props }, ref) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
      )}
      <textarea
        ref={ref}
        className={`rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-y ${className}`}
        style={{
          backgroundColor: "var(--bg-surface-2)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)",
        }}
        onFocus={e => { e.target.style.borderColor = "var(--accent-primary)"; e.target.style.backgroundColor = "var(--bg-surface)"; }}
        onBlur={e => { e.target.style.borderColor = "var(--border-subtle)"; e.target.style.backgroundColor = "var(--bg-surface-2)"; }}
        {...props}
      />
    </label>
  );
});
