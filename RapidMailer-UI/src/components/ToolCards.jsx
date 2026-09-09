import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { RiDraggable, RiRestartLine } from "react-icons/ri";
import { toolInfo } from "../assets/toolCardsInfo";
import Card from "./ui/Card";

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
    // Storage unavailable (private browsing, quota, etc.) — reordering
    // still works for the session, it just won't persist across reloads.
  }
}

// Keeps saved positions for tools that still exist, appends any tools added
// since the order was last saved, and drops any that were removed.
function reconcileOrder(savedPaths, allPaths) {
  if (!savedPaths) return allPaths;
  const known = new Set(allPaths);
  const kept = savedPaths.filter((p) => known.has(p));
  const missing = allPaths.filter((p) => !kept.includes(p));
  return [...kept, ...missing];
}

const SortableToolCard = ({ item, onNavigate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.path,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={() => onNavigate(item.path)}
      className={`group relative flex cursor-pointer flex-col gap-4 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20 ${
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
      <div className="grad-ring flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105">
        <item.icon className="text-2xl text-white" />
      </div>
      <div className="flex flex-col gap-1 pr-6">
        <h3 className="font-semibold text-white">{item.title}</h3>
        <p className="text-sm text-slate-400">{item.description}</p>
      </div>
    </Card>
  );
};

const ToolCards = () => {
  const navigate = useNavigate();
  const allPaths = useMemo(() => toolInfo.map((t) => t.path), []);
  const byPath = useMemo(() => Object.fromEntries(toolInfo.map((t) => [t.path, t])), []);
  const [order, setOrder] = useState(() => reconcileOrder(loadSavedOrder(), allPaths));

  const items = order.map((p) => byPath[p]).filter(Boolean);

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

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">Drag the grip on a card to arrange them your way.</p>
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <SortableToolCard key={item.path} item={item} onNavigate={navigate} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default ToolCards;
