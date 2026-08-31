import { useState } from "react";
import {
  RiMailSettingsLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiSendPlaneLine,
} from "react-icons/ri";
import { useEmailAccounts } from "../context/EmailAccountsContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import SecretField from "../components/ui/SecretField";
import { Input } from "../components/ui/Field";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";

function Banner({ result }) {
  if (!result) return null;
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
        result.ok
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-rose-400/30 bg-rose-400/10 text-rose-300"
      }`}
    >
      {result.ok ? <RiCheckLine /> : <RiErrorWarningLine />}
      {result.message}
    </div>
  );
}

const emptyDraft = {
  label: "",
  host: "",
  port: 587,
  secure: false,
  user: "",
  pass: "",
  fromEmail: "",
  fromName: "",
};

const AccountFields = ({ draft, onChange }) => (
  <>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        label="Account Label"
        placeholder="e.g. Main Domain"
        value={draft.label}
        onChange={(e) => onChange("label", e.target.value)}
      />
      <Input
        label="SMTP Host"
        placeholder="smtp.gmail.com"
        value={draft.host}
        onChange={(e) => onChange("host", e.target.value)}
      />
      <Input
        label="SMTP Port"
        type="number"
        placeholder="587"
        value={draft.port}
        onChange={(e) => onChange("port", Number(e.target.value))}
      />
      <div className="flex items-end pb-2.5">
        <Toggle
          checked={draft.secure}
          onChange={(v) => onChange("secure", v)}
          label="Use SSL (secure)"
          description="Enable for port 465, leave off for 587/25"
        />
      </div>
      <Input
        label="SMTP Username"
        placeholder="you@example.com"
        value={draft.user}
        onChange={(e) => onChange("user", e.target.value)}
      />
      <Input
        label="From Email"
        placeholder="contact@yourdomain.com"
        value={draft.fromEmail}
        onChange={(e) => onChange("fromEmail", e.target.value)}
      />
      <Input
        label="From Name"
        placeholder="RapidMailer"
        value={draft.fromName}
        onChange={(e) => onChange("fromName", e.target.value)}
      />
    </div>
  </>
);

// One saved account: view mode shows a summary + Test/Edit/Delete; edit mode
// reuses the same field set as the "add new" form below.
const AccountCard = ({ account, isDefault }) => {
  const { testAccount, updateAccount, deleteAccount, testing, saving } = useEmailAccounts();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    label: account.label,
    host: account.host,
    port: account.port,
    secure: account.secure,
    user: account.user,
    pass: "",
    fromEmail: account.fromEmail,
    fromName: account.fromName,
  });
  const [editingPass, setEditingPass] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [result, setResult] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateDraft = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleTest = async () => {
    setResult(null);
    const res = await testAccount({ accountId: account.id, to: testTo || undefined });
    setResult(res);
  };

  const handleSave = async () => {
    setResult(null);
    const payload = {
      label: draft.label,
      host: draft.host,
      port: draft.port,
      secure: draft.secure,
      user: draft.user,
      fromEmail: draft.fromEmail,
      fromName: draft.fromName,
    };
    if (editingPass) payload.pass = draft.pass;
    const res = await updateAccount(account.id, payload);
    setResult(res);
    if (res.ok) {
      setEditing(false);
      setEditingPass(false);
      setDraft((d) => ({ ...d, pass: "" }));
    }
  };

  const handleDelete = async () => {
    await deleteAccount(account.id);
  };

  return (
    <Card className="flex flex-col gap-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
            <RiMailSettingsLine className="text-lg text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{account.label || "Untitled account"}</h3>
            <p className="text-sm text-slate-400">
              {account.fromName} &lt;{account.fromEmail}&gt; · {account.host}
            </p>
          </div>
        </div>
        {isDefault && <Badge tone="brand">Default sender</Badge>}
      </div>

      {editing ? (
        <div className="flex flex-col gap-4">
          <AccountFields draft={draft} onChange={updateDraft} />
          <SecretField
            label="SMTP Password"
            configured={editingPass ? false : true}
            editing={editingPass}
            value={draft.pass}
            placeholder="App password or SMTP password"
            onStartEdit={() => setEditingPass(true)}
            onCancelEdit={() => {
              setEditingPass(false);
              updateDraft("pass", "");
            }}
            onChange={(v) => updateDraft("pass", v)}
            onClear={() => updateDraft("pass", "")}
          />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              label="Send a test email to"
              placeholder={account.fromEmail}
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              className="max-w-xs"
            />
            <Button variant="secondary" onClick={handleTest} disabled={testing}>
              <RiSendPlaneLine />
              {testing ? "Sending..." : "Send Test"}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <RiEditLine />
              Edit
            </Button>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Remove this account?</span>
                <Button variant="danger" onClick={handleDelete}>
                  Yes, remove
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
        </div>
      )}

      <Banner result={result} />
    </Card>
  );
};

const EmailAccounts = () => {
  const { accounts, loading, loadError, saving, testing, addAccount, testAccount } = useEmailAccounts();

  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [addResult, setAddResult] = useState(null);

  const updateDraft = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleTestDraft = async () => {
    setAddResult(null);
    const res = await testAccount(draft);
    setAddResult(res);
  };

  const handleAdd = async () => {
    setAddResult(null);
    const res = await addAccount(draft);
    setAddResult(res);
    if (res.ok) {
      setDraft(emptyDraft);
      setShowAddForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Connections" title="Email Accounts" />
        <SectionLoader label="Loading email accounts..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Connections" title="Email Accounts" />
        <p className="text-rose-400">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Connections · used to send campaigns"
        title="Email Accounts"
        description="Add as many sender accounts as you need — one per domain or client. When sending a campaign you pick which one to send from; the first account added is used by default."
        actions={
          !showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <RiAddLine />
              Add Account
            </Button>
          )
        }
      />

      {showAddForm && (
        <Card className="flex flex-col gap-5 p-6">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
              <RiMailSettingsLine className="text-lg text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">New Email Account</h3>
              <p className="text-sm text-slate-400">SMTP credentials for sending campaigns.</p>
            </div>
          </div>

          <AccountFields draft={draft} onChange={updateDraft} />
          <Input
            label="SMTP Password"
            type="password"
            placeholder="App password or SMTP password"
            value={draft.pass}
            onChange={(e) => updateDraft("pass", e.target.value)}
          />

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <Button variant="secondary" onClick={handleTestDraft} disabled={testing}>
              {testing ? "Testing..." : "Send Test Email"}
            </Button>
            <Button onClick={handleAdd} disabled={saving}>
              {saving ? "Saving..." : "Save Account"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowAddForm(false);
                setDraft(emptyDraft);
                setAddResult(null);
              }}
            >
              Cancel
            </Button>
          </div>

          <Banner result={addResult} />
        </Card>
      )}

      {accounts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {accounts.map((account, index) => (
            <AccountCard key={account.id} account={account} isDefault={index === 0} />
          ))}
        </div>
      ) : (
        !showAddForm && (
          <EmptyState
            icon={RiMailSettingsLine}
            title="No email accounts configured yet"
            description="Add one above to start sending campaigns and validation results."
          />
        )
      )}

      <Card className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-3">
          <RiInformationLine className="text-lg text-violet-300" />
          <h3 className="font-semibold text-white">Using Gmail?</h3>
        </div>
        <p className="text-sm text-slate-400">
          Gmail requires an <span className="text-slate-200">App Password</span>, not your regular
          password — enable 2-Step Verification on the account, then generate one under Google
          Account &gt; Security &gt; App passwords. Host: <code className="text-slate-300">smtp.gmail.com</code>,
          Port: <code className="text-slate-300">587</code>, SSL off.
        </p>
      </Card>
    </div>
  );
};

export default EmailAccounts;
