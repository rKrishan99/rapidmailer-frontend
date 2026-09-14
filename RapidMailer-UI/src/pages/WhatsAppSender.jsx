import { useMemo, useState, useRef } from "react";
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
  RiCheckLine,
  RiAlertLine,
  RiBarChartHorizontalLine,
  RiAddLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { useWhatsApp } from "../context/WhatsAppContext";
import { parseLeadsCsv, downloadLeadsCsv } from "../utils/leadCsv";
import ShowWhatsAppResultsTable from "../components/ShowWhatsAppResultsTable";
import WhatsAppAccountSelect from "../components/WhatsAppAccountSelect";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import Select from "../components/ui/Select";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Toggle from "../components/ui/Toggle";
import ExportContactsMenu from "../components/ui/ExportContactsMenu";

const MAX_BATCH = 500;

const PHONE_COLUMN_CANDIDATES = [
  "phone",
  "Phone",
  "phoneNumber",
  "PhoneNumber",
  "phone_number",
  "mobile",
  "Mobile",
  "mobileNumber",
  "contact",
  "Contact",
  "contactNumber",
  "whatsapp",
  "whatsAppNumber",
  "whatsapp_number",
  "tel",
  "Tel",
  "telephone",
  "Telephone",
];

function detectPhoneColumn(columns = []) {
  if (!columns || columns.length === 0) return "";
  for (const candidate of PHONE_COLUMN_CANDIDATES) {
    const found = columns.find((c) => c.toLowerCase() === candidate.toLowerCase());
    if (found) return found;
  }
  const fuzzy = columns.find((c) => {
    const lower = c.toLowerCase();
    return lower.includes("phone") || lower.includes("mobile") || lower.includes("whatsapp") || lower.includes("tel");
  });
  return fuzzy || columns[0] || "";
}

function extractDigits(val) {
  return String(val || "").replace(/\D/g, "");
}

