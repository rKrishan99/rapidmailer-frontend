import { useState } from "react";
import { RiCheckboxCircleFill, RiCloseCircleLine, RiEditLine, RiCloseLine } from "react-icons/ri";
import Badge from "./Badge";
import Button from "./Button";

// Masked credential field: shows a "configured" badge until the user
// explicitly chooses to change it, so secrets never round-trip to the UI.
const SecretField = ({ label, configured, editing, value, placeholder, onStartEdit, onCancelEdit, onChange, onClear }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <Badge tone={configured ? "good" : "neutral"}>
        {configured ? (
          <span className="flex items-center gap-1">
            <RiCheckboxCircleFill /> Configured
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <RiCloseCircleLine /> Not set
          </span>
        )}
      </Badge>
    </div>

    {editing ? (
      <div className="flex gap-2">
        <input
          type="password"
          autoComplete="new-password"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-violet-400/60 focus:bg-white/[0.08]"
        />
        <button
          type="button"
          onClick={onClear}
          title="Clear"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 cursor-pointer"
        >
          <RiCloseLine />
        </button>
        {configured && (
          <Button type="button" variant="secondary" onClick={onCancelEdit} className="shrink-0">
            Cancel
          </Button>
        )}
      </div>
    ) : (
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-slate-500">
          {configured ? "••••••••••••" : "Not configured"}
        </div>
        <Button type="button" variant="secondary" onClick={onStartEdit} className="shrink-0">
          <RiEditLine />
          {configured ? "Change" : "Add"}
        </Button>
      </div>
    )}
  </div>
);

export default SecretField;
