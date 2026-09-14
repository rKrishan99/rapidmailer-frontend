import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  RiHeartPulseLine,
  RiDownload2Line,
  RiSendPlaneLine,
  RiRefreshLine,
  RiCheckLine,
} from "react-icons/ri";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { API_BASE_URL } from "../../constants/api";

export default function DiagnosticsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [exporting, setExporting] = useState(false);
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(null);
  const [supportNotes, setSupportNotes] = useState("");
  const [showSupportModal, setShowSupportModal] = useState(false);

  const fetchLogs = async (level = levelFilter) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/system/logs`, { params: { level, limit: 200 } });
      if (res.data.success) setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(levelFilter); }, [levelFilter]);

  const handleExport = () => { setExporting(true); window.open(`${API_BASE_URL}/system/logs/export?days=7`, "_blank"); setExporting(false); };

  const handleSendSupport = async () => {
    try {
      setSendingSupport(true);
      const res = await axios.post(`${API_BASE_URL}/system/logs/send-support`, { userNotes: supportNotes });
      if (res.data.success) { setSupportSuccess(res.data); setShowSupportModal(false); setSupportNotes(""); }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to dispatch support bundle");
    } finally { setSendingSupport(false); }
  };

  const LEVEL_STYLE = {
    INFO:  { color: "#38bdf8", backgroundColor: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.30)" },
    WARN:  { color: "#fb923c", backgroundColor: "rgba(251,146,60,0.10)", border: "1px solid rgba(251,146,60,0.30)" },
    ERROR: { color: "#f87171", backgroundColor: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.30)" },
    DEBUG: { color: "var(--text-muted)", backgroundColor: "transparent", border: "1px solid var(--border-subtle)" },
  };

  return (
    <div className="flex flex-col gap-6">
      {supportSuccess && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ border: "1px solid rgba(52,211,153,0.3)", backgroundColor: "rgba(52,211,153,0.08)", color: "#34d399" }}>
          <RiCheckLine className="text-xl mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{supportSuccess.message}</span>
            <span className="text-xs font-mono opacity-70">Ticket ID: {supportSuccess.ticketId}</span>
          </div>
        </div>
      )}

      <Card className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0">
              <RiHeartPulseLine className="text-lg" />
            </div>
            <div>
              <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                System Diagnostics &amp; 90-Day Event Logs
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Automated rotating telemetry with sensitive credentials redacted. Pruned automatically after 90 days.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="secondary" onClick={handleExport} disabled={exporting}>
              <RiDownload2Line className="text-base" /> Export Logs
            </Button>
            <Button onClick={() => setShowSupportModal(true)}>
              <RiSendPlaneLine className="text-base" /> Send Diagnostic Report
            </Button>
          </div>
        </div>

        {/* Severity filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium mr-1" style={{ color: "var(--text-muted)" }}>Severity:</span>
            {["ALL", "ERROR", "WARN", "INFO"].map((lvl) => {
              const active = levelFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer"
                  style={active ? {
                    border: "1px solid var(--accent-primary)",
                    backgroundColor: "var(--accent-glow)",
                    color: "var(--accent-primary)",
                  } : {
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-surface-2)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => fetchLogs(levelFilter)}
            className="flex items-center gap-1.5 text-xs transition cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--accent-primary)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            <RiRefreshLine className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Log terminal — uses bg-surface-2 so it adapts to light/dark */}
        <div
          className="rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-[420px] flex flex-col gap-2 shadow-inner"
          style={{
            backgroundColor: "var(--bg-surface-2)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {loading && logs.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>Loading diagnostic events…</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center" style={{ color: "var(--text-muted)" }}>
              No log entries matching filter severity: <span className="font-bold" style={{ color: "var(--accent-primary)" }}>{levelFilter}</span>
            </div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 pb-2 leading-relaxed px-1 rounded transition"
                style={{ borderBottom: "1px solid var(--border-subtle)" }}
              >
                <span className="shrink-0 select-none text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {item.timestamp?.slice(11, 19)}
                </span>
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0"
                  style={LEVEL_STYLE[item.level] || { color: "var(--text-muted)" }}
                >
                  {item.level}
                </span>
                <span className="font-semibold shrink-0" style={{ color: "var(--accent-primary)" }}>
                  [{item.module}]
                </span>
                <span className="break-all" style={{ color: "var(--text-primary)" }}>{item.message}</span>
                {item.meta && (
                  <span className="text-[11px] truncate max-w-[200px]" style={{ color: "var(--text-muted)" }} title={item.meta}>
                    {item.meta}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
          <div
            className="w-full max-w-lg rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiHeartPulseLine className="text-xl" style={{ color: "var(--accent-primary)" }} />
                <h4 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                  Send Diagnostic Report
                </h4>
              </div>
              <button onClick={() => setShowSupportModal(false)} className="cursor-pointer" style={{ color: "var(--text-muted)" }}>✕</button>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              This gathers sanitized machine specifications and recent error traces. Passwords and auth tokens are automatically masked.
            </p>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
                Describe the issue (optional):
              </label>
              <textarea
                value={supportNotes}
                onChange={(e) => setSupportNotes(e.target.value)}
                rows={4}
                placeholder="e.g. Scraper encountered timeouts during postal code matrix search..."
                className="w-full rounded-xl p-3 text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-surface-2)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
              />
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <Button variant="secondary" onClick={() => setShowSupportModal(false)}>Cancel</Button>
              <Button onClick={handleSendSupport} disabled={sendingSupport}>
                {sendingSupport ? "Transmitting…" : "Send Report"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
