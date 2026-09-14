// Toggle — unchecked track uses design token so it reads correctly in light themes.
const Toggle = ({ checked, onChange, label, description }) => (
  <label className="flex cursor-pointer items-start justify-between gap-4">
    <span className="flex flex-col gap-0.5">
      {label && (
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {label}
        </span>
      )}
      {description && (
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {description}
        </span>
      )}
    </span>
    <span
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${checked ? "grad-bg" : ""}`}
      style={!checked ? { backgroundColor: "var(--border-subtle)" } : {}}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </span>
  </label>
);

export default Toggle;
