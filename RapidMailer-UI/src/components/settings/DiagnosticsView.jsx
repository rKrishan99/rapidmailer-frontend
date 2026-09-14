import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  RiHeartPulseLine,
  RiDownload2Line,
  RiSendPlaneLine,
  RiRefreshLine,
  RiAlertLine,
  RiInformationLine,
  RiErrorWarningLine,
  RiCheckLine,
} from "react-icons/ri";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { API_BASE_URL } from "../../constants/api";

const LEVEL_COLORS = {
  ALL: "text-slate-300",
  INFO: "text-sky-400 bg-sky-400/10 border-sky-400/30",
  WARN: "text-amber-400 bg-amber-400/10 border-amber-400/30",
  ERROR: "text-rose-400 bg-rose-400/10 border-rose-400/30",
};

export default function DiagnosticsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [exporting, setExporting] = useState(false);
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(null);
  const [supportNotes, setSupportNotes] = useState("");
  const [showSupportModal, setShowSupportModal] = useState(false);
  const logContainerRef = useRef(null);

  const fetchLogs = async (level = levelFilter) => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/system/logs`, {
        params: { level, limit: 200 },
      });
      if (res.data.success) {
        setLogs(res.data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(levelFilter);
  }, [levelFilter]);

  const handleExport = () => {
    try {
      setExporting(true);
      window.open(`${API_BASE_URL}/system/logs/export?days=7`, "_blank");
    } finally {
      setExporting(false);
    }
  };

  const handleSendSupport = async () => {
    try {
      setSendingSupport(true);
      const res = await axios.post(`${API_BASE_URL}/system/logs/send-support`, {
        userNotes: supportNotes,
      });
      if (res.data.success) {
        setSupportSuccess(res.data);
        setShowSupportModal(false);
        setSupportNotes("");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to dispatch support bundle");
    } finally {
      setSendingSupport(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {supportSuccess && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-300">
          <RiCheckLine className="text-xl mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{supportSuccess.message}</span>
            <span className="text-xs text-emerald-400/80 font-mono">
              Diagnostic Ticket ID: {supportSuccess.ticketId}
            </span>
          </div>
        </div>
      )}

      {/* Diagnostics Header & Actions */}
      <Card className="flex flex-col gap-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <RiHeartPulseLine className="text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-white">System Diagnostics & 90-Day Event Logs</h3>
              <p className="text-sm text-slate-400">
                Automated rotating telemetry with sensitive credentials redacted. Pruned automatically after 90 days.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="secondary" onClick={handleExport} disabled={exporting}>
              <RiDownload2Line className="text-base" />
              <span>Export Logs</span>
            </Button>
            <Button onClick={() => setShowSupportModal(true)}>
              <RiSendPlaneLine className="text-base" />
              <span>Send Diagnostic Report</span>
            </Button>
          </div>
        </div>

        {/* Filters & Refresh Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Severity:</span>
            {["ALL", "ERROR", "WARN", "INFO"].map((lvl) => {
              const active = levelFilter === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer border ${
                    active
                      ? "border-accent-400 bg-accent-400/20 text-accent-300 shadow-sm"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => fetchLogs(levelFilter)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RiRefreshLine className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Live Terminal Log Viewer */}
        <div
          ref={logContainerRef}
          className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs overflow-y-auto max-h-[420px] flex flex-col gap-2 shadow-inner"
        >
          {loading && logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">Loading diagnostic events...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No log entries matching filter severity: <span className="text-white font-bold">{levelFilter}</span>
            </div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-2.5 border-b border-white/[0.04] pb-2 leading-relaxed hover:bg-white/[0.02] px-1 rounded transition"
              >
                <span className="text-slate-500 shrink-0 select-none text-[11px]">
                  {item.timestamp?.slice(11, 19)}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 border ${
                    LEVEL_COLORS[item.level] || "text-slate-400"
                  }`}
                >
                  {item.level}
                </span>
                <span className="text-purple-400 font-semibold shrink-0">[{item.module}]</span>
                <span className="text-slate-200 break-all">{item.message}</span>
                {item.meta && (
                  <span className="text-slate-500 text-[11px] truncate max-w-[200px]" title={item.meta}>
                    {item.meta}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Diagnostic Support Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121624] p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RiHeartPulseLine className="text-xl text-accent-400" />
                <h4 className="font-semibold text-white text-base">Send Diagnostic Report</h4>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This gathers sanitized machine specifications (OS, Node version, memory usage, uptime) and recent error
              traces. Passwords, secrets, and auth tokens are automatically masked.
            </p>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Describe the issue you are experiencing (optional):
              </label>
              <textarea
                value={supportNotes}
                onChange={(e) => setSupportNotes(e.target.value)}
                rows={4}
                placeholder="e.g. Scraper encountered timeouts during postal code matrix search..."
                className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-slate-500 focus:border-accent-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <Button variant="secondary" onClick={() => setShowSupportModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendSupport} disabled={sendingSupport}>
                {sendingSupport ? "Transmitting..." : "Send Report"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
