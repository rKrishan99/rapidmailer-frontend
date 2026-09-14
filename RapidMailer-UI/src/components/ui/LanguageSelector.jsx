// src/components/ui/LanguageSelector.jsx
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RiGlobalLine, RiCheckLine, RiArrowDownSLine } from "react-icons/ri";
import { SUPPORTED_LANGUAGES, setAppLanguage } from "../../i18n";

export default function LanguageSelector({ variant = "compact", className = "" }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (code) => {
    setAppLanguage(code);
    setOpen(false);
  };

  if (variant === "compact") {
    return (
      <div ref={ref} className={`relative inline-block ${className}`}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          title="Change language"
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition cursor-pointer"
          style={{
            backgroundColor: "var(--bg-surface-2)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-surface-2)";
          }}
        >
          <RiGlobalLine className="text-sm" style={{ color: "var(--accent-primary)" }} />
          <span>{currentLang.flag}</span>
          <span className="font-mono text-[11px] uppercase tracking-wider">{currentLang.code}</span>
          <RiArrowDownSLine
            className={`text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            style={{ color: "var(--text-muted)" }}
          />
        </button>

        {open && (
          <div
            className="absolute right-0 mt-1.5 w-48 rounded-xl shadow-2xl py-1 z-50 overflow-hidden max-h-72 overflow-y-auto"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className="flex w-full items-center justify-between px-3 py-2 text-xs transition cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? "var(--bg-surface-hover)" : "transparent",
                    color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-surface-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{lang.flag}</span>
                    <span className="truncate">{lang.nativeName}</span>
                    <span className="text-[10px] uppercase font-mono" style={{ color: "var(--text-muted)" }}>
                      ({lang.code})
                    </span>
                  </div>
                  {isSelected && <RiCheckLine className="text-sm shrink-0" style={{ color: "var(--accent-primary)" }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Expanded Grid Variant (for Settings Appearance View)
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 ${className}`}>
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isSelected = lang.code === currentLang.code;
        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => handleSelect(lang.code)}
            className="flex items-center justify-between rounded-xl p-3 text-xs transition cursor-pointer text-left"
            style={{
              backgroundColor: isSelected ? "var(--bg-surface)" : "var(--bg-surface-2)",
              border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
              boxShadow: isSelected ? "0 0 0 1px var(--accent-primary)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)";
            }}
            onMouseLeave={(e) => {
              if (!isSelected) e.currentTarget.style.backgroundColor = "var(--bg-surface-2)";
            }}
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-base">{lang.flag}</span>
              <div className="flex flex-col truncate">
                <span className="font-semibold truncate" style={{ color: isSelected ? "var(--accent-primary)" : "var(--text-primary)" }}>
                  {lang.nativeName}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {lang.name}
                </span>
              </div>
            </div>
            {isSelected && (
              <div
                className="flex h-5 w-5 items-center justify-center rounded-full shrink-0"
                style={{ backgroundColor: "var(--accent-primary)", color: "#ffffff" }}
              >
                <RiCheckLine className="text-xs" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
