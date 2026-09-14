import { RiGlobalLine, RiPlugLine, RiCpuLine, RiInformationLine } from "react-icons/ri";
import Card from "../ui/Card";
import Toggle from "../ui/Toggle";
import SecretField from "../ui/SecretField";

export default function GeneralSettingsView({
  form,
  setForm,
  settings,
  editingApiKey,
  setEditingApiKey,
  apiKeyDraft,
  setApiKeyDraft,
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <RiGlobalLine className="text-lg" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Lead Scraping Engine</h3>
            <p className="text-sm text-slate-400">
              Controls browser automation behavior for Google Maps, Google Search, and Web Extractor scrapers.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <Toggle
            checked={form.scraping.puppeteerHeadless}
            onChange={(v) => setForm((f) => ({ ...f, scraping: { puppeteerHeadless: v } }))}
            label="Run Headless Mode"
            description="Recommended ON for high performance and low memory. Turn OFF if you want to visually observe Chromium browser actions during debugging."
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white">
            <RiPlugLine className="text-lg" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Integrations & API Keys</h3>
            <p className="text-sm text-slate-400">
              Optional external API keys that unlock higher throughput and elevated rate limits.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <SecretField
            label="Google PageSpeed Insights API Key"
            configured={editingApiKey ? false : settings.integrations.googlePageSpeedApiKeyConfigured}
            editing={editingApiKey}
            value={apiKeyDraft}
            placeholder="AIzaSy... (Unlocks unlimited Website Audit speed)"
            onStartEdit={() => setEditingApiKey(true)}
            onCancelEdit={() => {
              setEditingApiKey(false);
              setApiKeyDraft("");
            }}
            onChange={setApiKeyDraft}
            onClear={() => setApiKeyDraft("")}
          />
          <p className="mt-2 text-xs text-slate-500">
            Enables high-concurrency Core Web Vitals and performance scoring inside the Bulk Website Audit tool.
          </p>
        </div>
      </Card>

      <Card className="flex flex-col gap-4 p-6 border-cyan-500/20 bg-cyan-500/5">
        <div className="flex items-start gap-3">
          <RiInformationLine className="text-xl text-cyan-400 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <span className="font-semibold text-cyan-300">Outreach Channel Setup:</span> SMTP mailer accounts live under{" "}
            <a href="/email-accounts" className="underline hover:text-white">Email Accounts</a>. Baileys Multi-Device WhatsApp links are configured in{" "}
            <a href="/whatsapp-connect" className="underline hover:text-white">WhatsApp Accounts</a>.
          </div>
        </div>
      </Card>
    </div>
  );
}
