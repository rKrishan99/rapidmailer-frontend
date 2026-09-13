import { useMemo, useState } from "react";
import {
  RiUpload2Line,
  RiDownloadLine,
  RiWhatsappLine,
  RiInformationLine,
  RiImageLine,
  RiVideoLine,
  RiForbidLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiSparklingLine,
  RiFileTextLine,
  RiEdit2Line,
} from "react-icons/ri";
import { useWhatsApp } from "../context/WhatsAppContext";
import { parseLeadsCsv, downloadLeadsCsv, getRowPhone, getRowPhoneColumn } from "../utils/leadCsv";
import ShowWhatsAppResultsTable from "../components/ShowWhatsAppResultsTable";
import WhatsAppAccountSelect from "../components/WhatsAppAccountSelect";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Toggle from "../components/ui/Toggle";

const MAX_BATCH = 500;

/** Column names we treat as per-lead custom messages (case-insensitive) */
const CSV_MSG_COLUMNS = ["message", "custom_message", "pitch"];

/** Detect which (if any) message column a CSV row has */
function detectMessageColumn(row) {
  if (!row) return null;
  const keys = Object.keys(row);
  return keys.find((k) => CSV_MSG_COLUMNS.includes(k.toLowerCase().replace(/\s/g, "_"))) || null;
}

// Helper to preview Spintax locally in the UI
function previewSpintaxAndVars(text, sampleRow = {}) {
  if (!text) return "";
  let rendered = text.replace(/\{\{\s*([\w.\s-]+?)\s*\}\}/g, (match, field) => {
    const val = sampleRow[field.trim()];
    return val !== undefined && val !== null ? String(val) : match;
  });
  // Sample spintax resolution (pick first option)
  const spintaxRegex = /\{([^{}]+)\}/g;
  return rendered.replace(spintaxRegex, (match, optionsStr) => {
    const options = optionsStr.split("|");
    return options[0] || match;
  });
}

