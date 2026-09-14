import { RiGlobalLine, RiPlugLine, RiInformationLine } from "react-icons/ri";
import Card from "../ui/Card";
import Toggle from "../ui/Toggle";
import SecretField from "../ui/SecretField";

export default function GeneralSettingsView({
  form, setForm, settings,
  editingApiKey, setEditingApiKey,
  apiKeyDraft, setApiKeyDraft,
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Scraping Card */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0">
            <RiGlobalLine className="text-lg" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Lead Scraping Engine
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Controls browser automation behaviour for Google Maps, Google Search, and Web Extractor scrapers.
            </p>
          </div>
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <Toggle
            checked={form.scraping.puppeteerHeadless}
            onChange={(v) => setForm((f) => ({ ...f, scraping: { puppeteerHeadless: v } }))}
            label="Run Headless Mode"
            description="Recommended ON for high performance and low memory. Turn OFF to watch Chromium browser actions during debugging."
          />
        </div>
      </Card>

      {/* Integrations Card */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0">
            <RiPlugLine className="text-lg" />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Integrations & API Keys
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Optional external API keys that unlock higher throughput and elevated rate limits.
            </p>
          </div>
        </div>

        <div className="pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <SecretField
            label="Google PageSpeed Insights API Key"
            configured={editingApiKey ? false : settings.integrations.googlePageSpeedApiKeyConfigured}
            editing={editingApiKey}
            value={apiKeyDraft}
            placeholder="AIzaSy… (Unlocks unlimited Website Audit speed)"
            onStartEdit={() => setEditingApiKey(true)}
            onCancelEdit={() => { setEditingApiKey(false); setApiKeyDraft(""); }}
            onChange={setApiKeyDraft}
            onClear={() => setApiKeyDraft("")}
          />
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Enables high-concurrency Core Web Vitals and performance scoring inside the Bulk Website Audit tool.
          </p>
        </div>
      </Card>

      {/* Info note */}
      <div
        className="flex items-start gap-3 rounded-xl p-4"
        style={{
          border: "1px solid var(--border-subtle)",
          backgroundColor: "var(--bg-surface-2)",
        }}
      >
        <RiInformationLine
          className="text-xl mt-0.5 shrink-0"
          style={{ color: "var(--accent-primary)" }}
        />
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Outreach Channel Setup: </span>
          SMTP mailer accounts live under{" "}
          <a href="/email-accounts" className="underline" style={{ color: "var(--accent-primary)" }}>
            Email Accounts
          </a>
          . Baileys Multi-Device WhatsApp links are configured in{" "}
          <a href="/whatsapp-connect" className="underline" style={{ color: "var(--accent-primary)" }}>
            WhatsApp Accounts
          </a>.
        </p>
      </div>
    </div>
  );
}
