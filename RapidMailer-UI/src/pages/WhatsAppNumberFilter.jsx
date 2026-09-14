import { useMemo, useState, useEffect } from "react";
import {
  RiUpload2Line,
  RiDownloadLine,
  RiWhatsappLine,
  RiCheckLine,
  RiCloseLine,
  RiShieldCheckLine,
  RiFlashlightLine,
} from "react-icons/ri";
import { useWhatsApp } from "../context/WhatsAppContext";
import { parseLeadsCsv, downloadLeadsCsv } from "../utils/leadCsv";
import WhatsAppAccountSelect from "../components/WhatsAppAccountSelect";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import Select from "../components/ui/Select";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
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

const WhatsAppNumberFilter = () => {
  const { accounts, loading, filtering, filterNumbers } = useWhatsApp();

  const [accountId, setAccountId] = useState("");
  const [fileName, setFileName] = useState("");
  const [rawRows, setRawRows] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [phoneColumn, setPhoneColumn] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Filter settings
  const [defaultCountryCode, setDefaultCountryCode] = useState("94");
  const [batchSize, setBatchSize] = useState(30);

  // Result state
  const [filterOutcomes, setFilterOutcomes] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Auto-select first account if available
  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  // Compute valid rows based on selected phoneColumn
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
    setFilterOutcomes(null);
    event.target.value = "";
  };

  const handleFilter = async () => {
    setSubmitError(null);

    if (!accountId) {
      setSubmitError("Select which linked WhatsApp account to use for the check.");
      return;
    }
    if (validRows.length === 0) {
      setSubmitError("Upload a CSV and select a column containing valid phone numbers.");
      return;
    }

    const recipients = validRows.slice(0, MAX_BATCH).map((row) => ({
      ...row,
      phone: String(row[phoneColumn] || "").trim(),
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
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
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

        {showAlert && <span className="text-sm text-rose-400">That CSV file appears to be empty.</span>}

        {/* Column Mapping Section — shown when CSV is loaded */}
        {csvColumns.length > 0 && (
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                Phone Number Column
              </label>
              <p className="text-xs text-slate-400">
                Select which column holds the phone numbers to verify:
              </p>
              <div className="mt-1 w-full sm:w-72">
                <Select
                  value={phoneColumn}
                  onChange={(val) => {
                    setPhoneColumn(val);
                    setFilterOutcomes(null);
                  }}
                  options={csvColumns}
                  placeholder="Select phone column"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:text-right border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
              <div className="flex items-center sm:justify-end gap-2 text-sm font-semibold text-emerald-400">
                <RiCheckLine className="text-lg" />
                <span>{validRows.length} phone numbers ready to check</span>
              </div>
              {skippedCount > 0 && (
                <p className="text-xs text-amber-400/80">
                  {skippedCount} rows skipped (no valid digits in {phoneColumn})
                </p>
              )}
              {validRows.length > MAX_BATCH && (
                <p className="text-xs text-violet-300">
                  Max batch cap: first {MAX_BATCH} will be verified.
                </p>
              )}
            </div>
          </div>
        )}
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

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3 text-xs text-emerald-300 flex items-center gap-2">
          <RiShieldCheckLine className="text-base shrink-0" />
          <span>
            This check uses Baileys' native <code>onWhatsApp()</code> protocol query. No message is sent to the recipient's phone, so there is zero risk of being reported as spam or blocked.
          </span>
        </div>
      </Card>

      {submitError && <p className="text-sm text-rose-400">{submitError}</p>}

      <div className="flex justify-end">
        <Button onClick={handleFilter} disabled={filtering || validRows.length === 0 || !accountId}>
          {filtering ? "Checking Numbers..." : `Filter ${Math.min(validRows.length, MAX_BATCH) || 0} Numbers`}
        </Button>
      </div>

      {filtering && <SectionLoader label="Querying WhatsApp network registry for phone numbers..." />}

      {/* Results View */}
      {filterOutcomes && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge tone="good" className="px-3 py-1 text-sm">
                <RiCheckLine />
                {validLeads.length} Registered on WhatsApp
              </Badge>
              <Badge tone="bad" className="px-3 py-1 text-sm">
                <RiCloseLine />
                {invalidLeads.length} Not on WhatsApp
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleExportValid} disabled={validLeads.length === 0}>
                <RiDownloadLine />
                Export Valid Leads CSV ({validLeads.length})
              </Button>
              <Button variant="secondary" onClick={handleExportInvalid} disabled={invalidLeads.length === 0}>
                <RiDownloadLine />
                Export Invalid CSV ({invalidLeads.length})
              </Button>
              <ExportContactsMenu rows={validLeads} filenamePrefix="wa_valid" />
            </div>
          </div>

          {/* Valid numbers preview table */}
          {validLeads.length > 0 && (
            <Card className="flex flex-col gap-3 p-6">
              <h4 className="text-sm font-semibold text-white">Valid WhatsApp Numbers (Sample)</h4>
              <DataTable
                columns={[
                  {
                    key: "phone",
                    header: "Original Phone",
                    render: (r) => <span className="font-mono text-slate-200">{r.phone}</span>,
                  },
                  {
                    key: "whatsappJid",
                    header: "WhatsApp JID",
                    render: (r) => (
                      <span className="font-mono text-xs text-emerald-300">{r.whatsappJid}</span>
                    ),
                  },
                  {
                    key: "name",
                    header: "Name / Label",
                    render: (r) => r.name || r.businessName || "—",
                  },
                  {
                    key: "whatsappRegistered",
                    header: "Status",
                    render: () => <Badge tone="good">Registered</Badge>,
                  },
                ]}
                data={validLeads.slice(0, 100)}
              />
            </Card>
          )}
        </div>
      )}

      {!filterOutcomes && !filtering && (
        <EmptyState
          icon={RiWhatsappLine}
          title="No verification results yet"
          description="Upload a CSV, select your phone column, and click 'Filter Numbers' to clean your list."
        />
      )}
    </div>
  );
};

export default WhatsAppNumberFilter;
