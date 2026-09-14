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
        <span className="flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">
          <RiSparklingFill className="text-purple-400" />
          {tier}
        </span>
      );
    }
    if (tier?.includes("Pro")) {
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300">
          <RiShieldCheckLine className="text-cyan-400" />
          {tier}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
        <RiShieldCheckLine className="text-emerald-400" />
        {tier || "Community Edition"}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {actionSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
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
              <h3 className="font-semibold text-white">License & Device Binding</h3>
              <p className="text-sm text-slate-400">
                Hardware machine authorization and commercial tier entitlement status.
              </p>
            </div>
          </div>
          <div>{getTierBadge(license?.tier)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-4">
          {/* Registered Email */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-medium">Registered User</span>
            <span className="text-sm font-semibold text-white truncate">
              {license?.registeredEmail || "support@omniplus.io"}
            </span>
          </div>

          {/* License Key Masked */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-medium">License Key</span>
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-emerald-400">
              <RiLockPasswordLine />
              <span>{license?.maskedKey || "OMNI-••••-••••-9842"}</span>
            </div>
          </div>

          {/* Machine HWID */}
          <div className="col-span-1 md:col-span-2 rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-300">
                <RiCpuLine className="text-lg" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium block">Machine HWID (Hardware Fingerprint)</span>
                <span className="font-mono text-sm font-medium text-slate-200">
                  {license?.hwid || "Detecting hardware..."}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopyHwid}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              {copiedHwid ? (
                <>
                  <RiCheckLine className="text-emerald-400 text-sm" />
                  <span className="text-emerald-300">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <RiFileCopyLine className="text-sm" />
                  <span>Copy HWID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121624] p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white text-base">Activate OmniPlus+ License</h4>
              <button
                onClick={() => setShowActivateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-300">
                {actionError}
              </div>
            )}

            <form onSubmit={handleActivate} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Registered Account Email</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="client@agency.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-accent-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">
                  License Key (e.g. OMNI-SUITE-XXXX-XXXX)
                </label>
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="OMNI-SUITE-9842-8712-4410"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 font-mono text-sm text-white placeholder:text-slate-500 focus:border-accent-400 focus:outline-none"
                  required
                />
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Your license will automatically bind to hardware ID:{" "}
                <span className="font-mono text-slate-300">{license?.hwid}</span>
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
