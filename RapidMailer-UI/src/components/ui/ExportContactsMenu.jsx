// src/components/ui/ExportContactsMenu.jsx
//
// Dropdown button that exports leads as vCard (.vcf) or Google Contacts CSV.
// Drop it anywhere a results set is shown — it's fully self-contained.
//
// Props:
//   rows            array  Lead rows to export
//   filenamePrefix  string Prefix for the downloaded file name (e.g. "maps", "wa_valid")
//   disabled        bool   Whether to disable the button (e.g. when rows.length === 0)

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { RiContactsLine, RiArrowDownSLine, RiFileDownloadLine, RiSmartphoneLine } from "react-icons/ri";
import { exportVcf, exportGoogleContactsCsv } from "../../utils/contactsExport";

const ACTIONS = [
  {
    id: "vcf",
    label: "Export vCard (.vcf)",
    sublabel: "iPhone, Android, macOS Contacts",
    icon: RiSmartphoneLine,
  },
  {
    id: "google",
    label: "Google Contacts CSV",
    sublabel: "Import at contacts.google.com",
    icon: RiFileDownloadLine,
  },
];

export default function ExportContactsMenu({ rows = [], filenamePrefix = "contacts", disabled = false }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const isEmpty = !rows || rows.length === 0;
  const isDisabled = disabled || isEmpty;

  // Position the dropdown portal relative to the trigger button
  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setRect(r);
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        !btnRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleAction = (id) => {
    setOpen(false);
    const prefix = filenamePrefix.replace(/[^a-z0-9_-]/gi, "_");
    if (id === "vcf") {
      exportVcf(rows, `${prefix}_contacts.vcf`);
    } else if (id === "google") {
      exportGoogleContactsCsv(rows, `${prefix}_google_contacts.csv`);
    }
  };

  // Compute dropdown position — flip up if near viewport bottom
  const dropdownStyle = rect
    ? (() => {
        const spaceBelow = window.innerHeight - rect.bottom;
        const dropH = 120; // approx height of 2-item menu
        const top =
          spaceBelow >= dropH ? rect.bottom + 4 : rect.top - dropH - 4;
        const left = rect.right - 260; // right-align to button
        return { top, left: Math.max(8, left) };
      })()
    : {};

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={isDisabled}
        onClick={() => !isDisabled && setOpen((v) => !v)}
        title={isEmpty ? "No leads to export" : "Sync to phone contacts"}
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors
          ${isDisabled
            ? "cursor-not-allowed border-white/5 text-slate-600"
            : "cursor-pointer border-violet-500/40 bg-violet-500/10 text-violet-300 hover:border-violet-400/60 hover:bg-violet-500/20 hover:text-violet-200"
          }`}
      >
        <RiContactsLine className="text-base" />
        Sync to Contacts
        <RiArrowDownSLine
          className={`ml-0.5 text-base transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        rect &&
        createPortal(
          <div
            ref={menuRef}
            style={{ position: "fixed", ...dropdownStyle, zIndex: 9999, width: 260 }}
            className="overflow-hidden rounded-xl border border-white/10 bg-[#13151f] shadow-2xl shadow-black/50"
          >
            <div className="border-b border-white/8 px-3 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Export {rows.length} contact{rows.length !== 1 ? "s" : ""}
              </p>
            </div>
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => handleAction(action.id)}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
                    <Icon className="text-base" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{action.label}</p>
                    <p className="text-xs text-slate-500">{action.sublabel}</p>
                  </div>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}
