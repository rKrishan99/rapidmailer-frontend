import { useEffect, useMemo, useRef, useState } from "react";
import { RiUpload2Line, RiDownloadLine, RiFilterLine, RiInformationLine } from "react-icons/ri";
import { useWhatsApp } from "../context/WhatsAppContext";
import { parseLeadsCsv, downloadLeadsCsv, getRowPhone, getRowPhoneColumn } from "../utils/leadCsv";
import ShowWhatsAppResultsTable from "../components/ShowWhatsAppResultsTable";
import WhatsAppAccountSelect from "../components/WhatsAppAccountSelect";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";

// Mirrors the backend's own per-request cap.
const MAX_BATCH = 300;

// There is no separate "check" endpoint on the official WhatsApp API (see
// the note in the page description below) — this tool runs the exact same
// send-attempt as the Bulk Sender, using a lightweight approved template,
// and simply presents the outcome as a filtered list rather than a
// campaign result. It needs its own approved template just like the
// sender does.
const WhatsAppNumberFilter = () => {
  const { loading, sendBulkRaw } = useWhatsApp();

  const [accountId, setAccountId] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [detectedColumn, setDetectedColumn] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const [templateName, setTemplateName] = useState("");
  const [templateLanguage, setTemplateLanguage] = useState("en_US");
  const [bodyParamFields, setBodyParamFields] = useState(["", "", ""]);

  const [defaultCountryCode, setDefaultCountryCode] = useState("94");
  const [batchSize, setBatchSize] = useState(5);
  const [delaySeconds, setDelaySeconds] = useState(3);

  const [submitError, setSubmitError] = useState(null);
  const [filtering, setFiltering] = useState(false);
  const [results, setResults] = useState([]);

  // The check can take a while (real WhatsApp sends, paced out) — if the
  // user navigates away before it resolves, don't setState on an unmounted
  // component. The send itself still completes server-side either way;
  // this just avoids updating a page that's no longer showing.
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows]);
  const onWhatsapp = useMemo(() => results.filter((r) => r.status === "sent"), [results]);
  const notOnWhatsapp = useMemo(() => results.filter((r) => r.status === "failed"), [results]);

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
    setResults([]);
    event.target.value = "";
  };

  const updateBodyParamField = (index, value) => {
    setBodyParamFields((fields) => fields.map((f, i) => (i === index ? value : f)));
  };

  const handleFilter = async () => {
    setSubmitError(null);

    if (!accountId) {
      setSubmitError("Pick which connected WhatsApp account to send the check from.");
      return;
    }
    if (rows.length === 0) {
      setSubmitError("Upload a CSV with a phone number column first.");
      return;
    }
    if (!templateName.trim()) {
      setSubmitError('Enter the exact name of an approved template (Meta > WhatsApp > Message Templates).');
      return;
    }

    const recipients = rows.slice(0, MAX_BATCH).map((row) => ({ ...row, phone: getRowPhone(row) }));

    setFiltering(true);
    const res = await sendBulkRaw({
      recipients,
      message: {
        mode: "template",
        templateName: templateName.trim(),
        templateLanguage: templateLanguage.trim() || "en_US",
        bodyParamFields: bodyParamFields.filter(Boolean),
      },
      settings: {
        accountId,
        batchSize: Number(batchSize) || 5,
        delayMs: (Number(delaySeconds) || 3) * 1000,
        defaultCountryCode,
      },
    });
    if (!isMountedRef.current) return;
    setFiltering(false);

    if (!res.ok) {
      setSubmitError(res.message);
      return;
    }
    setResults(res.results);
  };

  const handleExport = (list, filename) => downloadLeadsCsv(list, filename);

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="WhatsApp" title="WhatsApp Number Filter" />
        <SectionLoader label="Checking connected accounts..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="WhatsApp"
        title="WhatsApp Number Filter"
        description={
          'Splits a lead list into "on WhatsApp" and "not on WhatsApp / invalid". The official WhatsApp API has ' +
          "no standalone lookup for this — it only reveals a number's status when you attempt to message it — so " +
          "this runs a real (approved-template) send attempt and sorts the result. It uses the same account and " +
          'template setup as the Bulk Sender; run this first on a fresh list, then send your real campaign only ' +
          'to the numbers that came back "on WhatsApp".'
        }
      />

      <Card className="flex flex-col gap-2 p-6">
        <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
      </Card>

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="whatsapp-filter-csv-input"
            className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
          >
            <RiUpload2Line />
            Choose CSV File
          </label>
          <input
            id="whatsapp-filter-csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          {fileName && <span className="text-sm text-slate-400">{fileName}</span>}
        </div>
        {rows.length > 0 && (
          <p className="text-xs text-slate-500">
            Loaded {rows.length} numbers{detectedColumn ? <> — detected in the{" "}
              <code className="text-slate-400">{detectedColumn}</code> column</> : null}
            {skippedCount > 0 ? `. ${skippedCount} row(s) had no usable phone number and were skipped.` : "."}
            {rows.length > MAX_BATCH ? ` Only the first ${MAX_BATCH} will be checked this run.` : ""}
          </p>
        )}
        {showAlert && <span className="text-sm text-rose-400">That CSV looks empty — please check the file.</span>}
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
            <RiFilterLine className="text-lg text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Check Template</h3>
            <p className="text-sm text-slate-400">
              A short, approved template — this is what actually gets sent as the "is this number reachable" probe.
            </p>
          </div>
        </div>

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

        <p className="flex items-start gap-2 text-xs text-slate-500">
          <RiInformationLine className="mt-0.5 shrink-0" />
          Every number here gets a real message — a "not on WhatsApp" result costs nothing extra, but a valid one
          actually receives this template, so keep it short and relevant (a "checking in" style message works well
          since it doubles as a legitimate first touch).
        </p>
      </Card>

      <Card className="flex flex-col gap-5 p-6">
        <div>
          <h3 className="font-semibold text-white">Sending Pace</h3>
          <p className="text-sm text-slate-400">Same safety controls as the Bulk Sender.</p>
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

      <div className="flex justify-end">
        <Button onClick={handleFilter} disabled={filtering || rows.length === 0 || !accountId}>
          {filtering ? "Checking..." : `Check ${Math.min(rows.length, MAX_BATCH) || 0} Numbers`}
        </Button>
      </div>

      {filtering ? (
        <SectionLoader label="Checking numbers via WhatsApp Business API. This can take a while at a safe pace..." />
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge tone="good">On WhatsApp</Badge>
                <span className="text-sm text-slate-400">{onWhatsapp.length} number(s)</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleExport(onWhatsapp, "whatsapp_numbers_valid.csv")}
                disabled={onWhatsapp.length === 0}
              >
                <RiDownloadLine />
                Export Valid CSV
              </Button>
            </div>
            <ShowWhatsAppResultsTable data={onWhatsapp} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge tone="bad">Not on WhatsApp / Invalid</Badge>
                <span className="text-sm text-slate-400">{notOnWhatsapp.length} number(s)</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleExport(notOnWhatsapp, "whatsapp_numbers_invalid.csv")}
                disabled={notOnWhatsapp.length === 0}
              >
                <RiDownloadLine />
                Export Invalid CSV
              </Button>
            </div>
            <ShowWhatsAppResultsTable data={notOnWhatsapp} />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={RiFilterLine}
          title="No results yet"
          description="Upload a CSV and run a check to see the split here."
        />
      )}
    </div>
  );
};

export default WhatsAppNumberFilter;
