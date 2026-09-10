import { useContext, useState, useRef } from "react";
import {
  RiGlobalLine,
  RiPlayFill,
  RiAddLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiDownloadLine,
  RiFileCopyLine,
} from "react-icons/ri";
import { saveAs } from "file-saver";
import WebDataTable from "../components/ShowWebDataTable";
import { WebDataContext } from "../context/WebDataContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Best-effort URL normaliser — returns a validated URL string or null. */
function parseUrl(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.href;
  } catch {
    return null;
  }
}

/**
 * Parse a multi-line / comma-separated / space-separated block of text into
 * individual URL candidates. Handles newlines, commas, semicolons, and tabs
 * as delimiters — whichever the user happens to paste.
 */
function splitRawInput(text) {
  return text
    .split(/[\n\r,;\t]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Build a two-column CSV (url, found_emails) from result rows. */
function buildCsv(results) {
  const escape = (val) => {
    const str = String(val ?? "");
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const header = "url,found_emails";
  const rows = results.map((row) => {
    const emails =
      row.error
        ? ""
        : Array.isArray(row.emails)
        ? row.emails.join("; ")
        : "";
    return `${escape(row.url)},${escape(emails)}`;
  });

  return [header, ...rows].join("\n");
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const TAB_SINGLE = "single";
const TAB_BULK = "bulk";

const WebData = () => {
  const { results, loading, extractEmailsFromUrls, error, setError } =
    useContext(WebDataContext);

  // Input mode
  const [activeTab, setActiveTab] = useState(TAB_SINGLE);

  // Single-URL input
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const inputRef = useRef(null);

  // Bulk-paste input
  const [bulkValue, setBulkValue] = useState("");
  const [bulkStats, setBulkStats] = useState(null); // { added, skipped, invalid }

  // Shared URL queue
  const [urlList, setUrlList] = useState([]); // normalised URL strings

  // ---------------------------------------------------------------------------
  // Shared helpers
  // ---------------------------------------------------------------------------

  /** Add an array of raw strings to the queue, returning stats. */
  const addRawUrls = (raws, existingList) => {
    let added = 0;
    let skipped = 0;
    let invalid = 0;
    const next = [...existingList];
    const seen = new Set(next.map((u) => u.toLowerCase()));

    for (const raw of raws) {
      const parsed = parseUrl(raw);
      if (!parsed) {
        invalid++;
        continue;
      }
      if (seen.has(parsed.toLowerCase())) {
        skipped++;
        continue;
      }
      seen.add(parsed.toLowerCase());
      next.push(parsed);
      added++;
    }

    return { next, added, skipped, invalid };
  };

  // ---------------------------------------------------------------------------
  // Single-URL handlers
  // ---------------------------------------------------------------------------

  const handleSingleAdd = () => {
    setInputError("");
    const { next, added, skipped, invalid } = addRawUrls([inputValue], urlList);

    if (invalid > 0) {
      setInputError("Please enter a valid URL (e.g. https://example.com).");
      inputRef.current?.focus();
      return;
    }
    if (skipped > 0) {
      setInputError("This URL is already in the list.");
      inputRef.current?.focus();
      return;
    }
    if (added > 0) {
      setUrlList(next);
      setInputValue("");
    }
    inputRef.current?.focus();
  };

  const handleSingleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSingleAdd();
    }
  };

  // ---------------------------------------------------------------------------
  // Bulk-paste handlers
  // ---------------------------------------------------------------------------

  const handleBulkAdd = () => {
    if (!bulkValue.trim()) return;

    const raws = splitRawInput(bulkValue);
    const { next, added, skipped, invalid } = addRawUrls(raws, urlList);

    setUrlList(next);
    setBulkStats({ added, skipped, invalid });
    if (added > 0) setBulkValue("");
  };

  // ---------------------------------------------------------------------------
  // Shared list management
  // ---------------------------------------------------------------------------

  const handleRemove = (url) =>
    setUrlList((prev) => prev.filter((u) => u !== url));

  const handleClearAll = () => {
    setUrlList([]);
    setInputValue("");
    setBulkValue("");
    setInputError("");
    setBulkStats(null);
  };

  // ---------------------------------------------------------------------------
  // Extraction
  // ---------------------------------------------------------------------------

  const handleStart = () => {
    if (urlList.length === 0) {
      setInputError("Add at least one URL before starting.");
      return;
    }
    setError(null);
    setBulkStats(null);
    extractEmailsFromUrls(urlList);
  };

  // ---------------------------------------------------------------------------
  // CSV export
  // ---------------------------------------------------------------------------

  const handleExport = () => {
    if (!results || results.length === 0) return;
    const csv = buildCsv(results);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "email_extraction_results.csv");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const tabBase =
    "px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer";
  const tabActive = "bg-violet-600/30 text-violet-300 border border-violet-500/40";
  const tabInactive = "text-slate-400 hover:text-slate-200 border border-transparent";

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Lead Generation"
        title="Extract Emails from Websites"
        description="Add website URLs — one at a time or paste a whole list. The system visits each site and extracts contact emails."
      />

      {/* ── URL Input Card ─────────────────────────────────────────── */}
      <Card className="flex flex-col gap-5 p-6">

        {/* Mode tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4">
          <button
            className={`${tabBase} ${activeTab === TAB_SINGLE ? tabActive : tabInactive}`}
            onClick={() => { setActiveTab(TAB_SINGLE); setInputError(""); setBulkStats(null); }}
          >
            Add One by One
          </button>
          <button
            className={`${tabBase} ${activeTab === TAB_BULK ? tabActive : tabInactive}`}
            onClick={() => { setActiveTab(TAB_BULK); setInputError(""); setBulkStats(null); }}
          >
            <span className="flex items-center gap-1.5">
              <RiFileCopyLine />
              Paste Bulk URLs
            </span>
          </button>
        </div>

        {/* ── Single URL tab ── */}
        {activeTab === TAB_SINGLE && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Input
                ref={inputRef}
                label="Website URL"
                placeholder="e.g. https://example.com"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputError) setInputError("");
                }}
                onKeyDown={handleSingleKeyDown}
                className="flex-1"
              />
              <Button
                onClick={handleSingleAdd}
                variant="secondary"
                className="shrink-0"
              >
                <RiAddLine />
                Add URL
              </Button>
            </div>
            {inputError && (
              <span className="text-sm text-rose-400">{inputError}</span>
            )}
          </div>
        )}

        {/* ── Bulk paste tab ── */}
        {activeTab === TAB_BULK && (
          <div className="flex flex-col gap-3">
            <Textarea
              label="Paste URLs (one per line, or comma / semicolon separated)"
              placeholder={`https://example.com\nhttps://another-site.com\nhttps://third-site.org`}
              value={bulkValue}
              onChange={(e) => {
                setBulkValue(e.target.value);
                if (bulkStats) setBulkStats(null);
              }}
              rows={6}
            />

            <div className="flex items-center justify-between flex-wrap gap-2">
              {/* Stats feedback */}
              {bulkStats && (
                <span className="text-sm text-slate-400">
                  {bulkStats.added > 0 && (
                    <span className="text-emerald-400 font-medium">{bulkStats.added} added</span>
                  )}
                  {bulkStats.skipped > 0 && (
                    <span className="ml-2 text-amber-400">{bulkStats.skipped} duplicate{bulkStats.skipped > 1 ? "s" : ""} skipped</span>
                  )}
                  {bulkStats.invalid > 0 && (
                    <span className="ml-2 text-rose-400">{bulkStats.invalid} invalid</span>
                  )}
                  {bulkStats.added === 0 && bulkStats.skipped === 0 && bulkStats.invalid === 0 && (
                    <span className="text-slate-500">Nothing to add — textarea is empty.</span>
                  )}
                </span>
              )}

              <Button
                onClick={handleBulkAdd}
                variant="secondary"
                disabled={!bulkValue.trim()}
                className="ml-auto"
              >
                <RiAddLine />
                Add All URLs
              </Button>
            </div>
          </div>
        )}

        {/* ── Queued URL pill list (shared) ── */}
        {urlList.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">
                {urlList.length} URL{urlList.length !== 1 ? "s" : ""} queued
              </span>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                <RiDeleteBin6Line />
                Clear all
              </button>
            </div>

            <ul className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              {urlList.map((url) => (
                <li
                  key={url}
                  className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1 text-sm text-slate-200"
                >
                  <span className="max-w-xs truncate">{url}</span>
                  <button
                    onClick={() => handleRemove(url)}
                    aria-label={`Remove ${url}`}
                    className="ml-1 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <RiCloseLine />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                onClick={handleStart}
                disabled={loading || urlList.length === 0}
              >
                <RiPlayFill />
                {loading ? "Extracting…" : "Start Extraction"}
              </Button>
            </div>
          </div>
        )}

        {/* Backend error */}
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </Card>

      {/* ── Results ────────────────────────────────────────────────── */}
      {loading ? (
        <SectionLoader label="Visiting websites and extracting emails… Please wait." />
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-5">
          <WebDataTable data={results} />
          <div className="flex justify-end">
            <Button onClick={handleExport} variant="primary">
              <RiDownloadLine />
              Export CSV
            </Button>
          </div>
        </div>
      ) : (
        !loading && urlList.length === 0 && (
          <EmptyState
            icon={RiGlobalLine}
            title="No URLs added yet"
            description="Use the tabs above to add URLs one at a time or paste a whole list at once."
          />
        )
      )}
    </div>
  );
};

export default WebData;
