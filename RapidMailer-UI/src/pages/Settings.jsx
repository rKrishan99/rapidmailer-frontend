import { useEffect, useState } from "react";
import {
  RiMailSettingsLine,
  RiGlobalLine,
  RiPlugLine,
  RiSendPlaneLine,
  RiCheckLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { useSettings } from "../context/SettingsContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import SecretField from "../components/ui/SecretField";
import { Input } from "../components/ui/Field";
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

const Settings = () => {
  const { settings, loading, loadError, saving, testingSmtp, saveSettings, testSmtp } = useSettings();

  const [form, setForm] = useState(null);
  const [editingPass, setEditingPass] = useState(false);
  const [passDraft, setPassDraft] = useState("");
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [testTo, setTestTo] = useState("");
  const [saveResult, setSaveResult] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        smtp: {
          host: settings.smtp.host,
          port: settings.smtp.port,
          secure: settings.smtp.secure,
          user: settings.smtp.user,
          fromEmail: settings.smtp.fromEmail,
          fromName: settings.smtp.fromName,
        },
        scraping: { puppeteerHeadless: settings.scraping.puppeteerHeadless },
      });
    }
  }, [settings, form]);

  if (loading || !form) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="System" title="Settings" />
        <SectionLoader label="Loading settings..." />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="System" title="Settings" />
        <p className="text-rose-400">{loadError}</p>
      </div>
    );
  }

  const updateSmtp = (key, value) => setForm((f) => ({ ...f, smtp: { ...f.smtp, [key]: value } }));

  const handleSave = async () => {
    setSaveResult(null);
    const payload = {
      smtp: { ...form.smtp },
      scraping: { ...form.scraping },
      integrations: {},
    };
    if (editingPass) payload.smtp.pass = passDraft;
    if (editingApiKey) payload.integrations.googlePageSpeedApiKey = apiKeyDraft;

    const result = await saveSettings(payload);
    setSaveResult(result);
    if (result.ok) {
      setEditingPass(false);
      setEditingApiKey(false);
      setPassDraft("");
      setApiKeyDraft("");
    }
  };

  const handleTestSmtp = async () => {
    setTestResult(null);
    const draftSmtp = { ...form.smtp };
    if (editingPass) draftSmtp.pass = passDraft;
    const result = await testSmtp({ smtp: draftSmtp, to: testTo || form.smtp.fromEmail });
    setTestResult(result);
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configure the credentials and integrations RapidMailer uses to send campaigns and scrape the web."
        actions={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        }
      />

      <Banner result={saveResult} />

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
            <RiMailSettingsLine className="text-lg text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Email Sending (SMTP)</h3>
            <p className="text-sm text-slate-400">Used to send your campaigns and email validation results.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="SMTP Host" placeholder="smtp.gmail.com" value={form.smtp.host} onChange={(e) => updateSmtp("host", e.target.value)} />
          <Input
            label="SMTP Port"
            type="number"
            placeholder="587"
            value={form.smtp.port}
            onChange={(e) => updateSmtp("port", Number(e.target.value))}
          />
          <Input label="SMTP Username" placeholder="you@example.com" value={form.smtp.user} onChange={(e) => updateSmtp("user", e.target.value)} />
          <div className="flex items-end pb-2.5">
            <Toggle
              checked={form.smtp.secure}
              onChange={(v) => updateSmtp("secure", v)}
              label="Use SSL (secure)"
              description="Enable for port 465, leave off for 587/25"
            />
          </div>
          <Input
            label="From Email"
            placeholder="contact@yourdomain.com"
            value={form.smtp.fromEmail}
            onChange={(e) => updateSmtp("fromEmail", e.target.value)}
          />
          <Input label="From Name" placeholder="RapidMailer" value={form.smtp.fromName} onChange={(e) => updateSmtp("fromName", e.target.value)} />
        </div>

        <SecretField
          label="SMTP Password"
          configured={editingPass ? false : settings.smtp.passConfigured}
          editing={editingPass}
          value={passDraft}
          placeholder="App password or SMTP password"
          onStartEdit={() => setEditingPass(true)}
          onCancelEdit={() => {
            setEditingPass(false);
            setPassDraft("");
          }}
          onChange={setPassDraft}
          onClear={() => setPassDraft("")}
        />

        <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              label="Send a test email to"
              placeholder={form.smtp.fromEmail || "you@example.com"}
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              className="max-w-xs"
            />
            <Button type="button" variant="secondary" onClick={handleTestSmtp} disabled={testingSmtp}>
              <RiSendPlaneLine />
              {testingSmtp ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
          <Banner result={testResult} />
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
            <RiGlobalLine className="text-lg text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Lead Scraping</h3>
            <p className="text-sm text-slate-400">Controls how the Google Maps and Web Search scrapers run.</p>
          </div>
        </div>

        <Toggle
          checked={form.scraping.puppeteerHeadless}
          onChange={(v) => setForm((f) => ({ ...f, scraping: { puppeteerHeadless: v } }))}
          label="Run headless"
          description="Keep this on for servers without a display. Turn it off locally if you want to watch the scraper work."
        />
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
            <RiPlugLine className="text-lg text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Integrations</h3>
            <p className="text-sm text-slate-400">Optional API keys that unlock higher rate limits.</p>
          </div>
        </div>

        <SecretField
          label="Google PageSpeed API Key"
          configured={editingApiKey ? false : settings.integrations.googlePageSpeedApiKeyConfigured}
          editing={editingApiKey}
          value={apiKeyDraft}
          placeholder="Optional — raises Website Audit's rate limit"
          onStartEdit={() => setEditingApiKey(true)}
          onCancelEdit={() => {
            setEditingApiKey(false);
            setApiKeyDraft("");
          }}
          onChange={setApiKeyDraft}
          onClear={() => setApiKeyDraft("")}
        />
      </Card>
    </div>
  );
};

export default Settings;
