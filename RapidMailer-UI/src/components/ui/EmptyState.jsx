const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
    {Icon && (
      <div className="grad-ring flex h-12 w-12 items-center justify-center rounded-xl opacity-80">
        <Icon className="text-xl text-white" />
      </div>
    )}
    <p className="font-semibold text-slate-200">{title}</p>
    {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
  </div>
);

export default EmptyState;
