import { useContext, useMemo, useState } from "react";
import { RiShieldCheckLine, RiSearchLine, RiUpload2Line, RiDownloadLine } from "react-icons/ri";
import DownloadDataBlock from "../components/DownloadDataBlock";
import ShowAuditDataTable from "../components/ShowAuditDataTable";
import { WebsiteAuditContext } from "../context/WebsiteAuditContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import { Textarea } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import { parseLeadsCsv, mergeByWebsite, downloadLeadsCsv, getRowWebsite } from "../utils/leadCsv";

const WebsiteAudit = () => {
  const { results, loading, error, auditSingle, auditBulk } = useContext(WebsiteAuditContext);

  const [csvMode, setCsvMode] = useState(false);
  const [urlsText, setUrlsText] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  // Per the "errors only" pipeline rule: only drop leads whose site we
  // couldn't reach at all. A site that loaded fine but has issues stays in
  // — it's still a lead, just one with a stronger pitch.
  const [dropErrors, setDropErrors] = useState(true);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    const rows = await parseLeadsCsv(file);
    setCsvRows(rows);
    event.target.value = "";
  };

  const handleStart = () => {
    let urls = [];

    if (csvMode) {
      urls = csvRows.map((r) => getRowWebsite(r)).filter(Boolean);
    } else {
      urls = urlsText
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);
    }

    if (urls.length === 0) {
      setShowAlert(true);
      return;
    }

    setShowAlert(false);
    if (urls.length === 1) {
      auditSingle(urls[0]);
    } else {
      auditBulk(urls);
    }
  };

  const csvData = useMemo(
    () =>
      results.map((r) => ({
        url: r.url,
        performanceScore: r.error ? "" : r.performance?.performanceScore ?? "",
        sslValid: r.error ? "" : r.security?.ssl?.valid ?? "",
        missingSecurityHeaders: r.error ? "" : (r.security?.missingHeaders || []).join("; "),
        exposedFiles: r.error ? "" : (r.security?.exposedFiles || []).join("; "),
        wordpressVersion: r.error ? "" : r.security?.wordpress?.detectedVersion || "",
        wordpressOutdated: r.error ? "" : r.security?.wordpress?.outdated ?? "",
        hasSitemapXml: r.error ? "" : r.seo?.hasSitemapXml ?? "",
        hasRobotsTxt: r.error ? "" : r.seo?.hasRobotsTxt ?? "",
        metaDescription: r.error ? "" : r.seo?.metaDescription || "",
        outreachSummary: r.error ? "" : r.outreachSummary || "",
        error: r.error || "",
      })),
    [results]
  );

  // In CSV mode, fold the audit data back onto the original full lead rows.
  const mergedRows = useMemo(() => {
    if (!csvMode || csvRows.length === 0 || csvData.length === 0) return [];
    const auditUpdates = csvData.map((r) => ({ ...r, auditError: r.error }));
    return mergeByWebsite(csvRows, auditUpdates);
  }, [csvMode, csvRows, csvData]);

  const exportRows = dropErrors ? mergedRows.filter((r) => !r.auditError) : mergedRows;
  const droppedCount = mergedRows.length - exportRows.length;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Website Intel"
        title="Bulk Website Audit"
        description="Paste websites, or upload a leads CSV — we'll check performance (Google PageSpeed), security (SSL, headers, exposed files) and SEO/technical basics, then write a ready-to-use outreach summary for each site."
      />

      <Card className="flex flex-col gap-4 p-6">
        <Toggle
          checked={csvMode}
          onChange={setCsvMode}
          label="Upload a CSV instead of pasting URLs"
          description="Audit results are merged back onto every original column and exported as one CSV."
        />

        {csvMode ? (
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="audit-csv-input"
              className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
            >
              <RiUpload2Line />
              Choose CSV File
            </label>
            <input
              id="audit-csv-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            {csvFileName && (
              <span className="text-sm text-slate-400">
                {csvFileName} ({csvRows.length} rows)
              </span>
            )}
          </div>
        ) : (
          <Textarea
            placeholder={"example.com\nanother-site.com\nyetanother.com"}
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            className="h-32 w-full max-w-xl"
          />
        )}

        <div>
          <Button onClick={handleStart}>
            <RiSearchLine />
            Run Audit
          </Button>
        </div>
        {showAlert && (
          <span className="text-sm text-rose-400">
            {csvMode
              ? "That CSV has no usable website column — check for a 'website' or 'url' column."
              : "Please enter at least one website URL!"}
          </span>
        )}
      </Card>

      {loading ? (
        <SectionLoader label="Auditing sites. This checks performance, security and SEO, so it can take a moment per site..." />
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-5">
          <ShowAuditDataTable data={results} />
          {csvMode ? (
            <Card className="flex flex-col gap-3 p-6">
              <Toggle
                checked={dropErrors}
                onChange={setDropErrors}
                label="Remove sites that couldn't be reached before exporting"
                description="Keeps sites with real issues (they're still leads) — only drops unreachable/error rows."
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  {exportRows.length} of {mergedRows.length} leads will be exported
                  {droppedCount > 0 ? ` (${droppedCount} unreachable dropped)` : ""}.
                </span>
                <Button onClick={() => downloadLeadsCsv(exportRows, "leads_audited.csv")}>
                  <RiDownloadLine />
                  Export Audited CSV
                </Button>
              </div>
            </Card>
          ) : (
            <DownloadDataBlock data={csvData} />
          )}
        </div>
      ) : (
        <EmptyState
          icon={RiShieldCheckLine}
          title="No audits yet"
          description="Paste one or more website URLs, or upload a CSV, to run a full audit."
        />
      )}
    </div>
  );
};

export default WebsiteAudit;
