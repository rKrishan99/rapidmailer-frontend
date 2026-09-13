import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { RiArrowDownSLine, RiCheckLine, RiWifiLine } from "react-icons/ri";
import { useWhatsApp } from "../context/WhatsAppContext";
import Button from "./ui/Button";

/**
 * Shared "which connected WhatsApp account should this run use" picker.
 * Uses createPortal so the dropdown is rendered into document.body —
 * immune to parent overflow:hidden, CSS transforms, z-index stacking issues.
 */
const WhatsAppAccountSelect = ({ value, onChange }) => {
  const { accounts } = useWhatsApp();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [dropRect, setDropRect] = useState(null);
  const buttonRef = useRef(null);

  const handleToggle = () => {
    if (buttonRef.current) {
      setDropRect(buttonRef.current.getBoundingClientRect());
    }
    setOpen((prev) => !prev);
  };

  const close = () => setOpen(false);

  if (accounts.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
        <span>No WhatsApp accounts connected yet.</span>
        <Button variant="secondary" onClick={() => navigate("/whatsapp-connect")}>
          Connect WhatsApp
        </Button>
      </div>
    );
  }

  const selected = accounts.find((a) => a.id === value);

  const pick = (id) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-300">Send from account</span>

      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm transition-colors outline-none ${
          open
            ? "border-violet-400/60 bg-white/[0.07]"
            : "border-white/10 bg-white/[0.05] hover:bg-white/[0.07]"
        }`}
      >
        <span className={selected ? "text-slate-100" : "text-slate-500"}>
          {selected
            ? `${selected.label || selected.phoneNumberId}${selected.connected ? "" : " (not verified)"}`
            : "— choose an account —"}
        </span>
        <RiArrowDownSLine
          className={`shrink-0 text-lg text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && dropRect &&
        createPortal(
          <DropdownPanel
            rect={dropRect}
            value={value}
            accounts={accounts}
            onPick={pick}
            onClose={close}
            buttonRef={buttonRef}
          />,
          document.body
        )}
    </div>
  );
};

function DropdownPanel({ rect, value, accounts, onPick, onClose, buttonRef }) {
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

  return (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      }}
      className="overflow-hidden rounded-xl border border-white/10 bg-[#13151f] shadow-2xl shadow-black/80"
    >
      <button
        type="button"
        onClick={() => onPick("")}
        className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.06] ${
          !value ? "text-violet-300" : "text-slate-500"
        }`}
      >
        {!value ? <RiCheckLine className="shrink-0 text-violet-400" /> : <span className="w-4 shrink-0" />}
        — choose an account —
      </button>

      <div className="border-t border-white/[0.07]" />

      {accounts.map((a) => {
        const isSelected = a.id === value;
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => onPick(a.id)}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-white/[0.06] ${
              isSelected ? "bg-violet-500/10 text-violet-200" : "text-slate-200"
            }`}
          >
            {isSelected ? (
              <RiCheckLine className="shrink-0 text-violet-400" />
            ) : (
              <span className="w-4 shrink-0" />
            )}
            <RiWifiLine className={`shrink-0 ${a.connected ? "text-emerald-400" : "text-slate-600"}`} />
            <span className="truncate">
              {a.label || a.phoneNumberId}
              {!a.connected && <span className="ml-2 text-xs text-slate-500">(not verified)</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default WhatsAppAccountSelect;
