import { useContext, useMemo, useState } from "react";
import { RiCodeSSlashLine, RiSearchLine, RiUpload2Line, RiDownloadLine } from "react-icons/ri";
import DownloadDataBlock from "../components/DownloadDataBlock";
import ShowTechDataTable from "../components/ShowTechDataTable";
import { TechDetectorContext } from "../context/TechDetectorContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import { Textarea } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import { parseLeadsCsv, mergeByWebsite, downloadLeadsCsv, getRowWebsite } from "../utils/leadCsv";

const TechDetector = () => {
  const { results, loading, error, detectSingle, detectBulk } = useContext(TechDetectorContext);

  const [csvMode, setCsvMode] = useState(false);
  const [urlsText, setUrlsText] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [showAlert, setShowAlert] = useState(false);

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
      detectSingle(urls[0]);
    } else {
      detectBulk(urls);
    }
  };

  const tableData = useMemo(
    () =>
      results.map((r) => ({
        url: r.url,
        technologies: r.error ? r.error : (r.technologies || []).map((t) => t.name).join(", "),
        server: r.server,
        poweredBy: r.poweredBy,
        error: r.error,
      })),
    [results]
  );

  // In CSV mode, fold the detected technology + WordPress theme back onto
  // the original full lead rows so nothing (name, phone, address...) is
  // lost — the export carries every original column plus these two new ones.
  const mergedRows = useMemo(() => {
    if (!csvMode || csvRows.length === 0 || results.length === 0) return [];
    const techUpdates = results.map((r) => ({
      url: r.url,
      technology: r.error ? "" : (r.technologies || []).map((t) => t.name).join(", "),
      wordpressTheme: r.wordpress?.theme || "",
    }));
    return mergeByWebsite(csvRows, techUpdates);
  }, [csvMode, csvRows, results]);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Website Intel"
        title="Website Tech Stack Detector"
        description="Paste websites, or upload a leads CSV — WordPress, Wix, Shopify, Next.js, React, Angular and more, detected automatically."
      />

      <Card className="flex flex-col gap-4 p-6">
        <Toggle
          checked={csvMode}
          onChange={setCsvMode}
          label="Upload a CSV instead of pasting URLs"
          description="Detected technology is merged back onto every original column and exported as one CSV."
        />

        {csvMode ? (
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="tech-csv-input"
              className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
            >
              <RiUpload2Line />
              Choose CSV File
            </label>
            <input
              id="tech-csv-input"
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
            Detect Tech Stack
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
        <SectionLoader label="Scanning sites. This can take a moment per site..." />
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : tableData.length > 0 ? (
        <div className="flex flex-col gap-5">
          <ShowTechDataTable data={tableData} />
          {csvMode ? (
            <div className="flex justify-end">
              <Button onClick={() => downloadLeadsCsv(mergedRows, "leads_with_technology.csv")}>
                <RiDownloadLine />
                Export CSV with Technology
              </Button>
            </div>
          ) : (
            <DownloadDataBlock data={tableData} />
          )}
        </div>
      ) : (
        <EmptyState
          icon={RiCodeSSlashLine}
          title="No sites scanned yet"
          description="Paste one or more website URLs, or upload a CSV, to detect their tech stack."
        />
      )}
    </div>
  );
};

export default TechDetector;
