import { RiSparkling2Fill } from "react-icons/ri";

const Navbar = () => (
  <header className="relative z-10 flex h-16 w-full items-center justify-between border-b border-white/10 bg-white/[0.02] px-6 backdrop-blur-xl">
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <RiSparkling2Fill className="text-violet-400" />
      <span>Leads, verification & campaigns — all in one place</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-400">
        v3.2.1
      </span>
    </div>
  </header>
);

export default Navbar;
