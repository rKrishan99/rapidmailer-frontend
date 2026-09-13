import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  RiWhatsappLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiQrCodeLine,
  RiShutDownLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiWifiOffLine,
} from "react-icons/ri";
import { useWhatsApp } from "../context/WhatsAppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import { API_BASE_URL } from "../constants/api";
import { APP_NAME } from "../constants/branding";

// ─── Status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status, phone }) {
  switch (status) {
    case "connected":
      return <Badge tone="good">Connected {phone ? `(+${phone})` : ""}</Badge>;
    case "qr_ready":
      return <Badge tone="brand">QR Code Ready</Badge>;
    case "connecting":
    case "saved_idle":
      return <Badge tone="neutral">Connecting...</Badge>;
    case "offline":
      return <Badge tone="neutral">Backend Offline</Badge>;
    case "disconnected":
    default:
      return <Badge tone="bad">Disconnected</Badge>;
  }
}

// ─── QR Modal ────────────────────────────────────────────────────────────────
const QrModal = ({ account, onClose, onConnected }) => {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);

  // Track how many consecutive errors we've had so we can slow down polling
  const errorCount = useRef(0);
  const pollRef = useRef(null);
  const mountedRef = useRef(true);

  const stopPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startSession = async () => {
    if (!mountedRef.current) return;
    setIsInitializing(true);
    setError(null);
    setBackendOffline(false);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/whatsapp/session/${account.id}/init`,
        {},
        { timeout: 8000 }
      );
      if (!mountedRef.current) return;
      if (res.data?.qr) setQrCode(res.data.qr);
      if (res.data?.status) setStatus(res.data.status);
      errorCount.current = 0;
    } catch (err) {
      if (!mountedRef.current) return;
      const isNetworkErr =
        err.code === "ERR_NETWORK" ||
        err.code === "ERR_CONNECTION_REFUSED" ||
        err.message?.includes("Network Error");
      if (isNetworkErr) {
        setBackendOffline(true);
        setStatus("offline");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to initialize session");
      }
    } finally {
      if (mountedRef.current) setIsInitializing(false);
    }
  };

  const pollStatus = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const res = await axios.get(
        `${API_BASE_URL}/whatsapp/session/${account.id}/status`,
        { timeout: 5000 }
      );
      if (!mountedRef.current) return;

      errorCount.current = 0;
      setBackendOffline(false);

      const data = res.data;
      if (data?.qr) setQrCode(data.qr);
      if (data?.status) setStatus(data.status);

      if (data?.status === "connected") {
        stopPoll();
        onConnected?.();
        setTimeout(() => {
          if (mountedRef.current) onClose();
        }, 1200);
      }

      // If session is saved_idle (creds exist but not initialized), trigger init
      if (data?.status === "saved_idle") {
        startSession();
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const isNetworkErr =
        err.code === "ERR_NETWORK" ||
        err.code === "ERR_CONNECTION_REFUSED" ||
        err.message?.includes("Network Error");

      if (isNetworkErr) {
        errorCount.current += 1;
        // After 3 consecutive failures, show backend offline, slow poll to 5s
        if (errorCount.current >= 3) {
          setBackendOffline(true);
          setStatus("offline");
          stopPoll();
          // Slow retry every 5s instead of hammering every 1.5s
          pollRef.current = setInterval(pollStatus, 5000);
        }
      }
      // For other errors: quietly retry on next interval
    }
  }, [account.id]);

  useEffect(() => {
    mountedRef.current = true;
    startSession();
    pollRef.current = setInterval(pollStatus, 1500);
    return () => {
      mountedRef.current = false;
      stopPoll();
    };
  }, [account.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <Card className="flex w-full max-w-lg flex-col gap-6 p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
              <RiWhatsappLine className="text-xl text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Link WhatsApp Account</h3>
              <p className="text-xs text-slate-400">{account.label}</p>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Backend offline state */}
        {backendOffline ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <RiWifiOffLine className="text-5xl text-rose-400" />
            <div>
              <p className="font-medium text-rose-300">Backend Server Offline</p>
              <p className="mt-1 text-sm text-slate-400">
                Start the backend server, then click Retry.
              </p>
            </div>
            <Button
              onClick={() => {
                errorCount.current = 0;
                setBackendOffline(false);
                stopPoll();
                startSession();
                pollRef.current = setInterval(pollStatus, 1500);
              }}
              variant="secondary"
            >
              <RiRefreshLine />
              Retry Connection
            </Button>
          </div>
        ) : status === "connected" ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-400">
              <RiCheckLine className="text-3xl" />
            </div>
            <h4 className="text-lg font-semibold text-white">Connected Successfully!</h4>
            <p className="text-sm text-slate-400">Your device is linked and ready for messaging & filtering.</p>
          </div>
        ) : qrCode && status !== "disconnected" ? (
          <div className="flex flex-col items-center gap-5">
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-white p-4 shadow-xl">
              <img src={qrCode} alt="WhatsApp QR Code" className="h-64 w-64 object-contain" />
            </div>
            <div className="flex flex-col gap-2 text-xs text-slate-400">
              {[
                "Open WhatsApp on your phone",
                <>Tap <strong>Menu</strong> (Android) or <strong>Settings</strong> (iPhone)</>,
                <>Tap <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong></>,
                "Point your phone at this QR code",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            {isInitializing ? (
              <SectionLoader label="Generating WhatsApp QR code..." />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-slate-300">
                  {error || "QR code expired or connection closed."}
                </p>
                <Button onClick={startSession} variant="secondary">
                  <RiRefreshLine />
                  Generate New QR Code
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ─── Account Card ─────────────────────────────────────────────────────────────
const AccountCard = ({ account, onOpenQr, onRefresh }) => {
  const { updateAccount, deleteAccount, logoutSession, saving } = useWhatsApp();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(account.label);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const liveStatus = account.liveStatus;
  const isConnected = liveStatus === "connected" || account.connected;
  const displayPhone = account.verifiedPhoneNumber || account.activeUser?.phone;
  const displayName = account.verifiedDisplayName || account.activeUser?.name;

  const handleSaveLabel = async () => {
    await updateAccount(account.id, { label });
    setEditing(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutSession(account.id);
    setLoggingOut(false);
    onRefresh?.();
  };

  const handleDelete = async () => {
    await deleteAccount(account.id);
  };

  // If creds exist but session not initialized, show "Reconnect" instead of "Scan QR"
  const needsReconnect = liveStatus === "saved_idle";

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-11 w-11 items-center justify-center rounded-xl">
            <RiWhatsappLine className="text-xl text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{account.label || "Untitled WhatsApp Account"}</h3>
            <p className="text-sm text-slate-400">
              {isConnected && displayPhone
                ? `${displayName ? `"${displayName}" · ` : ""}+${displayPhone}`
                : needsReconnect
                ? "Session saved — click Reconnect to restore"
                : "No phone linked yet — scan QR code"}
            </p>
          </div>
        </div>
        <StatusBadge
          status={liveStatus || (account.connected ? "connected" : "disconnected")}
          phone={displayPhone}
        />
      </div>

      {editing ? (
        <div className="flex items-center gap-3">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Account Label (e.g. Sales WhatsApp)"
          />
          <Button onClick={handleSaveLabel} disabled={saving}>Save</Button>
          <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/10">
          {isConnected ? (
            <Button
              variant="secondary"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-rose-300 hover:bg-rose-500/10 border-rose-500/20"
            >
              <RiShutDownLine />
              {loggingOut ? "Disconnecting..." : "Disconnect"}
            </Button>
          ) : (
            <Button onClick={() => onOpenQr(account)}>
              <RiQrCodeLine />
              {needsReconnect ? "Reconnect" : "Scan QR Code to Connect"}
            </Button>
          )}

          <Button variant="secondary" onClick={() => setEditing(true)}>
            <RiEditLine />
            Rename
          </Button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Delete account?</span>
              <Button variant="danger" onClick={handleDelete}>Yes, Delete</Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              <RiDeleteBinLine />
              Remove
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const WhatsAppConnect = () => {
  const { accounts, loading, saving, addAccount, refreshAccounts } = useWhatsApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [activeQrAccount, setActiveQrAccount] = useState(null);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    const res = await addAccount({ label: newLabel.trim() });
    if (res.ok && res.account) {
      setNewLabel("");
      setShowAddForm(false);
      setActiveQrAccount(res.account);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Connections" title="WhatsApp Accounts" />
        <SectionLoader label="Checking connected WhatsApp accounts..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Linked Devices · QR Authentication"
        title="WhatsApp Accounts"
        description="Connect your WhatsApp accounts effortlessly using QR code scanning — no Meta Cloud API, no Facebook Business verification, and no template approval delays required."
        actions={
          !showAddForm && (
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={refreshAccounts}>
                <RiRefreshLine />
                Refresh
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <RiAddLine />
                Add WhatsApp Account
              </Button>
            </div>
          )
        }
      />

      {showAddForm && (
        <Card className="flex flex-col gap-4 p-6 border border-violet-500/30">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
              <RiWhatsappLine className="text-xl text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Add New WhatsApp Account</h3>
              <p className="text-xs text-slate-400">
                Give your account a friendly name (e.g. "Main Sales Line" or "Personal Support").
              </p>
            </div>
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
            className="flex flex-col sm:flex-row sm:items-end gap-3"
          >
            <div className="flex-1">
              <Input
                label="Account Label"
                placeholder="e.g. Sales Outreach #1"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 pb-[1px]">
              <Button type="submit" disabled={saving || !newLabel.trim()} className="whitespace-nowrap h-[42px]">
                {saving ? "Creating..." : "Create & Scan QR"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setShowAddForm(false); setNewLabel(""); }}
                className="h-[42px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {accounts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onOpenQr={(acc) => setActiveQrAccount(acc)}
              onRefresh={refreshAccounts}
            />
          ))}
        </div>
      ) : (
        !showAddForm && (
          <EmptyState
            icon={RiWhatsappLine}
            title="No WhatsApp accounts connected yet"
            description="Click 'Add WhatsApp Account' above to link your phone via QR scan in seconds."
          />
        )
      )}

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <RiShieldCheckLine className="text-xl text-emerald-400" />
          <h3 className="font-semibold text-white">How QR Linking Works</h3>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          {APP_NAME} connects as a linked secondary device using the standard WhatsApp Web multi-device protocol.
          Your messages are end-to-end encrypted directly from your machine. No monthly Meta API conversation charges,
          and zero template approval bureaucracy.
        </p>
      </Card>

      {activeQrAccount && (
        <QrModal
          account={activeQrAccount}
          onClose={() => { setActiveQrAccount(null); refreshAccounts(); }}
          onConnected={refreshAccounts}
        />
      )}
    </div>
  );
};

export default WhatsAppConnect;