// Helper to preview Spintax and {{variable}} replacement locally in the UI
function previewSpintaxAndVars(text, sampleRow = {}) {
  if (!text) return "";
  let rendered = text.replace(/\{\{\s*([\w.\s-]+?)\s*\}\}/g, (match, field) => {
    const trimmed = field.trim();
    if (sampleRow[trimmed] !== undefined && sampleRow[trimmed] !== null && String(sampleRow[trimmed]).trim() !== "") {
      return String(sampleRow[trimmed]);
    }
    const norm = trimmed.toLowerCase().replace(/[\s_-]+/g, "");
    const found = Object.keys(sampleRow).find((k) => k.toLowerCase().replace(/[\s_-]+/g, "") === norm);
    if (found && sampleRow[found] !== undefined && sampleRow[found] !== null && String(sampleRow[found]).trim() !== "") {
      return String(sampleRow[found]);
    }
    return match;
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
  const [rawRows, setRawRows] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [phoneColumn, setPhoneColumn] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Message Configuration
  const [messageText, setMessageText] = useState(
    "{Hi|Hello|Hey} {{name}},\n\nI noticed your business {{website}} and wanted to reach out regarding our new solution. Would you have 5 minutes this week?\n\nBest regards,"
  );
  const textareaRef = useRef(null);

  // Interactive WhatsApp Poll state
  const [enablePoll, setEnablePoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("Would you be interested in a 5-min demo of our solution?");
  const [pollOptions, setPollOptions] = useState([
    "Yes, please send details 🚀",
    "Schedule a quick call 📞",
    "Not right now 👋",
  ]);
  const [pollMultipleChoice, setPollMultipleChoice] = useState(false);

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

  // Compute valid rows based on the selected phoneColumn
  const { validRows, skippedCount } = useMemo(() => {
    if (!rawRows.length || !phoneColumn) {
      return { validRows: [], skippedCount: 0 };
    }
    const valid = [];
    let skipped = 0;
    for (const r of rawRows) {
      const val = r[phoneColumn];
      const digits = extractDigits(val);
      if (digits.length >= 7) {
        valid.push(r);
      } else {
        skipped++;
      }
    }
    return { validRows: valid, skippedCount: skipped };
  }, [rawRows, phoneColumn]);

  // Sample row for preview
  const sampleRow = useMemo(() => {
    if (validRows[0]) return validRows[0];
    if (rawRows[0]) return rawRows[0];
    return { name: "Alex", website: "acme.com", city: "Colombo" };
  }, [validRows, rawRows]);

  const samplePreview = useMemo(() => {
    return previewSpintaxAndVars(messageText, sampleRow);
  }, [messageText, sampleRow]);

  const samplePollQuestionPreview = useMemo(() => {
    return previewSpintaxAndVars(pollQuestion, sampleRow);
  }, [pollQuestion, sampleRow]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const parsed = await parseLeadsCsv(file);
    if (parsed.length === 0) {
      setShowAlert(true);
      setRawRows([]);
      setCsvColumns([]);
      setPhoneColumn("");
      return;
    }
    setShowAlert(false);

    const cols = Object.keys(parsed[0]);
    const detected = detectPhoneColumn(cols);

    setRawRows(parsed);
    setCsvColumns(cols);
    setPhoneColumn(detected);
    event.target.value = "";
  };

  // Inserts {{variable}} tag at current cursor position in textarea
  const insertVariable = (colName) => {
    const tag = `{{${colName}}}`;
    const el = textareaRef.current;
    if (!el) {
      setMessageText((prev) => `${prev} ${tag}`);
      return;
    }
    const start = el.selectionStart ?? messageText.length;
    const end = el.selectionEnd ?? messageText.length;
    const nextText = messageText.substring(0, start) + tag + messageText.substring(end);
    setMessageText(nextText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  // Poll option helpers
  const handleAddPollOption = () => {
    if (pollOptions.length >= 12) return;
    setPollOptions((prev) => [...prev, `Option ${prev.length + 1}`]);
  };

  const handleUpdatePollOption = (idx, value) => {
    setPollOptions((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleRemovePollOption = (idx) => {
    if (pollOptions.length <= 2) return;
    setPollOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSend = async () => {
    setSubmitError(null);

    if (!accountId) {
      setSubmitError("Select which linked WhatsApp account to send from.");
      return;
    }
    if (validRows.length === 0) {
      setSubmitError("Upload a CSV and select a column containing valid phone numbers.");
      return;
    }

    const hasText = Boolean(messageText && messageText.trim());
    const validPollOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
    const hasValidPoll = enablePoll && pollQuestion.trim() && validPollOptions.length >= 2;

    if (!hasText && !hasValidPoll) {
      setSubmitError("Please enter a message or configure a WhatsApp poll with a question and at least 2 options.");
      return;
    }

    if (enablePoll && (!pollQuestion.trim() || validPollOptions.length < 2)) {
      setSubmitError("Please provide a poll question and at least 2 non-empty options.");
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

    const recipients = validRows.slice(0, MAX_BATCH).map((row) => ({
      ...row,
      phone: String(row[phoneColumn] || "").trim(),
    }));

    const message = {
      mode: "template",
      text: hasText ? messageText : undefined,
      poll: hasValidPoll
        ? {
            question: pollQuestion.trim(),
            options: validPollOptions,
            selectableCount: pollMultipleChoice ? 0 : 1,
          }
        : null,
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
    if (!results || results.length === 0) return;
    downloadLeadsCsv(results, `whatsapp_campaign_results_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="WhatsApp Tools" title="WhatsApp Bulk Sender" />
        <SectionLoader label="Checking linked WhatsApp accounts..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="QR-Linked · Anti-Ban Protected Dispatcher"
        title="WhatsApp Bulk Sender"
        description="Dispatch personalized WhatsApp messages and native interactive polls directly from your linked phone without Meta template restrictions. Built-in human delay emulation, batch pacing, typing presence simulation, and Spintax variability protect your account from spam filters."
      />

      {/* Account Selector */}
      <Card className="flex flex-col gap-3 p-6">
        <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
      </Card>

      {/* CSV Upload & Column Mapping */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
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
            {fileName && (
              <span className="text-sm font-medium text-slate-300 bg-white/[0.05] border border-white/10 px-3 py-1.5 rounded-lg">
                {fileName}
              </span>
            )}
          </div>
          {rawRows.length > 0 && (
            <span className="text-xs text-slate-400">
              {rawRows.length} total rows in CSV
            </span>
          )}
        </div>

        {showAlert && <span className="text-sm text-rose-400">The uploaded CSV appears to be empty.</span>}

        {/* Column Mapping Section */}
        {csvColumns.length > 0 && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                Phone Number Column
              </label>
              <p className="text-xs text-slate-400">
                Select which column holds the recipient WhatsApp phone numbers:
              </p>
              <div className="mt-1 w-full sm:w-72">
                <Select
                  value={phoneColumn}
                  onChange={setPhoneColumn}
                  options={csvColumns}
                  placeholder="Select phone column"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:text-right border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <div className="flex items-center sm:justify-end gap-2 text-sm font-semibold text-emerald-400">
                <RiCheckLine className="text-lg" />
                <span>{validRows.length} valid phone numbers found</span>
              </div>
              {skippedCount > 0 && (
                <p className="text-xs text-amber-400/80">
                  {skippedCount} rows skipped (no valid digits in {phoneColumn})
                </p>
              )}
              {validRows.length > MAX_BATCH && (
                <p className="text-xs text-violet-300">
                  Max batch cap: first {MAX_BATCH} will be sent.
                </p>
              )}
              <div className="mt-2 flex sm:justify-end">
                <ExportContactsMenu rows={validRows} filenamePrefix="wa_audience" />
              </div>
            </div>
          </div>
        )}
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
                Type your message below. Use <code>{`{{column_name}}`}</code> tags to personalize each message with CSV data.
              </p>
            </div>
          </div>
          <Badge tone="brand">No Template Approval Required</Badge>
        </div>

        {/* Clickable Column Variables */}
        {csvColumns.length > 0 && (
          <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Available CSV Variables (click to insert):
              </span>
              <span className="text-[11px] text-slate-500">
                Inserts at cursor position
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {csvColumns.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => insertVariable(col)}
                  className="inline-flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/40 transition-colors"
                >
                  + {`{{${col}}}`}
                </button>
              ))}
              {/* Quick Spintax helper button */}
              <button
                type="button"
                onClick={() => {
                  const tag = "{Hi|Hello|Hey}";
                  const el = textareaRef.current;
                  if (!el) {
                    setMessageText((prev) => `${prev} ${tag}`);
                    return;
                  }
                  const start = el.selectionStart ?? messageText.length;
                  const end = el.selectionEnd ?? messageText.length;
                  setMessageText(messageText.substring(0, start) + tag + messageText.substring(end));
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-colors ml-auto"
                title="Inserts Spintax variation"
              >
                + Spintax {`{Hi|Hello|Hey}`}
              </button>
            </div>
          </div>
        )}

        {/* Textarea */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Message Body (Optional if Poll is attached)
          </label>
          <textarea
            ref={textareaRef}
            rows={5}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Write your message here. E.g. Hello {{name}}, I noticed your business {{website}}..."
            className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-violet-400 transition-colors resize-y"
          />
        </div>

        {/* Interactive WhatsApp Poll Section */}
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/[0.04] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                <RiBarChartHorizontalLine className="text-xl" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Interactive WhatsApp Poll</h4>
                <p className="text-xs text-slate-400">
                  Deliver a native WhatsApp poll in the chat for one-tap lead responses.
                </p>
              </div>
            </div>
            <Toggle checked={enablePoll} onChange={setEnablePoll} label="" />
          </div>

          {enablePoll && (
            <div className="flex flex-col gap-4 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Poll Question / Title (supports <code>{`{{name}}`}</code>)
                </label>
                <Input
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. Would you be interested in a 5-min demo?"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">
                  Poll Options (2 to 12 choices):
                </label>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-xs font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <Input
                        value={opt}
                        onChange={(e) => handleUpdatePollOption(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                      />
                    </div>
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePollOption(idx)}
                        className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Remove option"
                      >
                        <RiDeleteBinLine className="text-base" />
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 12 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200 transition-colors"
                    >
                      <RiAddLine />
                      Add Another Option ({pollOptions.length}/12)
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-300">Allow Multiple Answers</span>
                  <span className="text-[11px] text-slate-500">
                    {pollMultipleChoice ? "Recipients can pick multiple choices" : "Recipients can only pick one single choice"}
                  </span>
                </div>
                <Toggle checked={pollMultipleChoice} onChange={setPollMultipleChoice} label="" />
              </div>
            </div>
          )}
        </div>

        {/* Live Personalization Preview (Lead #1) */}
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <RiSparklingLine className="text-violet-400 text-sm" />
              Live Personalization Preview (Lead #1
              {sampleRow[phoneColumn] ? `: +${sampleRow[phoneColumn]}` : ""})
            </span>
            <span className="text-[11px] text-slate-500">
              Real-time variable &amp; Spintax replacement
            </span>
          </div>

          <div className="flex flex-col gap-3 bg-[#0c0e18] p-4 rounded-xl border border-white/5">
            {/* Message text preview */}
            {samplePreview ? (
              <p className="text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {samplePreview}
              </p>
            ) : null}

            {/* Poll visual preview */}
            {enablePoll && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-3.5 flex flex-col gap-2.5 max-w-sm">
                <div className="flex items-center gap-2">
                  <RiBarChartHorizontalLine className="text-emerald-400 text-sm shrink-0" />
                  <span className="text-xs font-bold text-white">
                    {samplePollQuestionPreview || "Poll Question"}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {pollOptions.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300"
                    >
                      <span className={`h-3 w-3 ${pollMultipleChoice ? "rounded-sm" : "rounded-full"} border border-slate-500 shrink-0`} />
                      <span className="truncate">{previewSpintaxAndVars(opt, sampleRow) || `Option ${i + 1}`}</span>
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400">
                  {pollMultipleChoice ? "Select one or more" : "Select one"} · WhatsApp Interactive Poll
                </span>
              </div>
            )}

            {!samplePreview && !enablePoll && (
              <span className="text-slate-500 italic text-sm">Type a message or enable poll above to see preview...</span>
            )}
          </div>
        </div>

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
                <div className="w-full">
                  <Select
                    value={headerMediaUrlField}
                    onChange={setHeaderMediaUrlField}
                    options={csvColumns}
                    placeholder="— Select CSV column —"
                  />
                </div>
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
        <Button onClick={handleSend} disabled={sending || validRows.length === 0 || !accountId}>
          {sending ? "Sending..." : `Send to ${Math.min(validRows.length, MAX_BATCH) || 0} Recipients`}
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
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="secondary">
                <RiDownloadLine />
                Export Results CSV
              </Button>
              <ExportContactsMenu rows={results} filenamePrefix="wa_campaign" />
            </div>
          </div>
          <ShowWhatsAppResultsTable data={results} />
        </div>
      ) : (
        <EmptyState
          icon={RiWhatsappLine}
          title="No campaigns sent yet"
          description="Upload a CSV, select your phone column, and click send to monitor live delivery progress."
        />
      )}
    </div>
  );
};

export default WhatsAppSender;