const WhatsAppSender = () => {
  const { accounts, loading, sending, results, sendError, sendBulk } = useWhatsApp();

  const [accountId, setAccountId] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [detectedColumn, setDetectedColumn] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  // Message mode: "template" (Mode A) | "custom_csv" (Mode B)
  const [messageMode, setMessageMode] = useState("template");
  const [detectedMsgColumn, setDetectedMsgColumn] = useState(null); // column name if found in CSV

  // Message Configuration (Free-form, no template approvals!)
  const [messageText, setMessageText] = useState(
    "{Hi|Hello|Hey} {{name}},\n\nI noticed your business {{website}} and wanted to reach out regarding our new solution. Would you have 5 minutes this week?\n\nBest regards,"
  );

  // Media attachment
  const [headerType, setHeaderType] = useState("none"); // none | image | video
  const [headerSource, setHeaderSource] = useState("fixed"); // fixed | column
  const [headerMediaUrl, setHeaderMediaUrl] = useState("");
  const [headerMediaUrlField, setHeaderMediaUrlField] = useState("");

  // Anti-Ban Safeguards & Pacing
  const [defaultCountryCode, setDefaultCountryCode] = useState("94");
  const [minDelay, setMinDelay] = useState(10);
  const [maxDelay, setMaxDelay] = useState(25);
  const [batchSize, setBatchSize] = useState(15);
  const [cooldownSeconds, setCooldownSeconds] = useState(90);
  const [simulatePresence, setSimulatePresence] = useState(true);

  const [submitError, setSubmitError] = useState(null);

  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);
  const samplePreview = useMemo(
    () => previewSpintaxAndVars(messageText, rows[0] || { name: "Alex", website: "acme.com" }),
    [messageText, rows]
  );

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const parsed = await parseLeadsCsv(file);
    if (parsed.length === 0) {
      setShowAlert(true);
      setRows([]);
      return;
    }
    setShowAlert(false);

    const withPhone = parsed.filter((row) => getRowPhone(row));
    setSkippedCount(parsed.length - withPhone.length);
    setDetectedColumn(withPhone[0] ? getRowPhoneColumn(withPhone[0]) : null);
    setRows(withPhone);
    event.target.value = "";

    // Auto-detect message column and switch to Mode B if found
    const msgCol = detectMessageColumn(withPhone[0]);
    setDetectedMsgColumn(msgCol);
    if (msgCol) {
      setMessageMode("custom_csv");
    } else {
      setMessageMode("template");
    }
  };

  const handleSend = async () => {
    setSubmitError(null);

    if (!accountId) {
      setSubmitError("Select which linked WhatsApp account to send from.");
      return;
    }
    if (rows.length === 0) {
      setSubmitError("Upload a CSV with a phone number column first.");
      return;
    }
    if (messageMode !== "custom_csv" && !messageText.trim()) {
      setSubmitError("Please enter a message to send.");
      return;
    }
    if (headerType !== "none") {
      if (headerSource === "fixed" && !headerMediaUrl.trim()) {
        setSubmitError(`Please enter a valid ${headerType} URL.`);
        return;
      }
      if (headerSource === "column" && !headerMediaUrlField) {
        setSubmitError(`Select which column holds the ${headerType} URL.`);
        return;
      }
    }

    const recipients = rows.slice(0, MAX_BATCH).map((row) => ({
      ...row,
      phone: getRowPhone(row),
    }));

    const message = {
      mode: messageMode,
      text: messageMode === "template" ? messageText : undefined,
      media:
        headerType !== "none"
          ? {
              type: headerType,
              ...(headerSource === "column"
                ? { urlField: headerMediaUrlField }
                : { url: headerMediaUrl.trim() }),
            }
          : null,
    };

    await sendBulk({
      recipients,
      message,
      settings: {
        accountId,
        defaultCountryCode: defaultCountryCode.trim(),
        minDelaySeconds: Number(minDelay) || 10,
        maxDelaySeconds: Number(maxDelay) || 25,
        cooldownAfterCount: Number(batchSize) || 15,
        cooldownSeconds: Number(cooldownSeconds) || 90,
        simulatePresence,
      },
    });
  };

  const handleExport = () => {
    downloadLeadsCsv(results, `whatsapp_campaign_report_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="WhatsApp Tools" title="WhatsApp Bulk Sender" />
        <SectionLoader label="Loading connected WhatsApp accounts..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="QR-Linked · Anti-Ban Protected Dispatcher"
        title="WhatsApp Bulk Sender"
        description="Dispatch personalized WhatsApp messages directly from your linked phone without Meta template restrictions. Built-in human delay emulation, batch pacing, typing presence simulation, and Spintax variability protect your account from spam filters."
      />

      {/* Account Selector */}
      <Card className="flex flex-col gap-3 p-6">
        <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
      </Card>

      {/* CSV Upload */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="whatsapp-bulk-csv-input"
            className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
          >
            <RiUpload2Line />
            Choose Leads CSV
          </label>
          <input
            id="whatsapp-bulk-csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          {fileName && <span className="text-sm font-medium text-slate-300">{fileName}</span>}
        </div>
        {rows.length > 0 && (
          <p className="text-xs text-slate-400">
            Loaded <strong className="text-slate-200">{rows.length}</strong> recipients
            {detectedColumn ? (
              <>
                {" "}
                (phone numbers found in <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-violet-300">{detectedColumn}</code>)
              </>
            ) : null}
            {skippedCount > 0 ? ` · ${skippedCount} rows without valid phone numbers skipped.` : "."}
            {rows.length > MAX_BATCH ? ` Only first ${MAX_BATCH} will be dispatched in this run.` : ""}
          </p>
        )}
        {showAlert && <span className="text-sm text-rose-400">The uploaded CSV appears to be empty.</span>}
      </Card>

      {/* Message Composer */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
              <RiWhatsappLine className="text-xl text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Compose Message</h3>
              <p className="text-xs text-slate-400">
                Full Spintax <code>{`{Hi|Hello|Hey}`}</code> and personalization tags <code>{`{{name}}`}</code> supported.
              </p>
            </div>
          </div>
          <Badge tone="brand">No Template Approval Required</Badge>
        </div>

        {/* Mode A / Mode B toggle */}
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1 w-fit">
          <button
            type="button"
            onClick={() => setMessageMode("template")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              messageMode === "template" ? "grad-bg text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <RiEdit2Line />
            Single Template
          </button>
          <button
            type="button"
            onClick={() => setMessageMode("custom_csv")}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              messageMode === "custom_csv" ? "grad-bg text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <RiFileTextLine />
            1-to-1 CSV Messages
          </button>
        </div>

        {/* Mode B: custom_csv banner */}
        {messageMode === "custom_csv" && (
          <div className="flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/[0.06] px-4 py-3">
            <RiInformationLine className="mt-0.5 shrink-0 text-lg text-violet-400" />
            <div className="text-sm">
              <p className="font-medium text-violet-200">1-to-1 Custom Message Mode active</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Each recipient receives their own personalized message from the{" "}
                <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-violet-300">
                  {detectedMsgColumn || "message"}
                </code>{" "}
                column in your CSV. Spintax <code>{"{A|B}"}</code> within each cell is still resolved.
                {detectedMsgColumn
                  ? ` Column "${detectedMsgColumn}" was auto-detected in your CSV.`
                  : " Upload a CSV that has a message / custom_message / pitch column."}
              </p>
            </div>
          </div>
        )}

        {/* Tag helper pills — only useful in template mode */}
        {messageMode === "template" && headers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Available variables:</span>
            {headers.slice(0, 8).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setMessageText((prev) => `${prev} {{${h}}}`)}
                className="rounded-lg bg-white/[0.06] px-2.5 py-1 text-xs text-violet-300 hover:bg-white/10"
              >
                + {`{{${h}}}`}
              </button>
            ))}
          </div>
        )}

        {/* Textarea — disabled and greyed in Mode B */}
        <div className={messageMode === "custom_csv" ? "opacity-40 pointer-events-none select-none" : ""}>
          <Textarea
            label={messageMode === "custom_csv" ? "Message Body (disabled in 1-to-1 mode)" : "Message Body"}
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write your message here. Use {Option1|Option2} for variation..."
          />
        </div>

        {/* Sample Preview — only in template mode */}
        {messageMode === "template" && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <RiSparklingLine className="text-violet-400" />
              Sample Preview (Row #1)
            </span>
            <p className="text-sm text-slate-200 whitespace-pre-wrap font-sans bg-slate-900/60 p-3 rounded-lg border border-white/5">
              {samplePreview}
            </p>
          </div>
        )}

        {/* Mode B sample: show the actual CSV message value for row 1 */}
        {messageMode === "custom_csv" && rows[0] && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-4 flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <RiSparklingLine className="text-violet-400" />
              Row #1 — CSV Message Preview
            </span>
            <p className="text-sm text-slate-200 whitespace-pre-wrap font-sans bg-slate-900/60 p-3 rounded-lg border border-white/5">
              {rows[0][detectedMsgColumn] ||
                rows[0]["message"] ||
                rows[0]["custom_message"] ||
                rows[0]["pitch"] ||
                <span className="text-rose-400 italic">No message column found in row #1</span>}
            </p>
          </div>
        )}

        {/* Optional Media Header */}
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <span className="text-sm font-medium text-slate-300">Attach Media (Optional)</span>
          <div className="flex gap-2">
            {[
              { id: "none", label: "None", icon: RiForbidLine },
              { id: "image", label: "Image", icon: RiImageLine },
              { id: "video", label: "Video", icon: RiVideoLine },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setHeaderType(option.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    headerType === option.id
                      ? "grad-bg text-white"
                      : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
                  }`}
                >
                  <Icon />
                  {option.label}
                </button>
              );
            })}
          </div>

          {headerType !== "none" && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHeaderSource("fixed")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    headerSource === "fixed" ? "bg-violet-500/20 text-violet-200" : "bg-white/[0.05] text-slate-400"
                  }`}
                >
                  Fixed URL for everyone
                </button>
                <button
                  type="button"
                  onClick={() => setHeaderSource("column")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    headerSource === "column" ? "bg-violet-500/20 text-violet-200" : "bg-white/[0.05] text-slate-400"
                  }`}
                >
                  Per-lead CSV column
                </button>
              </div>

              {headerSource === "fixed" ? (
                <Input
                  label={`Public ${headerType} URL`}
                  placeholder="https://example.com/promo.jpg"
                  value={headerMediaUrl}
                  onChange={(e) => setHeaderMediaUrl(e.target.value)}
                />
              ) : (
                <select
                  value={headerMediaUrlField}
                  onChange={(e) => setHeaderMediaUrlField(e.target.value)}
                  className="rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none"
                >
                  <option value="">— Select CSV column —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Anti-Ban & Pacing Controls */}
      <Card className="flex flex-col gap-5 p-6 border border-emerald-500/20 bg-emerald-500/[0.02]">
        <div className="flex items-center gap-3">
          <RiShieldCheckLine className="text-xl text-emerald-400" />
          <div>
            <h3 className="font-semibold text-white">Anti-Ban Pacing &amp; Safety Controls</h3>
            <p className="text-xs text-slate-400">
              Mimics natural human interaction so WhatsApp does not flag your account.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Default Country Code"
            placeholder="94"
            value={defaultCountryCode}
            onChange={(e) => setDefaultCountryCode(e.target.value)}
          />
          <Input
            label="Min Delay (seconds)"
            type="number"
            min={5}
            value={minDelay}
            onChange={(e) => setMinDelay(e.target.value)}
          />
          <Input
            label="Max Delay (seconds)"
            type="number"
            min={10}
            value={maxDelay}
            onChange={(e) => setMaxDelay(e.target.value)}
          />
          <Input
            label="Cooldown after N messages"
            type="number"
            min={5}
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
          <Toggle
            checked={simulatePresence}
            onChange={setSimulatePresence}
            label="Simulate Typing Presence ('composing' status)"
            description="Shows 'typing...' to the recipient for 2-4 seconds before dispatching the message."
          />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <RiTimeLine className="text-emerald-400" />
            <span>Cooldown: {cooldownSeconds}s pause every {batchSize} sends</span>
          </div>
        </div>
      </Card>

      {submitError && <p className="text-sm text-rose-400">{submitError}</p>}
      {sendError && <p className="text-sm text-rose-400">{sendError}</p>}

      <div className="flex justify-end">
        <Button onClick={handleSend} disabled={sending || rows.length === 0 || !accountId}>
          {sending ? "Sending..." : `Send to ${Math.min(rows.length, MAX_BATCH) || 0} Recipients`}
        </Button>
      </div>

      {sending ? (
        <SectionLoader label="Dispatching messages with anti-ban pacing and realistic typing delays..." />
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge tone="good">{results.filter((r) => r.status === "sent").length} sent</Badge>
              <Badge tone="bad">{results.filter((r) => r.status === "failed").length} failed</Badge>
            </div>
            <Button onClick={handleExport} variant="secondary">
              <RiDownloadLine />
              Export Results CSV
            </Button>
          </div>
          <ShowWhatsAppResultsTable data={results} />
        </div>
      ) : (
        <EmptyState
          icon={RiWhatsappLine}
          title="No campaigns sent yet"
          description="Upload a CSV and click send to monitor live delivery progress."
        />
      )}
    </div>
  );
};

export default WhatsAppSender;
