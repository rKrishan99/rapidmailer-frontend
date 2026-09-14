import { useEffect, useState } from "react";
import {
  RiSettings3Line,
  RiPaletteLine,
  RiKey2Line,
  RiHeartPulseLine,
  RiCheckLine,
  RiErrorWarningLine,
} from "react-icons/ri";
import { useSettings } from "../context/SettingsContext";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import GeneralSettingsView from "../components/settings/GeneralSettingsView";
import AppearanceView from "../components/settings/AppearanceView";
import LicenseView from "../components/settings/LicenseView";
import DiagnosticsView from "../components/settings/DiagnosticsView";
import { APP_NAME } from "../constants/branding";

const TABS = [
  { id: "general",     label: "General & Scraping",    icon: RiSettings3Line },
  { id: "appearance",  label: "Appearance & Themes",   icon: RiPaletteLine },
  { id: "license",     label: "License & Plan",        icon: RiKey2Line },
  { id: "diagnostics", label: "Diagnostics & Logs",    icon: RiHeartPulseLine },
];

function Banner({ result }) {
  if (!result) return null;
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"
      style={{
        border: `1px solid ${result.ok ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
        backgroundColor: result.ok ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
        color: result.ok ? "#34d399" : "#f87171",
      }}
    >
      {result.ok ? <RiCheckLine /> : <RiErrorWarningLine />}
      {result.message}
    </div>
  );
}

const Settings = () => {
  const { settings, loading, loadError, saving, saveSettings } = useSettings();

  const [activeTab, setActiveTab] = useState("general");
  const [form, setForm] = useState(null);
  const [editingApiKey, setEditingApiKey] = useState(false);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    if (settings && !form) {
      setForm({ scraping: { puppeteerHeadless: settings.scraping.puppeteerHeadless } });
    }
  }, [settings, form]);

  if (loading || !form) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="System" title="Settings" />
        <SectionLoader label="Loading enterprise settings…" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="System" title="Settings" />
        <p style={{ color: "#f87171" }}>{loadError}</p>
      </div>
    );
  }

  const handleSaveGeneral = async () => {
    setSaveResult(null);
    const payload = { scraping: { ...form.scraping }, integrations: {} };
    if (editingApiKey) payload.integrations.googlePageSpeedApiKey = apiKeyDraft;
    const result = await saveSettings(payload);
    setSaveResult(result);
    if (result.ok) { setEditingApiKey(false); setApiKeyDraft(""); }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10 max-w-7xl mx-auto w-full">
      <PageHeader
        eyebrow="System Hub"
        title="Settings"
        description={`Manage scraping execution, visual ergonomic themes, device licensing, and 90-day diagnostic telemetry for ${APP_NAME}.`}
        actions={
          activeTab === "general" ? (
            <Button onClick={handleSaveGeneral} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          ) : null
        }
      />

      <Banner result={saveResult} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Vertical sub-nav */}
        <aside className="lg:col-span-3 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer shrink-0 text-left"
                style={{
                  backgroundColor: active ? "var(--bg-surface)" : "transparent",
                  color: active ? "var(--text-primary)" : "var(--text-secondary)",
                  border: `1px solid ${active ? "var(--border-emphasis)" : "transparent"}`,
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = "var(--bg-surface-2)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <Icon
                  className="text-lg shrink-0"
                  style={{ color: active ? "var(--accent-primary)" : "var(--text-muted)" }}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Tab content */}
        <main className="lg:col-span-9 w-full">
          {activeTab === "general" && (
            <GeneralSettingsView
              form={form}
              setForm={setForm}
              settings={settings}
              editingApiKey={editingApiKey}
              setEditingApiKey={setEditingApiKey}
              apiKeyDraft={apiKeyDraft}
              setApiKeyDraft={setApiKeyDraft}
            />
          )}
          {activeTab === "appearance"  && <AppearanceView />}
          {activeTab === "license"     && <LicenseView />}
          {activeTab === "diagnostics" && <DiagnosticsView />}
        </main>
      </div>
    </div>
  );
};

export default Settings;
