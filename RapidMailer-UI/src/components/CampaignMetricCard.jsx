// src/components/CampaignMetricCard.jsx
// Small presentational card used in the Campaign Delivery Report.
// Shows an icon, a label, and a highlighted number.

const TONES = {
  default: {
    ring:  "ring-white/[0.08]",
    icon:  "bg-white/[0.06] text-slate-300",
    value: "text-white",
  },
  green: {
    ring:  "ring-emerald-500/20",
    icon:  "bg-emerald-500/10 text-emerald-400",
    value: "text-emerald-300",
  },
  red: {
    ring:  "ring-rose-500/20",
    icon:  "bg-rose-500/10 text-rose-400",
    value: "text-rose-300",
  },
  amber: {
    ring:  "ring-amber-500/20",
    icon:  "bg-amber-500/10 text-amber-400",
    value: "text-amber-300",
  },
  violet: {
    ring:  "ring-violet-500/20",
    icon:  "bg-violet-500/10 text-violet-400",
    value: "text-violet-300",
  },
};

/**
 * @param {{ icon: React.ElementType, label: string, value: number|string, tone?: keyof TONES }} props
 */
const CampaignMetricCard = ({ icon: Icon, label, value, tone = "default" }) => {
  const t = TONES[tone] ?? TONES.default;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl bg-white/[0.03] p-5 ring-1 ${t.ring}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.icon}`}>
        <Icon className="text-xl" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <span className={`text-3xl font-bold tabular-nums ${t.value}`}>
          {value ?? "—"}
        </span>
      </div>
    </div>
  );
};

export default CampaignMetricCard;
