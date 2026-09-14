// src/utils/themeManager.js
// Theme IDs must match exactly what is set in index.css [data-theme="..."]

export const THEMES = [
  {
    id: "carbon",
    name: "Carbon Slate",
    subtitle: "GitHub & Linear inspired cool dark slate",
    type: "dark",
    preview: {
      bg: "#0d1117",
      surface: "#1c2128",
      border: "#30363d",
      accent: "#2f81f7",
      text: "#e6edf3",
    },
    description: "Ergonomic deep slate with precise contrast ratios — ideal for high-focus scraping and automation sessions.",
  },
  {
    id: "obsidian",
    name: "Warm Obsidian",
    subtitle: "Warm espresso dark, blue-light fatigue reduced",
    type: "dark",
    preview: {
      bg: "#120e0d",
      surface: "#221c19",
      border: "#3d312a",
      accent: "#f97316",
      text: "#f5ebe6",
    },
    description: "Deep ember and warm charcoal hues engineered to cut blue light during late-night outreach campaigns.",
  },
  {
    id: "nordic",
    name: "Nordic Cold",
    subtitle: "Muted greyish-cyan arctic minimalism",
    type: "dark",
    preview: {
      bg: "#0b131a",
      surface: "#152432",
      border: "#243f56",
      accent: "#06b6d4",
      text: "#ecf3f9",
    },
    description: "Cool arctic frost tones with balanced contrast for high-clarity data scanning and lead enrichment.",
  },
  {
    id: "studio",
    name: "Clean Studio",
    subtitle: "High-contrast warm paper off-white — Light Mode",
    type: "light",
    preview: {
      bg: "#f6f8fa",
      surface: "#ffffff",
      border: "#d0d7de",
      accent: "#0969da",
      text: "#1f2328",
    },
    description: "Professional daytime studio theme with ink-black typography for client-facing demos and presentations.",
  },
];

const THEME_KEY = "omni_preferred_theme";

export function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || "carbon";
  } catch {
    return "carbon";
  }
}

export function applyThemeToDocument(themeId) {
  const root = document.documentElement;
  // Remove any previously applied theme data-attribute
  root.setAttribute("data-theme", themeId);

  if (themeId === "studio") {
    root.classList.remove("dark");
    root.classList.add("light");
    root.style.colorScheme = "light";
  } else {
    root.classList.remove("light");
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  }
}

export function setTheme(themeId) {
  try {
    localStorage.setItem(THEME_KEY, themeId);
  } catch {}
  applyThemeToDocument(themeId);
}

/** Called once on app boot — reads localStorage, applies to <html> */
export function initTheme() {
  const saved = getStoredTheme();
  applyThemeToDocument(saved);
  return saved;
}
