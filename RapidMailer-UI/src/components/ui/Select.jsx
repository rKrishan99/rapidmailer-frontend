import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { RiArrowDownSLine, RiCheckLine } from "react-icons/ri";

/**
 * Universal portal-rendered custom dropdown.
 * All colors driven by CSS design-token variables — works in all 4 themes.
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

  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return { value: opt.value ?? opt.id, label: opt.label ?? opt.name ?? String(opt.value) };
    }
    return { value: opt, label: String(opt) };
  });

  const selected = normalizedOptions.find((o) => o.value === value);

  const updateRect = useCallback(() => {
    if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect());
  }, []);

  const handleToggle = () => { updateRect(); setOpen((p) => !p); };
  const handlePick = (val) => { onChange(val); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const handler = () => updateRect();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => { window.removeEventListener("scroll", handler, true); window.removeEventListener("resize", handler); };
  }, [open, updateRect]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors outline-none cursor-pointer ${buttonClassName}`}
        style={{
          backgroundColor: open ? "var(--bg-surface)" : "var(--bg-surface-2)",
          border: `1px solid ${open ? "var(--accent-primary)" : "var(--border-subtle)"}`,
          color: selected ? "var(--text-primary)" : "var(--text-muted)",
        }}
      >
        <span className="truncate font-medium">{selected ? selected.label : placeholder}</span>
        <RiArrowDownSLine
          className={`shrink-0 text-lg transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-muted)" }}
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
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
      className="max-h-60 overflow-y-auto py-1"
    >
      {options.length === 0 ? (
        <div className="px-4 py-2.5 text-xs italic" style={{ color: "var(--text-muted)" }}>
          No options available
        </div>
      ) : (
        options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPick(opt.value)}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors cursor-pointer"
              style={{
                color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                backgroundColor: isSelected ? "var(--bg-surface-2)" : "transparent",
                fontWeight: isSelected ? 600 : 400,
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {isSelected ? (
                <RiCheckLine className="shrink-0 text-base" style={{ color: "var(--accent-primary)" }} />
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
