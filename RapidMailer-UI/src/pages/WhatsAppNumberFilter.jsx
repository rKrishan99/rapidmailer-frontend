import { useEffect, useMemo, useState } from "react";
import {
  RiUpload2Line,
  RiDownloadLine,
  RiFilterLine,
  RiShieldCheckLine,
  RiWhatsappLine,
  RiCloseCircleLine,
  RiFlashlightLine,
} from "react-icons/ri";
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

const MAX_BATCH = 500;

const WhatsAppNumberFilter = () => {
  const { accounts, loading, filtering, filterNumbers } = useWhatsApp();

  const [accountId, setAccountId] = useState("");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [detectedColumn, setDetectedColumn] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const [defaultCountryCode, setDefaultCountryCode] = useState("94");
  const [batchSize, setBatchSize] = useState(30);

  const [submitError, setSubmitError] = useState(null);
  const [filterOutcomes, setFilterOutcomes] = useState(null);

  // Auto-select first account if available
  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

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
    setFilterOutcomes(null);
    event.target.value = "";
  };

  const handleFilter = async () => {
    setSubmitError(null);

    if (!accountId) {
      setSubmitError("Select which linked WhatsApp account to use for the check.");
      return;
    }
    if (rows.length === 0) {
      setSubmitError("Upload a CSV containing a phone number column first.");
      return;
    }

    const recipients = rows.slice(0, MAX_BATCH).map((row) => ({
      ...row,
      phone: getRowPhone(row),
    }));

    const res = await filterNumbers({
      recipients,
      options: {
        accountId,
        defaultCountryCode: defaultCountryCode.trim(),
        batchSize: Number(batchSize) || 30,
      },
    });

    if (!res.ok) {
      setSubmitError(res.message);
      return;
    }

    setFilterOutcomes(res);
  };

  const validLeads = useMemo(() => filterOutcomes?.valid || [], [filterOutcomes]);
  const invalidLeads = useMemo(() => filterOutcomes?.invalid || [], [filterOutcomes]);

  const handleExportValid = () => {
    downloadLeadsCsv(validLeads, `whatsapp_valid_leads_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportInvalid = () => {
    downloadLeadsCsv(invalidLeads, `whatsapp_invalid_numbers_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="WhatsApp Tools" title="WhatsApp Number Filter" />
        <SectionLoader label="Checking linked WhatsApp accounts..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Instant Protocol Lookup · Zero Messages Sent"
        title="WhatsApp Number Filter"
        description="Filter and clean your lead lists instantly using WhatsApp's direct protocol lookup. Verify hundreds of phone numbers in seconds without sending a single message, avoiding spam flags and keeping your outreach 100% deliverable."
      />

      {/* Account Selector */}
      <Card className="flex flex-col gap-3 p-6">
        <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
      </Card>

      {/* CSV File Upload Card */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="whatsapp-filter-csv-input"
            className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
          >
            <RiUpload2Line />
            Choose Leads CSV
          </label>
          <input
            id="whatsapp-filter-csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          {fileName && <span className="text-sm font-medium text-slate-300">{fileName}</span>}
        </div>

        {rows.length > 0 && (
          <p className="text-xs text-slate-400">
            Loaded <strong className="text-slate-200">{rows.length}</strong> phone numbers
            {detectedColumn ? (
              <>
                {" "}
                (detected in <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-violet-300">{detectedColumn}</code>)
              </>
            ) : null}
            {skippedCount > 0 ? ` · ${skippedCount} rows without a usable phone number were excluded.` : "."}
            {rows.length > MAX_BATCH ? ` Only the first ${MAX_BATCH} will be verified in this run.` : ""}
          </p>
        )}
        {showAlert && <span className="text-sm text-rose-400">That CSV file appears to be empty.</span>}
      </Card>

      {/* Configuration & Controls */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-3">
          <div className="grad-ring flex h-10 w-10 items-center justify-center rounded-xl">
            <RiFlashlightLine className="text-xl text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Verification Engine Settings</h3>
            <p className="text-xs text-slate-400">
              High-throughput parallel checking directly against WhatsApp's registered user registry.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Default Country Code (for local numbers starting with 0)"
            placeholder="e.g. 94, 1, 44"
            value={defaultCountryCode}
            onChange={(e) => setDefaultCountryCode(e.target.value)}
          />
          <Input
            label="Batch Size (Concurrent checks per request)"
            type="number"
            min={10}
            max={50}
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
          />
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-300 flex items-start gap-2.5">
          <RiShieldCheckLine className="text-base mt-0.5 shrink-0" />
          <span>
            <strong>100% Risk-Free:</strong> This check uses Baileys' native <code>onWhatsApp()</code> protocol query.
            No message is sent to the recipient's phone, so there is zero risk of being reported as spam or blocked.
          </span>
        </div>

        {submitError && <p className="text-sm text-rose-400">{submitError}</p>}

        <div className="flex justify-end pt-2 border-t border-white/10">
          <Button onClick={handleFilter} disabled={filtering || rows.length === 0 || !accountId}>
            {filtering ? "Verifying Numbers..." : `Filter ${Math.min(rows.length, MAX_BATCH) || 0} Numbers`}
          </Button>
        </div>
      </Card>

      {/* Results View */}
      {filtering ? (
        <SectionLoader label="Verifying numbers via WhatsApp protocol. This takes only a few seconds..." />
      ) : filterOutcomes ? (
        <div className="flex flex-col gap-6">
          {/* Summary Metric Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="flex flex-col gap-1 p-5 border border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Checked</span>
              <span className="text-2xl font-bold text-white">{filterOutcomes.stats?.total || 0}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-5 border border-emerald-500/30 bg-emerald-500/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">On WhatsApp (Valid)</span>
              <span className="text-2xl font-bold text-emerald-300">{validLeads.length}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-5 border border-rose-500/30 bg-rose-500/5">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Invalid / No WhatsApp</span>
              <span className="text-2xl font-bold text-rose-300">{invalidLeads.length}</span>
            </Card>
          </div>

          {/* Valid Leads Section */}
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge tone="good">✓ Active WhatsApp Users</Badge>
                <span className="text-sm text-slate-400">{validLeads.length} verified leads</span>
              </div>
              <Button
                variant="secondary"
                onClick={handleExportValid}
                disabled={validLeads.length === 0}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                <RiDownloadLine />
                Export Clean Valid Leads CSV
              </Button>
            </div>
            <ShowWhatsAppResultsTable data={validLeads} />
          </Card>

          {/* Invalid Numbers Section */}
          {invalidLeads.length > 0 && (
            <Card className="flex flex-col gap-4 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Badge tone="bad">✗ Not on WhatsApp</Badge>
                  <span className="text-sm text-slate-400">{invalidLeads.length} numbers</span>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleExportInvalid}
                >
                  <RiDownloadLine />
                  Export Invalid CSV
                </Button>
              </div>
              <ShowWhatsAppResultsTable data={invalidLeads} />
            </Card>
          )}
        </div>
      ) : (
        <EmptyState
          icon={RiFilterLine}
          title="No verification results yet"
          description="Upload a leads CSV above to verify which contacts have active WhatsApp accounts."
        />
      )}
    </div>
  );
};

export default WhatsAppNumberFilter;
