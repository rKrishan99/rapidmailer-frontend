export const Input = ({ label, className = "", ...props }) => (
  <label className="flex flex-col gap-1.5">
    {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
    <input
      className={`rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-violet-400/60 focus:bg-white/[0.08] ${className}`}
      {...props}
    />
  </label>
);

export const Textarea = ({ label, className = "", ...props }) => (
  <label className="flex flex-col gap-1.5">
    {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
    <textarea
      className={`rounded-xl bg-white/[0.05] border border-white/10 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-violet-400/60 focus:bg-white/[0.08] resize-y ${className}`}
      {...props}
    />
  </label>
);
