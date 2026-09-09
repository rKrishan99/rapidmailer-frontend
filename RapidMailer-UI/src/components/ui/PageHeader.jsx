const PageHeader = ({ eyebrow, title, description, actions }) => (
  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
    <div className="flex flex-col gap-2">
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/80">
          {eyebrow}
        </span>
      )}
      <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
      {description && (
        <p className="max-w-2xl text-sm text-slate-400">{description}</p>
      )}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);

export default PageHeader;
