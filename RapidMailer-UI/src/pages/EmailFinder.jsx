import { useContext, useState } from "react";
import { RiUpload2Line, RiDownloadLine, RiSearchLine } from "react-icons/ri";
import { EmailFinderContext } from "../context/EmailFinderContext";
import { parseLeadsCsv, downloadLeadsCsv } from "../utils/leadCsv";
import ShowEmailFinderTable from "../components/ShowEmailFinderTable";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";

// Mirrors the backend's own /enrich-emails-bulk cap (see emailExtractorRoute.js).
const MAX_BATCH = 300;

const EmailFinder = () => {
  const { leads, loading, error, findEmails } = useContext(EmailFinderContext);
  const [showAlert, setShowAlert] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pendingRowCount, setPendingRowCount] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const rows = await parseLeadsCsv(file);
    if (rows.length === 0) {
      setShowAlert(true);
      event.target.value = "";
      return;
    }
    setShowAlert(false);
    setPendingRowCount(rows.length);
    findEmails(rows.slice(0, MAX_BATCH));
    event.target.value = "";
  };

  const handleExport = () => {
    downloadLeadsCsv(leads, "leads_with_emails.csv");
  };

  const foundCount = leads.filter((l) => l.email).length;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Lead Generation"
        title="Email Finder"
        description="Upload a leads CSV — from the Google Maps tool, or anywhere else — and we'll visit each site to fill in an email column. Every other column passes straight through."
      />

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="lead-csv-input"
            className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
          >
            <RiUpload2Line />
            Choose CSV File
          </label>
          <input
            id="lead-csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          {fileName && <span className="text-sm text-slate-400">{fileName}</span>}
        </div>
        <p className="text-xs text-slate-500">
          The CSV needs a <code className="text-slate-400">website</code> column — the Google Maps
          export already has one. Rows with no website (or "No Website") are left untouched.
        </p>
        {showAlert && (
          <span className="text-sm text-rose-400">That CSV looks empty — please check the file.</span>
        )}
        {pendingRowCount > MAX_BATCH && (
          <span className="text-sm text-amber-400">
            That CSV has {pendingRowCount} leads — only the first {MAX_BATCH} were sent (the site
            visits run one CSV at a time, so split the rest into another upload).
          </span>
        )}
      </Card>

      {loading ? (
        <SectionLoader label="Visiting each website to look for an email address. This can take a moment..." />
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : leads.length > 0 ? (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-slate-400">
            Found an email for {foundCount} of {leads.length} leads.
          </p>
          <ShowEmailFinderTable data={leads} />
          <div className="flex justify-end">
            <Button onClick={handleExport}>
              <RiDownloadLine />
              Export CSV with Emails
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={RiSearchLine}
          title="No leads loaded"
          description="Upload a CSV above to start finding emails."
        />
      )}
    </div>
  );
};

export default EmailFinder;
