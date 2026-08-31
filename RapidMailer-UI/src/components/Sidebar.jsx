import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RiDashboardLine,
  RiAppsLine,
  RiMapPin2Line,
  RiGlobalLine,
  RiSearchLine,
  RiShareForwardLine,
  RiMailCheckLine,
  RiSendPlaneLine,
  RiCodeSSlashLine,
  RiShieldCheckLine,
  RiWhatsappLine,
  RiLinksLine,
  RiFilterLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiSettings4Line,
} from "react-icons/ri";
import { images } from "../assets/assets";
import { SidebarExpandContext } from "../context/SidebarExpandContext";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", path: "/dashbord", icon: RiDashboardLine },
      { title: "All Tools", path: "/tools", icon: RiAppsLine },
    ],
  },
  {
    label: "Accounts",
    items: [
      { title: "WhatsApp Accounts", path: "/whatsapp-connect", icon: RiLinksLine },
      { title: "Email Accounts", path: "/email-accounts", icon: RiMailCheckLine },
    ],
  },
];

const NavButton = ({ item, active, isExpand, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      title={!isExpand ? item.title : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
        active ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
      } ${isExpand ? "" : "justify-center"}`}
    >
      {active && <span className="grad-bg absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full" />}
      <Icon className={`text-lg ${active ? "text-accent-400" : ""}`} />
      {isExpand && <span>{item.title}</span>}
    </button>
  );
};

const SETTINGS_ITEM = { title: "Settings", path: "/settings", icon: RiSettings4Line };

const Sidebar = () => {
  const { isExpand, setIsExpand } = useContext(SidebarExpandContext);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`${
        isExpand ? "w-[240px]" : "w-[76px]"
      } glass-panel relative z-10 flex h-screen flex-col border-r border-white/10 bg-[#080b16]/80 transition-all duration-300`}
    >
      <div className="flex items-center gap-3 px-4 py-5">
        <img
          className={`${isExpand ? "w-[150px]" : "w-0"} overflow-hidden transition-all duration-300`}
          src={images.logo}
          alt="RapidMailer"
        />
        <button
          type="button"
          onClick={() => setIsExpand(!isExpand)}
          className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white/[0.06] hover:text-white cursor-pointer"
        >
          {isExpand ? <RiMenuFoldLine /> : <RiMenuUnfoldLine />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            {isExpand && (
              <span className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {group.label}
              </span>
            )}
            {group.items.map((item) => (
              <NavButton
                key={item.path}
                item={item}
                isExpand={isExpand}
                active={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
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
