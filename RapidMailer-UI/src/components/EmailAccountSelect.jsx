import { useNavigate } from "react-router-dom";
import { useEmailAccounts } from "../context/EmailAccountsContext";
import Button from "./ui/Button";

// Shared "which sender account should this send use" picker — RapidMailer
// supports multiple configured SMTP accounts, so campaigns pick one by id
// rather than there being a single global "the" connection.
const EmailAccountSelect = ({ value, onChange }) => {
  const { accounts } = useEmailAccounts();
  const navigate = useNavigate();

  if (accounts.length === 0) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
        <span>No sender accounts configured yet.</span>
        <Button variant="secondary" onClick={() => navigate("/email-accounts")}>
          Add Email Account
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
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label || a.fromEmail} ({a.fromEmail})
          </option>
        ))}
      </select>
    </label>
  );
};

export default EmailAccountSelect;
