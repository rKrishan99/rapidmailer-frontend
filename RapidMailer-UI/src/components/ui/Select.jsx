import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";

/**
 * Universal portal-rendered custom dropdown for Omini Pulse.
 * Renders into document.body to bypass parent overflow, transforms, and stacking contexts.
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = "— select —",
  className = "",
  buttonClassName = "",
  label,
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const buttonRef = useRef(null);

  // Normalize options to [{ value, label }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return { value: opt.value ?? opt.id, label: opt.label ?? opt.name ?? String(opt.value) };
    }
    return { value: opt, label: String(opt) };
  });

  const selected = normalizedOptions.find((o) => o.value === value);

  const updateRect = useCallback(() => {
    if (buttonRef.current) {
      setRect(buttonRef.current.getBoundingClientRect());
    }
  }, []);

  const handleToggle = () => {
    updateRect();
    setOpen((prev) => !prev);
  };

  const handlePick = (val) => {
    onChange(val);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handleScrollOrResize = () => updateRect();
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open, updateRect]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}

      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors outline-none ${
          open
            ? "border-violet-400/60 bg-white/[0.07]"
            : "border-white/10 bg-white/[0.05] hover:bg-white/[0.07]"
        } ${buttonClassName}`}
      >
        <span className={`truncate ${selected ? "text-slate-100 font-medium" : "text-slate-500"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <RiArrowDownSLine
          className={`shrink-0 text-lg text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && rect &&
        createPortal(
          <SelectPanel
            rect={rect}
            value={value}
            options={normalizedOptions}
            onPick={handlePick}
            onClose={() => setOpen(false)}
            buttonRef={buttonRef}
          />,
          document.body
        )}
    </div>
  );
}

function SelectPanel({ rect, value, options, onPick, onClose, buttonRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (buttonRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [buttonRef, onClose]);

  // Viewport-aware positioning: if space below is less than 240px and space above is larger, flip upward
  const spaceBelow = window.innerHeight - rect.bottom;
  const flipUp = spaceBelow < 220 && rect.top > 220;

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: flipUp ? "auto" : rect.bottom + 4,
        bottom: flipUp ? window.innerHeight - rect.top + 4 : "auto",
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      }}
      className="max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#13151f] shadow-2xl shadow-black/80 py-1"
    >
      {options.length === 0 ? (
        <div className="px-4 py-2.5 text-xs text-slate-500 italic">No options available</div>
      ) : (
        options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPick(opt.value)}
              className={`flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors hover:bg-white/[0.06] ${
                isSelected
                  ? "bg-violet-500/15 text-violet-200 font-medium"
                  : "text-slate-200"
              }`}
            >
              {isSelected ? (
                <RiCheckLine className="shrink-0 text-violet-400 text-base" />
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <span className="truncate">{opt.label}</span>
            </button>
          );
        })
      )}
    </div>
  );
}
