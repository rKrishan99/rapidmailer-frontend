import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  RiDraggable,
  RiRestartLine,
  RiSearchLine,
  RiAppsLine,
  RiGlobalLine,
  RiWhatsappLine,
  RiMailCheckLine,
} from "react-icons/ri";
import { toolInfo, TOOL_CATEGORIES } from "../assets/toolCardsInfo";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

const ORDER_STORAGE_KEY = "rapidmailer:tool-order";

function loadSavedOrder() {
  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveOrder(paths) {
  try {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(paths));
  } catch {
    // Storage unavailable
  }
}

function reconcileOrder(savedPaths, allPaths) {
  if (!savedPaths) return allPaths;
  const known = new Set(allPaths);
  const kept = savedPaths.filter((p) => known.has(p));
  const missing = allPaths.filter((p) => !kept.includes(p));
  return [...kept, ...missing];
}

const CATEGORY_CONFIG = [
  { id: "all", label: "All", icon: RiAppsLine },
  { id: "scraping", label: "Lead Scraping", icon: RiGlobalLine },
  { id: "whatsapp", label: "WhatsApp Suite", icon: RiWhatsappLine },
  { id: "email", label: "Email Suite", icon: RiMailCheckLine },
];

const SortableToolCard = ({ item, onNavigate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.path,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getCategoryBadge = (cat) => {
    if (cat === "whatsapp") return <Badge tone="good">WhatsApp</Badge>;
    if (cat === "email") return <Badge tone="brand">Email</Badge>;
    return <Badge tone="neutral">Scraping</Badge>;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={() => onNavigate(item.path)}
      className={`group relative flex cursor-pointer flex-col justify-between gap-4 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 ${
        isDragging ? "z-10 opacity-60" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        title="Drag to reorder"
        className="absolute right-3 top-3 flex h-7 w-7 cursor-grab items-center justify-center rounded-lg text-slate-500 opacity-0 transition-opacity hover:bg-white/[0.06] hover:text-slate-300 group-hover:opacity-100 active:cursor-grabbing"
      >
        <RiDraggable />
      </button>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="grad-ring flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105">
            <item.icon className="text-2xl text-white" />
          </div>
          <div className="pr-6">{getCategoryBadge(item.category)}</div>
        </div>

        <div className="flex flex-col gap-1 pr-4">
          <h3 className="font-semibold text-white group-hover:text-violet-200 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
        </div>
      </div>
    </Card>
  );
};

const ToolCards = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");

  const activeCat = searchParams.get("cat") || "all";

  const allPaths = useMemo(() => toolInfo.map((t) => t.path), []);
  const byPath = useMemo(() => Object.fromEntries(toolInfo.map((t) => [t.path, t])), []);
  const [order, setOrder] = useState(() => reconcileOrder(loadSavedOrder(), allPaths));

  const items = useMemo(() => order.map((p) => byPath[p]).filter(Boolean), [order, byPath]);

  // Counts per category
  const counts = useMemo(() => {
    const c = { all: toolInfo.length, scraping: 0, whatsapp: 0, email: 0 };
    for (const t of toolInfo) {
      if (t.category && c[t.category] !== undefined) {
        c[t.category]++;
      }
    }
    return c;
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCat = activeCat === "all" || item.category === activeCat;
      const matchSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [items, activeCat, searchQuery]);

  const filteredPaths = useMemo(() => filteredItems.map((t) => t.path), [filteredItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((current) => {
      const oldIndex = current.indexOf(active.id);
      const newIndex = current.indexOf(over.id);
      const next = arrayMove(current, oldIndex, newIndex);
      saveOrder(next);
      return next;
    });
  };

  const isCustomOrder = order.some((path, i) => path !== allPaths[i]);

  const handleReset = () => {
    setOrder(allPaths);
    saveOrder(allPaths);
  };

  const handleSelectCat = (id) => {
    if (id === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ cat: id });
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Category Filter Pills & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORY_CONFIG.map((tab) => {
            const Icon = tab.icon;
            const active = activeCat === tab.id;
            const count = counts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectCat(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-violet-500 text-white shadow-lg shadow-violet-900/30"
                    : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                <Icon className={active ? "text-white" : "text-slate-400 text-sm"} />
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    active ? "bg-white/20 text-white" : "bg-white/[0.06] text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none transition focus:border-violet-500/60 focus:bg-white/[0.06]"
          />
        </div>
      </div>

      {/* Reorder and count summary */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <p>
          Showing {filteredItems.length} tool{filteredItems.length !== 1 ? "s" : ""}. Drag cards to customize your layout.
        </p>
        {isCustomOrder && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
          >
            <RiRestartLine />
            Reset order
          </button>
        )}
      </div>

      {/* Cards Grid */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredPaths} strategy={rectSortingStrategy}>
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <SortableToolCard key={item.path} item={item} onNavigate={navigate} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ToolCards;
