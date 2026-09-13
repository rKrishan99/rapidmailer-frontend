import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { RiArrowDownSLine, RiCheckLine, RiMailLine } from "react-icons/ri";
import { useEmailAccounts } from "../context/EmailAccountsContext";
import Button from "./ui/Button";

/**
 * Shared "which sender account should this send use" picker.
 * Uses createPortal so the dropdown renders into document.body —
 * immune to parent overflow:hidden, CSS transforms, z-index stacking issues.
 */
const EmailAccountSelect = ({ value, onChange }) => {
  const { accounts } = useEmailAccounts();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [dropRect, setDropRect] = useState(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const handleToggle = () => {
    if (buttonRef.current) {
      setDropRect(buttonRef.current.getBoundingClientRect());
    }
    setOpen((prev) => !prev);
  };

  const close = () => setOpen(false);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (buttonRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (accounts.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
        <span>No sender accounts configured yet.</span>
        <Button variant="secondary" onClick={() => navigate("/email-accounts")}>
          Add Email Account
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
            ? `${selected.label || selected.fromEmail} (${selected.fromEmail})`
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
            panelRef={panelRef}
          />,
          document.body
        )}
    </div>
  );
};

function DropdownPanel({ rect, value, accounts, onPick, onClose, buttonRef, panelRef }) {
  useEffect(() => {
    const handler = (e) => {
      if (buttonRef.current?.contains(e.target)) return;
      if (panelRef.current?.contains(e.target)) return;
      onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [buttonRef, panelRef, onClose]);

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
            <RiMailLine className="shrink-0 text-slate-500" />
            <span className="truncate">
              {a.label || a.fromEmail}
              <span className="ml-1.5 text-xs text-slate-500">({a.fromEmail})</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default EmailAccountSelect;
