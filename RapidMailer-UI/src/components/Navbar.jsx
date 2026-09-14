// Navbar — uses design tokens for bg and border; no hardcoded colors.
import { useTranslation } from "react-i18next";
import { RiSparkling2Fill } from "react-icons/ri";
import APP_CONFIG from "../constants/branding";
import LanguageSelector from "./ui/LanguageSelector";

const Navbar = () => {
  const { t } = useTranslation();

  return (
    <header
      className="relative z-10 flex h-16 w-full items-center justify-between px-6 backdrop-blur-xl"
      style={{
        backgroundColor: "var(--glass-bg)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        <RiSparkling2Fill style={{ color: "var(--accent-primary)" }} />
        <span>{t("header.tagline", "Leads, verification & campaigns — all in one place")}</span>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSelector variant="compact" />
        <span
          className="rounded-full px-3 py-1 text-xs font-medium font-mono"
          style={{
            border: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface-2)",
            color: "var(--text-secondary)",
          }}
        >
          {APP_CONFIG.version}
        </span>
      </div>
    </header>
  );
};

export default Navbar;
