import { useNavigate } from "react-router-dom";
import { useWhatsApp } from "../context/WhatsAppContext";
import Button from "./ui/Button";

// Shared "which connected WhatsApp account should this run use" picker —
// used by every WhatsApp tool (Bulk Sender, Number Filter) since RapidMailer
// supports multiple connected accounts (one per client/project) rather than
// a single global connection.
const WhatsAppAccountSelect = ({ value, onChange }) => {
  const { accounts } = useWhatsApp();
  const navigate = useNavigate();

  if (accounts.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
        <span>No WhatsApp accounts connected yet.</span>
        <Button variant="secondary" onClick={() => navigate("/whatsapp-connect")}>
          Connect WhatsApp
        </Button>
      </div>
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-300">Send from account</span>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-400/60"
      >
        <option value="">— choose an account —</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label || a.phoneNumberId}
            {a.connected ? "" : " (not verified)"}
          </option>
        ))}
      </select>
    </label>
  );
};

export default WhatsAppAccountSelect;
