import { useState, useEffect, useRef } from "react";
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

function StatusBadge({ status, phone }) {
  switch (status) {
    case "connected":
      return <Badge tone="good">Connected {phone ? `(+${phone})` : ""}</Badge>;
    case "qr_ready":
      return <Badge tone="brand">QR Code Ready</Badge>;
    case "connecting":
      return <Badge tone="neutral">Connecting...</Badge>;
    case "disconnected":
    default:
      return <Badge tone="bad">Disconnected</Badge>;
  }
}

// Modal / Overlay QR Code Scanner
const QrModal = ({ account, onClose, onConnected }) => {
  const [qrCode, setQrCode] = useState(null);
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const startSession = async () => {
    setIsInitializing(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/whatsapp/session/${account.id}/init`);
      if (res.data?.qr) setQrCode(res.data.qr);
      if (res.data?.status) setStatus(res.data.status);
    } catch (err) {
      console.error("Session init error:", err);
      setError(err.response?.data?.error || err.message || "Failed to initialize session");
    } finally {
      setIsInitializing(false);
    }
  };

  const pollStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/session/${account.id}/status`);
      if (res.data) {
        if (res.data.qr) {
          setQrCode(res.data.qr);
        }
        if (res.data.status) {
          setStatus(res.data.status);
        }
        if (res.data.status === "connected") {
          onConnected?.();
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      }
    } catch (err) {
      // Quietly retry on next interval
    }
  };

  useEffect(() => {
    startSession();
    const interval = setInterval(pollStatus, 1500);
    return () => clearInterval(interval);
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

        {status === "connected" ? (
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
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold">1</span>
                <span>Open WhatsApp on your phone</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold">2</span>
                <span>Tap <strong>Menu</strong> (Android) or <strong>Settings</strong> (iPhone)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold">3</span>
                <span>Tap <strong>Linked Devices</strong> &gt; <strong>Link a Device</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 font-bold">4</span>
                <span>Point your phone at this QR code</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            {isInitializing ? (
              <SectionLoader label="Generating WhatsApp QR code..." />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-slate-300">
                  {error || "QR code expired or connection closed. Click below to generate a new QR code."}
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

// Account Card Component
const AccountCard = ({ account, onOpenQr, onRefresh }) => {
  const { updateAccount, deleteAccount, logoutSession, saving } = useWhatsApp();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(account.label);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isConnected = account.connected || account.liveStatus === "connected";
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
                : "No phone linked yet — scan QR code"}
            </p>
          </div>
        </div>
        <StatusBadge status={account.liveStatus || (account.connected ? "connected" : "disconnected")} phone={displayPhone} />
      </div>

      {editing ? (
        <div className="flex items-center gap-3">
          <Input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Account Label (e.g. Sales WhatsApp)"
          />
          <Button onClick={handleSaveLabel} disabled={saving}>
            Save
          </Button>
          <Button variant="secondary" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-white/10">
          {!isConnected ? (
            <Button onClick={() => onOpenQr(account)}>
              <RiQrCodeLine />
              Scan QR Code to Connect
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-rose-300 hover:bg-rose-500/10 border-rose-500/20"
            >
              <RiShutDownLine />
              {loggingOut ? "Disconnecting..." : "Disconnect"}
            </Button>
          )}

          <Button variant="secondary" onClick={() => setEditing(true)}>
            <RiEditLine />
            Rename
          </Button>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Delete account?</span>
              <Button variant="danger" onClick={handleDelete}>
                Yes, Delete
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
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

const WhatsAppConnect = () => {
  const { accounts, loading, loadError, saving, addAccount, refreshAccounts } = useWhatsApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [activeQrAccount, setActiveQrAccount] = useState(null);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    const res = await addAccount({ label: newLabel.trim() });
    if (res.ok && res.account) {
      setNewLabel("");
      setShowAddForm(false);
      // Immediately trigger QR modal for the newly added account
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
        description="Connect your WhatsApp accounts effortlessly using QR code scanning — no Meta Cloud API, no Facebook Business verification, and no template approval delays required. Connect personal or business WhatsApp numbers just like WhatsApp Web."
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
            onSubmit={(e) => {
              e.preventDefault();
              handleAdd();
            }}
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
              <Button
                type="submit"
                disabled={saving || !newLabel.trim()}
                className="whitespace-nowrap h-[42px]"
              >
                {saving ? "Creating..." : "Create & Scan QR"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setNewLabel("");
                }}
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

      {/* Info Card */}
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

      {/* QR Code Modal */}
      {activeQrAccount && (
        <QrModal
          account={activeQrAccount}
          onClose={() => setActiveQrAccount(null)}
          onConnected={refreshAccounts}
        />
      )}
    </div>
  );
};

export default WhatsAppConnect;
