import { useEffect, useState } from "react";
import {
  RiWhatsappLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiInformationLine,
} from "react-icons/ri";
import { useWhatsApp } from "../context/WhatsAppContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SecretField from "../components/ui/SecretField";
import { Input } from "../components/ui/Field";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";

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

const WhatsAppConnect = () => {
  const { status, loading, loadError, saving, testing, saveCredentials, testConnection } = useWhatsApp();

  const [editingToken, setEditingToken] = useState(false);
  const [tokenDraft, setTokenDraft] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [saveResult, setSaveResult] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (status) {
      setPhoneNumberId((v) => v || status.phoneNumberId || "");
      setWabaId((v) => v || status.wabaId || "");
    }
  }, [status]);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Connections" title="Connect WhatsApp" />
        <SectionLoader label="Loading connection status..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Connections" title="Connect WhatsApp" />
        <p className="text-rose-400">{loadError}</p>
      </div>
    );
  }

  const handleTestAndSave = async () => {
    setSaveResult(null);
    setTestResult(null);

    const draft = { phoneNumberId, wabaId };
    if (editingToken) draft.accessToken = tokenDraft;

    const test = await testConnection(draft);
    setTestResult(test);
    if (!test.ok) return;

    const save = await saveCredentials(draft);
    setSaveResult(save);
    if (save.ok) {
      setEditingToken(false);
      setTokenDraft("");
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Connections · shared by every WhatsApp tool"
        title="Connect WhatsApp"
        description="Uses the official WhatsApp Business Cloud API (Meta) — not an unofficial QR-linked client. Connect once here; the WhatsApp Bulk Sender (and any future WhatsApp tool) reuses this same connection."
      />

      {status?.connected ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
          <RiCheckLine className="text-lg" />
          <span>
            Connected{status.verifiedDisplayName ? ` as "${status.verifiedDisplayName}"` : ""}
            {status.verifiedPhoneNumber ? ` · ${status.verifiedPhoneNumber}` : ""}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
          <RiErrorWarningLine className="text-lg" />
          Not connected yet — fill in the details below.
        </div>
      )}

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
            <RiWhatsappLine className="text-lg text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">WhatsApp Business Cloud API</h3>
            <p className="text-sm text-slate-400">From your Meta App's WhatsApp &gt; API Setup page.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Phone Number ID"
            placeholder="e.g. 123456789012345"
            value={phoneNumberId}
            onChange={(e) => setPhoneNumberId(e.target.value)}
          />
          <Input
            label="WhatsApp Business Account ID (optional)"
            placeholder="e.g. 987654321000000"
            value={wabaId}
            onChange={(e) => setWabaId(e.target.value)}
          />
        </div>

        <SecretField
          label="Access Token"
          configured={editingToken ? false : status?.accessTokenConfigured}
          editing={editingToken}
          value={tokenDraft}
          placeholder="Permanent access token from Meta Business Manager"
          onStartEdit={() => setEditingToken(true)}
          onCancelEdit={() => {
            setEditingToken(false);
            setTokenDraft("");
          }}
          onChange={setTokenDraft}
          onClear={() => setTokenDraft("")}
        />

        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <Button onClick={handleTestAndSave} disabled={testing || saving}>
            {testing ? "Testing connection..." : saving ? "Saving..." : "Test & Save Connection"}
          </Button>
          <Badge tone="neutral">API version: {status?.apiVersion || "v22.0"}</Badge>
        </div>

        <Banner result={testResult} />
        <Banner result={saveResult} />
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex items-center gap-3">
          <RiInformationLine className="text-lg text-violet-300" />
          <h3 className="font-semibold text-white">How to get these values (one-time setup)</h3>
        </div>
        <ol className="flex flex-col gap-2 text-sm text-slate-400 [counter-reset:step] list-none">
          {[
            <>Go to <span className="text-slate-200">developers.facebook.com</span> and create a Meta App (type: Business).</>,
            <>Inside the app, add the <span className="text-slate-200">WhatsApp</span> product.</>,
            <>Under WhatsApp &gt; API Setup, you'll see a test phone number by default — copy its{" "}
              <span className="text-slate-200">Phone Number ID</span> and the{" "}
              <span className="text-slate-200">WhatsApp Business Account ID</span> shown there.</>,
            <>Generate a <span className="text-slate-200">permanent access token</span>: Meta Business Suite &gt; Business Settings &gt; System Users &gt; create a system user, assign it your WhatsApp app, and generate a token with{" "}
              <code className="text-slate-300">whatsapp_business_messaging</code> permission.</>,
            <>Paste the Phone Number ID, WABA ID and token above and click "Test &amp; Save Connection".</>,
            <><span className="text-slate-200">Before sending to real leads</span>: submit at least one message{" "}
              <span className="text-slate-200">template</span> for approval under WhatsApp &gt; Message Templates —
              Meta requires an approved template for any message you send first (i.e. cold outreach). This can take
              a few hours to a day to get approved.</>,
            <>To message real customers (not just the test numbers Meta gives you during setup), you'll also need to
              complete <span className="text-slate-200">Meta Business verification</span> for your Business Manager
              account.</>,
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
