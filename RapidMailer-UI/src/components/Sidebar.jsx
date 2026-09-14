// Sidebar — all background and text colors driven by CSS design tokens.
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiAppsLine,
  RiGlobalLine,
  RiWhatsappLine,
  RiMailCheckLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiSettings4Line,
} from "react-icons/ri";
import { images } from "../assets/assets";
import { SidebarExpandContext } from "../context/SidebarExpandContext";
import { APP_NAME } from "../constants/branding";

const MAIN_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard",   path: "/dashbord", icon: RiDashboardLine },
      { title: "All Tools (22)", path: "/tools",    icon: RiAppsLine },
    ],
  },
  {
    label: "Tool Suites",
    items: [
      { title: "Lead Scraping (7)",    path: "/tools?cat=scraping",  icon: RiGlobalLine },
      { title: "WhatsApp Suite (13)",  path: "/tools?cat=whatsapp",  icon: RiWhatsappLine },
      { title: "Email Suite (2)",      path: "/tools?cat=email",     icon: RiMailCheckLine },
    ],
  },
];

const ACCOUNT_ITEMS = [
  { title: "WhatsApp Accounts", path: "/whatsapp-connect", icon: RiWhatsappLine },
  { title: "Email Accounts",    path: "/email-accounts",   icon: RiMailCheckLine },
];

const SETTINGS_ITEM = { title: "Settings", path: "/settings", icon: RiSettings4Line };

const NavButton = ({ item, active, isExpand, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isExpand ? item.title : undefined}
      style={{
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        backgroundColor: active ? "var(--bg-surface-hover)" : "transparent",
      }}
      className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
        isExpand ? "" : "justify-center"
      }`}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = "var(--bg-surface-2)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
    >
      {active && (
        <span className="grad-bg absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full" />
      )}
      <Icon
        className="text-lg shrink-0"
        style={{ color: active ? "var(--accent-primary)" : "var(--text-muted)" }}
      />
      {isExpand && <span className="truncate">{item.title}</span>}
    </button>
  );
};

const Sidebar = () => {
  const { isExpand, setIsExpand } = useContext(SidebarExpandContext);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`${isExpand ? "w-[240px]" : "w-[76px]"} relative z-10 flex h-screen flex-col border-r transition-all duration-300`}
      style={{
        backgroundColor: "var(--bg-sidebar)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Logo row */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <img
          className={`${isExpand ? "w-[200px]" : "w-0"} overflow-hidden transition-all duration-300`}
          src={images.logo}
          alt={APP_NAME}
        />
        <button
          type="button"
          onClick={() => setIsExpand(!isExpand)}
          className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition cursor-pointer"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg-surface-2)"; e.currentTarget.style.color = "var(--text-primary)"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          {isExpand ? <RiMenuFoldLine /> : <RiMenuUnfoldLine />}
        </button>
      </div>

      {/* Main Nav groups (Overview & Tool Suites) */}
      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 pt-4">
        {MAIN_NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            {isExpand && (
              <span
                className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: "var(--text-muted)" }}
              >
                {group.label}
              </span>
            )}
            {group.items.map((item) => {
              const currentFull = location.pathname + location.search;
              const isActive = item.path.includes("?")
                ? currentFull === item.path
                : item.path === "/tools"
                ? location.pathname === "/tools" && (!location.search || location.search === "?cat=all")
                : location.pathname === item.path;

              return (
                <NavButton
                  key={item.path}
                  item={item}
                  isExpand={isExpand}
                  active={isActive}
                  onClick={() => navigate(item.path)}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* Accounts menu docked at bottom */}
      <div className="w-full px-3 pt-3 pb-2 flex flex-col gap-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        {isExpand && (
          <span
            className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Accounts
          </span>
        )}
        {ACCOUNT_ITEMS.map((item) => (
          <NavButton
            key={item.path}
            item={item}
            isExpand={isExpand}
            active={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>

      {/* Settings pinned at very bottom */}
      <div className="w-full px-3 py-2.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <NavButton
          item={SETTINGS_ITEM}
          isExpand={isExpand}
          active={location.pathname === SETTINGS_ITEM.path}
          onClick={() => navigate(SETTINGS_ITEM.path)}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
