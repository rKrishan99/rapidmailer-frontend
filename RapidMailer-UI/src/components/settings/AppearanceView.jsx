import { useState, useEffect } from "react";
import { RiPaletteLine, RiCheckLine, RiSunLine, RiMoonLine, RiEyeLine } from "react-icons/ri";
import Card from "../ui/Card";
import { THEMES, getStoredTheme, setTheme } from "../../utils/themeManager";

export default function AppearanceView() {
  const [currentTheme, setCurrentTheme] = useState("carbon");

  useEffect(() => {
    setCurrentTheme(getStoredTheme());
  }, []);

  const handleSelectTheme = (themeId) => {
    setTheme(themeId);
    setCurrentTheme(themeId);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-6 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0">
              <RiPaletteLine className="text-lg" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                Ergonomic Eye-Comfort Themes
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Scientifically calibrated palettes designed to minimise eye strain during extensive outreach workflows.
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs"
            style={{
              border: "1px solid var(--border-subtle)",
              backgroundColor: "var(--bg-surface-2)",
              color: "var(--text-muted)",
            }}
          >
            <RiEyeLine style={{ color: "var(--accent-primary)" }} />
            <span>Instant Live Preview</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme.id)}
                className="relative flex flex-col justify-between rounded-xl p-5 cursor-pointer transition-all duration-200"
                style={{
                  border: `1px solid ${isSelected ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                  backgroundColor: isSelected ? "var(--bg-surface)" : "var(--bg-surface-2)",
                  boxShadow: isSelected ? `0 0 0 2px var(--accent-glow)` : "none",
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                        {theme.name}
                      </span>
                      {theme.type === "light" ? (
                        <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-400/20 text-amber-400">
                          <RiSunLine /> Light
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-slate-400/15 text-slate-400">
                          <RiMoonLine /> Dark
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {theme.subtitle}
                    </p>
                  </div>

                  {isSelected && (
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full shrink-0"
                      style={{ backgroundColor: "var(--accent-primary)", color: "#fff" }}
                    >
                      <RiCheckLine className="text-sm font-bold" />
                    </div>
                  )}
                </div>

                <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                  {theme.description}
                </p>

                {/* Colour Swatch Row */}
                <div
                  className="rounded-lg p-2.5 flex items-center justify-between"
                  style={{
                    backgroundColor: "var(--bg-app)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                    Palette:
                  </span>
                  <div className="flex items-center gap-2">
                    {[theme.preview.bg, theme.preview.surface, theme.preview.border, theme.preview.accent, theme.preview.text].map(
                      (color, i) => (
                        <div
                          key={i}
                          className="h-5 w-5 rounded-md shadow-sm"
                          style={{
                            backgroundColor: color,
                            border: "1px solid rgba(128,128,128,0.25)",
                          }}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
