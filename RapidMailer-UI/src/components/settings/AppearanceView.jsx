import { useState, useEffect } from "react";
import { RiPaletteLine, RiCheckLine, RiSunLine, RiMoonLine, RiEyeLine } from "react-icons/ri";
import Card from "../ui/Card";
import { THEMES, getStoredTheme, setTheme } from "../../utils/themeManager";

export default function AppearanceView() {
  const [currentTheme, setCurrentTheme] = useState("carbon-slate");

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <RiPaletteLine className="text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Ergonomic Eye-Comfort Themes</h3>
              <p className="text-sm text-slate-400">
                Scientifically calibrated palettes designed to minimize eye strain during extensive outreach workflows.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400">
            <RiEyeLine className="text-accent-400" />
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
                className={`relative flex flex-col justify-between rounded-xl border p-5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-accent-400/80 bg-white/[0.08] shadow-lg shadow-accent-400/10 ring-1 ring-accent-400/40"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-base">{theme.name}</span>
                        {theme.type === "light" ? (
                          <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-amber-400/20 text-amber-300">
                            <RiSunLine /> Light
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-slate-400/20 text-slate-300">
                            <RiMoonLine /> Dark
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{theme.subtitle}</p>
                    </div>

                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-400 text-slate-950">
                        <RiCheckLine className="text-base font-bold" />
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{theme.description}</p>
                </div>

                {/* Color Palette Preview Swatches */}
                <div className="rounded-lg border border-white/10 p-2.5 bg-black/20 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">Palette:</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-5 w-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.preview.bg }}
                      title="Base Canvas"
                    />
                    <div
                      className="h-5 w-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.preview.surface }}
                      title="Surface Card"
                    />
                    <div
                      className="h-5 w-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.preview.border }}
                      title="Border Color"
                    />
                    <div
                      className="h-5 w-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.preview.accent }}
                      title="Accent"
                    />
                    <div
                      className="h-5 w-5 rounded-md border border-white/20 shadow-sm"
                      style={{ backgroundColor: theme.preview.text }}
                      title="Foreground Text"
                    />
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
