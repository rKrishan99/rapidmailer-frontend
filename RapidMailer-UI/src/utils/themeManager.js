// src/utils/themeManager.js

export const THEMES = [
  {
    id: "carbon-slate",
    name: "Carbon Slate",
    subtitle: "GitHub & Linear inspired cool dark slate",
    type: "dark",
    preview: {
      bg: "#0d1117",
      surface: "#161b22",
      border: "#30363d",
      accent: "#38bdf8",
      text: "#e6edf3",
    },
    description: "Ergonomic deep slate engineered for low eye fatigue during intensive scraping & campaign ops.",
  },
  {
    id: "warm-obsidian",
    name: "Warm Obsidian",
    subtitle: "Warm espresso dark reducing blue-light strain",
    type: "dark",
    preview: {
      bg: "#120e0d",
      surface: "#1c1716",
      border: "#3d322f",
      accent: "#f97316",
      text: "#f5ece6",
    },
    description: "Deep ember and warm charcoal hues that cut blue light exposure during night-time outreach.",
  },
  {
    id: "nordic-cold",
    name: "Nordic Cold",
    subtitle: "Muted greyish-cyan arctic minimalism",
    type: "dark",
    preview: {
      bg: "#0b1319",
      surface: "#111c24",
      border: "#203442",
      accent: "#2dd4bf",
      text: "#e1ecf2",
    },
    description: "Cool arctic frost tones with balanced contrast for high-clarity data scanning and filtering.",
  },
  {
    id: "clean-studio",
    name: "Clean Studio",
    subtitle: "High-contrast warm paper off-white",
    type: "light",
    preview: {
      bg: "#f8f9fa",
      surface: "#ffffff",
      border: "#e2e8f0",
      accent: "#0284c7",
      text: "#0f172a",
    },
    description: "Professional daytime studio theme with ink-black typography and clean borders.",
  },
];

const THEME_KEY = "omni_preferred_theme";

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "carbon-slate";
  } catch {
    return "carbon-slate";
  }
}

export function setTheme(themeId) {
  try {
    localStorage.setItem(THEME_KEY, themeId);
  } catch {}
  applyThemeToDocument(themeId);
}

export function applyThemeToDocument(themeId) {
  const root = document.documentElement;
  root.setAttribute("data-theme", themeId);
  if (themeId === "clean-studio") {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  }
}

export function initTheme() {
  const saved = getStoredTheme();
  applyThemeToDocument(saved);
  return saved;
}
