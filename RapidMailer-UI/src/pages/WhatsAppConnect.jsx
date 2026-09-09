import { useState } from "react";
import {
  RiWhatsappLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiRefreshLine,
} from "react-icons/ri";
import { useWhatsApp } from "../context/WhatsAppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
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

const emptyDraft = { label: "", accessToken: "", phoneNumberId: "", wabaId: "" };

// One saved account: view mode shows its status + Test/Edit/Delete; edit
// mode reuses the same field set as the "add new" form below.
const AccountCard = ({ account, onSaved }) => {
  const { testConnection, updateAccount, deleteAccount, testing, saving } = useWhatsApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    label: account.label,
    accessToken: "",
    phoneNumberId: account.phoneNumberId,
    wabaId: account.wabaId,
  });
  const [editingToken, setEditingToken] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleTest = async () => {
    setResult(null);
    const res = await testConnection({ accountId: account.id });
    setResult(res);
  };

  const handleSave = async () => {
    setResult(null);
    const payload = { label: draft.label, phoneNumberId: draft.phoneNumberId, wabaId: draft.wabaId };
    if (editingToken) payload.accessToken = draft.accessToken;
    const res = await updateAccount(account.id, payload);
    setResult(res);
    if (res.ok) {
      setEditing(false);
      setEditingToken(false);
      onSaved?.();
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
            <RiWhatsappLine className="text-lg text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{account.label || "Untitled account"}</h3>
            <p className="text-sm text-slate-400">
              {account.verifiedDisplayName
                ? `"${account.verifiedDisplayName}"${account.verifiedPhoneNumber ? ` · ${account.verifiedPhoneNumber}` : ""}`
                : account.phoneNumberId}
            </p>
          </div>
        </div>
        <Badge tone={account.connected ? "good" : "warn"}>{account.connected ? "Connected" : "Not verified"}</Badge>
      </div>

      {editing ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Account Label"
              value={draft.label}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            />
            <Input
              label="Phone Number ID"
              value={draft.phoneNumberId}
              onChange={(e) => setDraft((d) => ({ ...d, phoneNumberId: e.target.value }))}
            />
            <Input
              label="WhatsApp Business Account ID"
              value={draft.wabaId}
              onChange={(e) => setDraft((d) => ({ ...d, wabaId: e.target.value }))}
            />
          </div>
          <SecretField
            label="Access Token"
            configured={editingToken ? false : true}
            editing={editingToken}
            value={draft.accessToken}
            placeholder="Paste a new token to replace it"
            onStartEdit={() => setEditingToken(true)}
            onCancelEdit={() => {
              setEditingToken(false);
              setDraft((d) => ({ ...d, accessToken: "" }));
            }}
            onChange={(v) => setDraft((d) => ({ ...d, accessToken: v }))}
            onClear={() => setDraft((d) => ({ ...d, accessToken: "" }))}
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
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={handleTest} disabled={testing}>
            <RiRefreshLine />
            {testing ? "Testing..." : "Test Connection"}
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
      )}

      <Banner result={result} />
    </Card>
  );
};

const WhatsAppConnect = () => {
  const { accounts, loading, loadError, saving, testing, addAccount, testConnection } = useWhatsApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [addResult, setAddResult] = useState(null);

  const updateDraft = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const handleTestDraft = async () => {
    setAddResult(null);
    const res = await testConnection(draft);
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
        <PageHeader eyebrow="Connections" title="WhatsApp Accounts" />
        <SectionLoader label="Loading connected accounts..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Connections" title="WhatsApp Accounts" />
        <p className="text-rose-400">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Connections · shared by every WhatsApp tool"
        title="WhatsApp Accounts"
        description="Connect as many WhatsApp Business accounts as you need — one per client or project — using the official WhatsApp Business Cloud API (Meta), not an unofficial QR-linked client. Every WhatsApp tool then lets you pick which connected account to use for that run."
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
              <RiWhatsappLine className="text-lg text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">New WhatsApp Account</h3>
              <p className="text-sm text-slate-400">From your Meta App's WhatsApp &gt; API Setup page.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Account Label"
              placeholder="e.g. Client A - Cafe Chain"
              value={draft.label}
              onChange={(e) => updateDraft("label", e.target.value)}
            />
            <Input
              label="Phone Number ID"
              placeholder="e.g. 123456789012345"
              value={draft.phoneNumberId}
              onChange={(e) => updateDraft("phoneNumberId", e.target.value)}
            />
            <Input
              label="WhatsApp Business Account ID (optional)"
              placeholder="e.g. 987654321000000"
              value={draft.wabaId}
              onChange={(e) => updateDraft("wabaId", e.target.value)}
            />
            <Input
              label="Access Token"
              type="password"
              placeholder="Permanent access token from Meta Business Manager"
              value={draft.accessToken}
              onChange={(e) => updateDraft("accessToken", e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
            <Button variant="secondary" onClick={handleTestDraft} disabled={testing}>
              {testing ? "Testing..." : "Test Connection"}
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
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      ) : (
        !showAddForm && (
          <EmptyState
            icon={RiWhatsappLine}
            title="No WhatsApp accounts connected yet"
            description="Add one above — every WhatsApp tool in RapidMailer will then let you pick it."
          />
        )
      )}

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <RiInformationLine className="text-lg text-violet-300" />
          <h3 className="font-semibold text-white">How to get these values (one-time setup, per account)</h3>
        </div>
        <ol className="flex flex-col gap-2 text-sm text-slate-400 list-none">
          {[
            <>Go to <span className="text-slate-200">developers.facebook.com</span> and create a Meta App (type: Business) — one per client works well, so their data stays separate.</>,
            <>Inside the app, add the <span className="text-slate-200">WhatsApp</span> product.</>,
            <>Under WhatsApp &gt; API Setup, copy the <span className="text-slate-200">Phone Number ID</span> and the{" "}
              <span className="text-slate-200">WhatsApp Business Account ID</span> shown there.</>,
            <>Generate a <span className="text-slate-200">permanent access token</span>: Meta Business Suite &gt; Business Settings &gt; System Users &gt; create a system user, assign it your WhatsApp app, and generate a token with{" "}
              <code className="text-slate-300">whatsapp_business_messaging</code> permission.</>,
            <>Paste everything into "Add Account" above and click "Test Connection", then "Save Account".</>,
            <><span className="text-slate-200">Before sending to real leads</span>: submit at least one message{" "}
              <span className="text-slate-200">template</span> for approval under WhatsApp &gt; Message Templates —
              Meta requires an approved template for any message you send first (i.e. cold outreach). This can take
              a few hours to a day to get approved.</>,
            <>To message real customers (not just Meta's test numbers), you'll also need{" "}
              <span className="text-slate-200">Meta Business verification</span> for that Business Manager account.</>,
          ].map((text, i) => (
            <li key={i} className="flex gap-3">
              <span className="grad-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">{text}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
};

export default WhatsAppConnect;
