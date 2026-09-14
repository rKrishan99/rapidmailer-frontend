import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  RiFireLine,
  RiPlayFill,
  RiStopCircleLine,
  RiRefreshLine,
  RiChatSmile2Line,
  RiTimeLine,
  RiShieldCheckLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { API_BASE_URL } from "../constants/api";
import { useWhatsApp } from "../context/WhatsAppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import Select from "../components/ui/Select";
import PageHeader from "../components/ui/PageHeader";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

const THEMES = [
  { value: "casual", label: "Casual Check-in & Small Talk" },
  { value: "business", label: "Business Proposal & Milestones" },
  { value: "support", label: "Technical Support & Deployment" },
];

export default function WhatsAppWarmer() {
  const { accounts } = useWhatsApp();
  const [selectedAccountIds, setSelectedAccountIds] = useState([]);
  const [theme, setTheme] = useState("casual");
  const [minDelay, setMinDelay] = useState(25);
  const [maxDelay, setMaxDelay] = useState(75);
  const [warmerStatus, setWarmerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pollIntervalRef = useRef(null);

  const connectedAccounts = accounts.filter((a) => a.connected);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/warmer/status`);
      setWarmerStatus(res.data);
      if (res.data.running && res.data.accountIds?.length) {
        setSelectedAccountIds(res.data.accountIds);
      }
    } catch (err) {
      console.warn("Failed to fetch warmer status:", err.message);
    }
  };

  useEffect(() => {
    fetchStatus();
    pollIntervalRef.current = setInterval(fetchStatus, 4000);
    return () => clearInterval(pollIntervalRef.current);
  }, []);

  const toggleAccount = (id) => {
    if (warmerStatus?.running) return;
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStart = async () => {
    if (selectedAccountIds.length < 2) {
      setError("Please select at least 2 connected accounts to warm.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/whatsapp/warmer/start`, {
        accountIds: selectedAccountIds,
        theme,
        minDelay: Number(minDelay) || 25,
        maxDelay: Number(maxDelay) || 75,
      });
      setWarmerStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to start warmer.");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/whatsapp/warmer/stop`);
      setWarmerStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to stop warmer.");
    } finally {
      setLoading(false);
    }
  };

  const logs = warmerStatus?.logs || [];
  const isRunning = Boolean(warmerStatus?.running);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Account Reputation"
        title="WhatsApp Warmer Engine"
        description="Safely build phone number trust and account reputation through automated, realistic ping-pong conversations between multiple connected numbers with randomized human pacing."
      />

      {/* Safety info banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-emerald-500/20 bg-emerald-500/[0.03]">
        <div className="flex items-start gap-3">
          <div className="grad-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <RiShieldCheckLine className="text-xl text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Peer-to-Peer Account Warming Active</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates realistic presence ('composing' for 2–4s) and applies staggered 25s–75s delays between turns to build organic carrier &amp; Meta trust.
            </p>
          </div>
        </div>

        {isRunning ? (
          <Badge tone="good" className="px-3 py-1.5 text-sm animate-pulse">
            ● Warming in Progress
          </Badge>
        ) : (
          <Badge tone="neutral" className="px-3 py-1.5 text-sm">
            Idle
          </Badge>
        )}
      </Card>

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Account Selection & Pacing Settings */}
        <Card className="flex flex-col gap-5 p-6 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Warming Accounts</h3>
            <span className="text-xs text-slate-500">Min 2 accounts</span>
          </div>

          <p className="text-xs text-slate-400">
            Select the accounts that will exchange conversational messages:
          </p>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {connectedAccounts.length > 0 ? (
              connectedAccounts.map((acc) => {
                const checked = selectedAccountIds.includes(acc.id);
                return (
                  <label
                    key={acc.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? "border-violet-500/60 bg-violet-500/10 text-white"
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isRunning}
                        onChange={() => toggleAccount(acc.id)}
                        className="accent-violet-500 rounded"
                      />
                      <span className="text-sm font-medium truncate">
                        {acc.label || acc.verifiedDisplayName || `+${acc.verifiedPhoneNumber}`}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400">Online</span>
                  </label>
                );
              })
            ) : (
              <p className="text-xs text-amber-400/90 py-2">
                No connected WhatsApp accounts found. Please link accounts in WhatsApp Accounts.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 pt-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Conversation Theme
              </label>
              <Select
                value={theme}
                onChange={setTheme}
                options={THEMES}
                disabled={isRunning}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min Delay (s)"
                type="number"
                min={10}
                value={minDelay}
                onChange={(e) => setMinDelay(e.target.value)}
                disabled={isRunning}
              />
              <Input
                label="Max Delay (s)"
                type="number"
                min={20}
                value={maxDelay}
                onChange={(e) => setMaxDelay(e.target.value)}
                disabled={isRunning}
              />
            </div>
          </div>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="pt-2">
            {isRunning ? (
              <Button onClick={handleStop} disabled={loading} variant="secondary" className="w-full justify-center">
                <RiStopCircleLine />
                Stop Warming
              </Button>
            ) : (
              <Button onClick={handleStart} disabled={loading || selectedAccountIds.length < 2} className="w-full justify-center">
                <RiPlayFill />
                Start Warming Exchange
              </Button>
            )}
          </div>
        </Card>

        {/* Right Column: Live Exchange Feed & Stats */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card className="flex flex-col gap-1 p-4">
              <span className="text-xs text-slate-500">Messages Exchanged</span>
              <span className="text-2xl font-bold text-violet-300">
                {warmerStatus?.stats?.totalExchanged ?? 0}
              </span>
            </Card>
            <Card className="flex flex-col gap-1 p-4">
              <span className="text-xs text-slate-500">Active Numbers</span>
              <span className="text-2xl font-bold text-white">
                {selectedAccountIds.length}
              </span>
            </Card>
            <Card className="flex flex-col gap-1 p-4 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500">Pacing Delay</span>
              <span className="text-sm font-semibold text-emerald-400 mt-1">
                {minDelay}s – {maxDelay}s randomized
              </span>
            </Card>
          </div>

          {/* Live Message Exchange Feed */}
          <Card className="flex flex-col gap-4 p-6 flex-1 min-h-[400px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <RiChatSmile2Line className="text-violet-400 text-lg" />
                <h3 className="font-semibold text-white">Live Conversation Feed</h3>
              </div>
              <Button onClick={fetchStatus} variant="secondary" className="text-xs py-1 px-2.5">
                <RiRefreshLine /> Refresh
              </Button>
            </div>

            {logs.length > 0 ? (
              <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-col gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-3.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-medium text-slate-300">
                        <span className="text-violet-300">{log.from || "Account"}</span>
                        <RiArrowRightLine className="text-slate-500" />
                        <span className="text-emerald-300">{log.to || "Account"}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 mt-0.5 whitespace-pre-wrap">
                      {log.text || log.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={RiFireLine}
                title="Feed is waiting"
                description="Select 2 accounts and start the warmer to view real-time message exchanges."
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
