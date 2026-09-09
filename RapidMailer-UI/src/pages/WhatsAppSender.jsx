import { useMemo, useState } from "react";
import {
  RiUpload2Line,
  RiDownloadLine,
  RiWhatsappLine,
  RiInformationLine,
  RiImageLine,
  RiVideoLine,
  RiForbidLine,
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

// Mirrors the backend's own per-request cap.
const MAX_BATCH = 300;

const WhatsAppSender = () => {
  const { loading, sending, results, sendError, sendBulk } = useWhatsApp();

  const [accountId, setAccountId] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [detectedColumn, setDetectedColumn] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const [mode, setMode] = useState("template");
  const [templateName, setTemplateName] = useState("");
  const [templateLanguage, setTemplateLanguage] = useState("en_US");
  const [bodyParamFields, setBodyParamFields] = useState(["", "", ""]);
  const [textMessage, setTextMessage] = useState("");

  // Media header — Meta's official template header types are TEXT / IMAGE /
  // VIDEO / DOCUMENT / LOCATION. RapidMailer supports IMAGE and VIDEO here,
  // supplied as a public link at send time (per Meta's own API shape), which
  // is why it can be either one fixed URL for the whole batch, or a
  // different URL per lead pulled from a CSV column.
  const [headerType, setHeaderType] = useState("none"); // none | image | video
  const [headerSource, setHeaderSource] = useState("fixed"); // fixed | column
  const [headerMediaUrl, setHeaderMediaUrl] = useState("");
  const [headerMediaUrlField, setHeaderMediaUrlField] = useState("");

  const [defaultCountryCode, setDefaultCountryCode] = useState("94");
  const [batchSize, setBatchSize] = useState(5);
  const [delaySeconds, setDelaySeconds] = useState(3);

  const [submitError, setSubmitError] = useState(null);

  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);

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
  };

  const updateBodyParamField = (index, value) => {
    setBodyParamFields((fields) => fields.map((f, i) => (i === index ? value : f)));
  };

  const handleSend = async () => {
    setSubmitError(null);

    if (!accountId) {
      setSubmitError("Pick which connected WhatsApp account to send from.");
      return;
    }
    if (rows.length === 0) {
      setSubmitError("Upload a CSV with a phone number column first.");
      return;
    }
    if (mode === "template" && !templateName.trim()) {
      setSubmitError('Enter the exact name of an approved template (Meta > WhatsApp > Message Templates).');
      return;
    }
    if (mode === "text" && !textMessage.trim()) {
      setSubmitError("Enter a message to send.");
      return;
    }
    if (mode === "template" && headerType !== "none") {
      if (headerSource === "fixed" && !headerMediaUrl.trim()) {
        setSubmitError(`Enter a public ${headerType} URL, or switch to "different per lead" and map a column.`);
        return;
      }
      if (headerSource === "column" && !headerMediaUrlField) {
        setSubmitError(`Pick which CSV column holds the ${headerType} URL for each lead.`);
        return;
      }
    }

    const recipients = rows.slice(0, MAX_BATCH).map((row) => ({ ...row, phone: getRowPhone(row) }));

    const message =
      mode === "template"
        ? {
            mode: "template",
            templateName: templateName.trim(),
            templateLanguage: templateLanguage.trim() || "en_US",
            bodyParamFields: bodyParamFields.filter(Boolean),
            header:
              headerType !== "none"
                ? {
                    type: headerType,
                    ...(headerSource === "column"
                      ? { mediaUrlField: headerMediaUrlField }
                      : { mediaUrl: headerMediaUrl.trim() }),
                  }
                : null,
          }
        : { mode: "text", text: textMessage };

    await sendBulk({
      recipients,
      message,
      settings: {
        accountId,
        batchSize: Number(batchSize) || 5,
        delayMs: (Number(delaySeconds) || 3) * 1000,
        defaultCountryCode,
      },
    });
  };

  const handleExport = () => {
    downloadLeadsCsv(results, "whatsapp_send_results.csv");
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="WhatsApp" title="WhatsApp Bulk Sender" />
        <SectionLoader label="Checking connected accounts..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="WhatsApp"
        title="WhatsApp Bulk Sender"
        description="Upload a lead list (any CSV with a phone-shaped column — Google Maps exports work as-is), then send an approved template message via the official WhatsApp Business API. The result column below IS the number check: WhatsApp's official API has no separate 'has WhatsApp' lookup, so a rejected send (invalid number / not on WhatsApp) is how you find out."
      />

      <Card className="flex flex-col gap-2 p-6">
        <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="whatsapp-csv-input"
            className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
          >
            <RiUpload2Line />
            Choose CSV File
          </label>
          <input
            id="whatsapp-csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          {fileName && <span className="text-sm text-slate-400">{fileName}</span>}
        </div>
        {rows.length > 0 && (
          <p className="text-xs text-slate-500">
            Loaded {rows.length} recipients{detectedColumn ? <> — phone numbers detected in the{" "}
              <code className="text-slate-400">{detectedColumn}</code> column</> : null}
            {skippedCount > 0 ? `. ${skippedCount} row(s) had no usable phone number and were skipped.` : "."}
            {rows.length > MAX_BATCH ? ` Only the first ${MAX_BATCH} will be sent this run.` : ""}
          </p>
        )}
        {showAlert && <span className="text-sm text-rose-400">That CSV looks empty — please check the file.</span>}
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
            <RiWhatsappLine className="text-lg text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Message</h3>
            <p className="text-sm text-slate-400">
              Cold outreach requires an approved <span className="text-slate-300">template</span> — Meta rejects
              plain text sent to someone who hasn't messaged you first. Emoji work anywhere below, no setup needed.
              Polls aren't offered by WhatsApp's official API at all (not here, not in any template) — a CRM tool
              claiming otherwise isn't using this same official API.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("template")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "template" ? "grad-bg text-white" : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
            }`}
          >
            Template (for new leads)
          </button>
          <button
            type="button"
            onClick={() => setMode("text")}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              mode === "text" ? "grad-bg text-white" : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.08]"
            }`}
          >
            Plain text (replies only)
          </button>
        </div>

        {mode === "template" ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Template Name"
                placeholder="e.g. cold_intro_v1"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
              <Input
                label="Template Language Code"
                placeholder="en_US"
                value={templateLanguage}
                onChange={(e) => setTemplateLanguage(e.target.value)}
              />
            </div>

            {headers.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">
                  Map CSV columns to your template's body variables ({"{{1}}"}, {"{{2}}"}, {"{{3}}"})
                </span>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <label key={i} className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-500">{`{{${i + 1}}}`}</span>
                      <select
                        value={bodyParamFields[i]}
                        onChange={(e) => updateBodyParamField(i, e.target.value)}
                        className="rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-400/60"
                      >
                        <option value="">— none —</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <span className="text-sm font-medium text-slate-300">Header media (optional)</span>
                <p className="text-xs text-slate-500">
                  Attach an image or video to the template's header — only if the template itself was created
                  with a matching IMAGE/VIDEO header in Meta Business Manager.
                </p>
              </div>

              <div className="flex gap-2">
                {[
                  { id: "none", label: "None", icon: RiForbidLine },
                  { id: "image", label: "Image", icon: RiImageLine },
                  { id: "video", label: "Video", icon: RiVideoLine },
                ].map((option) => {
                  const OptionIcon = option.icon;
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
                      <OptionIcon />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {headerType !== "none" && (
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setHeaderSource("fixed")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        headerSource === "fixed"
                          ? "bg-violet-500/20 text-violet-200"
                          : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]"
                      }`}
                    >
                      Same {headerType} for everyone
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeaderSource("column")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        headerSource === "column"
                          ? "bg-violet-500/20 text-violet-200"
                          : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.08]"
                      }`}
                    >
                      Different per lead (CSV column)
                    </button>
                  </div>

                  {headerSource === "fixed" ? (
                    <Input
                      label={`Public ${headerType} URL`}
                      placeholder="https://your-site.com/banner.jpg"
                      value={headerMediaUrl}
                      onChange={(e) => setHeaderMediaUrl(e.target.value)}
                    />
                  ) : (
                    <label className="flex flex-col gap-1.5">
                      <span className="text-xs text-slate-500">{`Column holding each lead's ${headerType} URL`}</span>
                      <select
                        value={headerMediaUrlField}
                        onChange={(e) => setHeaderMediaUrlField(e.target.value)}
                        className="rounded-xl bg-white/[0.05] border border-white/10 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-violet-400/60"
                      >
                        <option value="">— choose a column —</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {headerSource === "fixed" && headerMediaUrl.trim() && headerType === "image" && (
                    <img
                      src={headerMediaUrl.trim()}
                      alt="Header preview"
                      className="h-24 w-24 rounded-lg border border-white/10 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <p className="flex items-start gap-2 text-xs text-slate-500">
                    <RiInformationLine className="mt-0.5 shrink-0" />
                    The URL must be publicly reachable over HTTPS (Meta's servers fetch it directly) — your own
                    site, or any host that serves the file with no login wall.
                  </p>
                </div>
              )}
            </div>

            <p className="flex items-start gap-2 text-xs text-slate-500">
              <RiInformationLine className="mt-0.5 shrink-0" />
              Templates are created and approved under Meta &gt; WhatsApp &gt; Message Templates — not in
              RapidMailer. Approval usually takes a few hours.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Textarea
              label="Message"
              rows={4}
              placeholder="Hi! Following up on..."
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
            />
            <p className="flex items-start gap-2 text-xs text-slate-500">
              <RiInformationLine className="mt-0.5 shrink-0" />
              Plain text only delivers to someone who has messaged your WhatsApp number within the last 24 hours —
              it's for replying to leads who reached out, not for a first-contact bulk send.
            </p>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <div>
          <h3 className="font-semibold text-white">Sending Pace</h3>
          <p className="text-sm text-slate-400">
            Slower, smaller batches are safer — sending too fast is the main way WhatsApp Business accounts get
            flagged or restricted.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Default country code (for local-format numbers)"
            placeholder="94"
            value={defaultCountryCode}
            onChange={(e) => setDefaultCountryCode(e.target.value)}
          />
          <Input
            label="Batch size"
            type="number"
            min={1}
            max={20}
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
          />
          <Input
            label="Delay between batches (seconds)"
            type="number"
            min={1}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(e.target.value)}
          />
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
        <SectionLoader label="Sending via WhatsApp Business API. This can take a while at a safe pace..." />
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="good">{results.filter((r) => r.status === "sent").length} accepted</Badge>
            <Badge tone="bad">{results.filter((r) => r.status === "failed").length} rejected</Badge>
          </div>
          <ShowWhatsAppResultsTable data={results} />
          <div className="flex justify-end">
            <Button onClick={handleExport}>
              <RiDownloadLine />
              Export Results CSV
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={RiWhatsappLine}
          title="No sends yet"
          description="Upload a CSV and send a message to see per-recipient results here."
        />
      )}
    </div>
  );
};

export default WhatsAppSender;
