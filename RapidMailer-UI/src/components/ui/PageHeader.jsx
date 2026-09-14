// PageHeader — no hardcoded text-white; uses design tokens.
const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <span
          className="text-xs font-semibold uppercase tracking-[0.2em]"
          style={{ color: "var(--accent-primary)", opacity: 0.8 }}
        >
          {eyebrow}
        </span>
      )}
      <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-sm" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

export default PageHeader;
