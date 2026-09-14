// Navbar — uses design tokens for bg and border; no hardcoded colors.
import { RiSparkling2Fill } from "react-icons/ri";

const Navbar = () => (
  <header
    className="relative z-10 flex h-16 w-full items-center justify-between px-6 backdrop-blur-xl"
    style={{
      backgroundColor: "var(--glass-bg)",
      borderBottom: "1px solid var(--border-subtle)",
    }}
  >
    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
      <RiSparkling2Fill style={{ color: "var(--accent-primary)" }} />
      <span>Leads, verification &amp; campaigns — all in one place</span>
    </div>
    <div className="flex items-center gap-3">
      <span
        className="rounded-full px-3 py-1 text-xs font-medium"
        style={{
          border: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface-2)",
          color: "var(--text-secondary)",
        }}
      >
        v3.2.1
      </span>
    </div>
  </header>
);

export default Navbar;
