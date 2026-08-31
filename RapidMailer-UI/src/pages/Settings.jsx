import { useEffect, useState } from "react";
import { RiGlobalLine, RiPlugLine, RiCheckLine, RiErrorWarningLine } from "react-icons/ri";
import { useSettings } from "../context/SettingsContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import SecretField from "../components/ui/SecretField";
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
  const { settings, loading, loadError, saving, saveSettings } = useSettings();

  const [form, setForm] = useState(null);
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    if (settings && !form) {
      setForm({
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

  const handleSave = async () => {
    setSaveResult(null);
    const payload = {
      scraping: { ...form.scraping },
      integrations: {},
    };
    if (editingApiKey) payload.integrations.googlePageSpeedApiKey = apiKeyDraft;

    const result = await saveSettings(payload);
    setSaveResult(result);
    if (result.ok) {
      setEditingApiKey(false);
      setApiKeyDraft("");
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="System"
        title="Settings"
        description="Configure how RapidMailer scrapes the web and which integrations it uses. Sender accounts live under Email Accounts, and WhatsApp connections under Connect WhatsApp."
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
