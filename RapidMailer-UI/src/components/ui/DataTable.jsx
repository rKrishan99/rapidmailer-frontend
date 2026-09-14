import { useState } from "react";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import Card from "./Card";

const PAGE_SIZE = 10;

const DataTable = ({ columns, data = [], renderExpanded, emptyLabel = "No data yet" }) => {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const rows = data.slice(start, start + PAGE_SIZE);

  return (
    <Card className="overflow-hidden">
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead
            className="sticky top-0 z-10 backdrop-blur"
            style={{ backgroundColor: "var(--bg-sidebar)" }}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{
                    minWidth: col.minWidth,
                    borderBottom: "1px solid var(--border-subtle)",
                    color: "var(--text-secondary)",
                  }}
                  className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <RowGroup
                  key={start + index}
                  row={row}
                  columns={columns}
                  renderExpanded={renderExpanded}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div
        className="flex items-center justify-between px-4 py-3 text-sm"
        style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
      >
        <span>
          {data.length === 0
            ? "0 rows"
            : `${start + 1}–${Math.min(start + PAGE_SIZE, data.length)} of ${data.length}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            style={{ border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <RiArrowLeftSLine />
          </button>
          <button
            type="button"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
            style={{ border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            <RiArrowRightSLine />
          </button>
        </div>
      </div>
    </Card>
  );
};

const RowGroup = ({ row, columns, renderExpanded }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr
        onClick={renderExpanded ? () => setOpen((o) => !o) : undefined}
        className={`transition-colors ${renderExpanded ? "cursor-pointer" : ""}`}
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)"; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        {columns.map((col) => (
          <td key={col.id} className="px-4 py-3 align-top" style={{ color: "var(--text-primary)" }}>
            {col.render ? col.render(row) : row[col.id] ?? "N/A"}
          </td>
        ))}
      </tr>
      {renderExpanded && open && (
        <tr style={{ borderBottom: "1px solid var(--border-subtle)", backgroundColor: "var(--bg-surface-2)" }}>
          <td colSpan={columns.length} className="px-4 py-4">
            {renderExpanded(row)}
          </td>
        </tr>
      )}
    </>
  );
};

export default DataTable;
