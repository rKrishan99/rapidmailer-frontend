import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiKey2Line,
  RiFileCopyLine,
  RiCheckLine,
  RiShieldCheckLine,
  RiCpuLine,
  RiSparklingFill,
  RiArrowRightUpLine,
  RiLockPasswordLine,
} from "react-icons/ri";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { API_BASE_URL } from "../../constants/api";

export default function LicenseView() {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedHwid, setCopiedHwid] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [activating, setActivating] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchLicense = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/system/license`);
      if (res.data.success) {
        setLicense(res.data.license);
      }
    } catch (err) {
      console.error("Failed to load license:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicense();
  }, []);

  const handleCopyHwid = () => {
    if (!license?.hwid) return;
    navigator.clipboard.writeText(license.hwid);
    setCopiedHwid(true);
    setTimeout(() => setCopiedHwid(false), 2000);
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");
    if (!keyInput.trim()) {
      setActionError("Please enter a valid license key");
      return;
    }

    try {
      setActivating(true);
      const res = await axios.post(`${API_BASE_URL}/system/license/activate`, {
        email: emailInput,
        licenseKey: keyInput,
      });

      if (res.data.success) {
        setActionSuccess(res.data.message);
        setShowActivateModal(false);
        setKeyInput("");
        fetchLicense();
      }
    } catch (err) {
      setActionError(err.response?.data?.error || "License activation failed.");
    } finally {
      setActivating(false);
    }
  };

  const getTierBadge = (tier) => {
    if (tier?.includes("Suite") || tier?.includes("All-in-One")) {
      return (
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: "rgba(147, 51, 234, 0.12)",
            color: "#7e22ce",
            border: "1px solid rgba(147, 51, 234, 0.35)",
          }}
        >
          <RiSparklingFill style={{ color: "#9333ea" }} />
          {tier}
        </span>
      );
    }
    if (tier?.includes("Pro")) {
      return (
        <span
          className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            backgroundColor: "rgba(6, 182, 212, 0.12)",
            color: "#0e7490",
            border: "1px solid rgba(6, 182, 212, 0.35)",
          }}
        >
          <RiShieldCheckLine style={{ color: "#0891b2" }} />
          {tier}
        </span>
      );
    }
    return (
      <span
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
        style={{
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          color: "#047857",
          border: "1px solid rgba(16, 185, 129, 0.35)",
        }}
      >
        <RiShieldCheckLine style={{ color: "#059669" }} />
        {tier || "Community Edition"}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {actionSuccess && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            border: "1px solid rgba(16, 185, 129, 0.4)",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            color: "#065f46",
          }}
        >
          <RiCheckLine className="text-lg" />
          {actionSuccess}
        </div>
      )}

      {/* Main License Card */}
      <Card className="flex flex-col gap-6 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white">
              <RiKey2Line className="text-lg" />
            </div>
            <div>
              <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
                License &amp; Device Binding
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Hardware machine authorization and commercial tier entitlement status.
              </p>
            </div>
          </div>
          <div>{getTierBadge(license?.tier)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {/* Registered Email */}
          <div
            className="rounded-xl p-4 flex flex-col gap-1.5"
            style={{
              backgroundColor: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Registered User
            </span>
            <span className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {license?.registeredEmail || "support@omniplus.io"}
            </span>
          </div>

          {/* License Key Masked */}
          <div
            className="rounded-xl p-4 flex flex-col gap-1.5"
            style={{
              backgroundColor: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              License Key
            </span>
            <div className="flex items-center gap-2 font-mono text-sm font-bold" style={{ color: "#059669" }}>
              <RiLockPasswordLine className="text-base" />
              <span>{license?.maskedKey || "OMNI-••••-••••-9842"}</span>
            </div>
          </div>

          {/* Machine HWID */}
          <div
            className="col-span-1 md:col-span-2 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            style={{
              backgroundColor: "var(--bg-surface-2)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                }}
              >
                <RiCpuLine className="text-lg" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>
                  Machine HWID (Hardware Fingerprint)
                </span>
                <span className="font-mono text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {license?.hwid || "Detecting hardware..."}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyHwid}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer"
              style={{
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-surface-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--bg-surface)";
              }}
            >
              {copiedHwid ? (
                <>
                  <RiCheckLine className="text-emerald-500 text-sm font-bold" />
                  <span className="text-emerald-600 font-bold">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine className="text-sm" style={{ color: "var(--text-secondary)" }} />
                  <span>Copy HWID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <Button variant="secondary" onClick={() => setShowActivateModal(true)}>
            Activate New License
          </Button>

          <a
            href="https://omniplus.io/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl grad-bg px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:opacity-95 transition"
          >
            <span>Upgrade Plan</span>
            <RiArrowRightUpLine />
          </a>
        </div>
      </Card>

      {/* Activation Modal */}
      {showActivateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4"
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Activate OmniPlus+ License
              </h4>
              <button
                onClick={() => setShowActivateModal(false)}
                className="cursor-pointer text-sm font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div
                className="rounded-lg p-3 text-xs font-semibold"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  color: "#b91c1c",
                }}
              >
                {actionError}
              </div>
            )}

            <form onSubmit={handleActivate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>
                  Registered Account Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="client@agency.com"
                  className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{
                    backgroundColor: "var(--bg-surface-2)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-primary)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-subtle)"; }}
                />
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>
                  License Key (e.g. OMNI-SUITE-XXXX-XXXX)
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="OMNI-SUITE-9842-8712-4410"
                  className="w-full rounded-xl px-3 py-2.5 font-mono text-sm font-semibold outline-none"
                  style={{
                    backgroundColor: "var(--bg-surface-2)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-primary)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border-subtle)"; }}
                  required
                />
              </div>

              <div className="text-[11px] leading-relaxed mt-1" style={{ color: "var(--text-muted)" }}>
                Your license will automatically bind to hardware ID:{" "}
                <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{license?.hwid}</span>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <Button variant="secondary" onClick={() => setShowActivateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={activating}>
                  {activating ? "Verifying..." : "Verify & Activate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
