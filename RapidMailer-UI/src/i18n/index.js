// src/i18n/index.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import si from "../locales/si.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import de from "../locales/de.json";
import zh from "../locales/zh.json";
import hi from "../locales/hi.json";
import ar from "../locales/ar.json";
import pt from "../locales/pt.json";
import ru from "../locales/ru.json";
import ja from "../locales/ja.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "si", name: "Sinhala", nativeName: "සිංහල", flag: "🇱🇰" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪", dir: "rtl" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

const STORAGE_KEY = "omni_language";

export function getInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
  } catch (e) {}
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    si: { translation: si },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de },
    zh: { translation: zh },
    hi: { translation: hi },
    ar: { translation: ar },
    pt: { translation: pt },
    ru: { translation: ru },
    ja: { translation: ja },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export function setAppLanguage(langCode) {
  try {
    localStorage.setItem(STORAGE_KEY, langCode);
  } catch (e) {}
  i18n.changeLanguage(langCode);
  const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
  if (langObj?.dir === "rtl") {
    document.documentElement.dir = "rtl";
  } else {
    document.documentElement.dir = "ltr";
  }
}

export default i18n;
