const EmptyState = ({ icon: Icon, title, description }) => (
  <div
    className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center"
    style={{
      borderColor: "var(--border-subtle)",
      backgroundColor: "var(--bg-surface-2)",
    }}
  >
    {Icon && (
      <div className="grad-ring flex h-12 w-12 items-center justify-center rounded-xl opacity-80">
        <Icon className="text-xl text-white" />
      </div>
    )}
    <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
    {description && (
      <p className="max-w-sm text-sm" style={{ color: "var(--text-muted)" }}>{description}</p>
    )}
  </div>
);

export default EmptyState;
