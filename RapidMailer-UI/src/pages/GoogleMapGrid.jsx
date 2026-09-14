import { useState, useRef } from "react";
import {
  RiGridLine,
  RiPlayFill,
  RiStopCircleLine,
  RiDownloadLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiLoaderLine,
} from "react-icons/ri";
import { useMapGrid } from "../context/MapGridContext";
import StickyHeadTable from "../components/ShowMapDataTable";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import ExportContactsMenu from "../components/ui/ExportContactsMenu";
import { hasRealWebsite, downloadLeadsCsv } from "../utils/leadCsv";

// ---------------------------------------------------------------------------
// Sub-location slot progress indicator
// ---------------------------------------------------------------------------
function SlotProgress({ progress, totalSlots }) {
  if (!progress) return null;

  const { slotIndex, totalFound, message, event } = progress;
  const done = slotIndex !== undefined ? slotIndex + (event === "slot_done" || event === "complete" || event === "error" ? 1 : 0) : 0;
  const pct = totalSlots > 0 ? Math.round((done / totalSlots) * 100) : 0;

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <RiLoaderLine className="animate-spin text-violet-400" />
          <span className="truncate">{message || "Scraping…"}</span>
        </div>
        <span className="shrink-0 text-xs font-semibold text-violet-300">
          {done}/{totalSlots} slots · {totalFound ?? 0} unique leads
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Stats summary card
// ---------------------------------------------------------------------------
function StatsCard({ stats }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "Slots Run", value: stats.totalSlots },
        { label: "Raw Results", value: stats.totalRaw },
        { label: "Unique Leads", value: stats.totalDeduped, accent: true },
        { label: "Duplicates Removed", value: stats.deduplicatedAway },
      ].map(({ label, value, accent }) => (
        <Card key={label} className="flex flex-col gap-1 p-4">
          <p className="text-xs text-slate-500">{label}</p>
          <p className={`text-2xl font-bold ${accent ? "text-violet-300" : "text-white"}`}>
            {value ?? 0}
          </p>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const GoogleMapGrid = () => {
  const { running, results, stats, progress, error, startGrid, cancelGrid } =
    useMapGrid();

  const [keyword, setKeyword] = useState("");
  const [subLocationsText, setSubLocationsText] = useState("");
  const [maxPerSlot, setMaxPerSlot] = useState(120);
  const [validationError, setValidationError] = useState("");

  const handleStart = () => {
    const kw = keyword.trim();
    const slots = subLocationsText
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (!kw) {
      setValidationError("Please enter a keyword.");
      return;
    }
    if (slots.length === 0) {
      setValidationError("Please enter at least one sub-location.");
      return;
    }
    if (slots.length > 30) {
      setValidationError("Maximum 30 sub-locations per run.");
      return;
    }
    setValidationError("");
    startGrid(kw, slots, Number(maxPerSlot) || 120);
  };

  const parsedSlots = subLocationsText
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const withWebsite = results.filter((r) => hasRealWebsite(r.website));
  const withoutWebsite = results.filter((r) => !hasRealWebsite(r.website));

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Lead Generation"
        title="Maps Grid Scraper"
        description={
          "Overcome Google Maps' ~120-result ceiling by splitting your search across multiple " +
          "sub-localities or postal codes. Each slot is scraped separately, then results are " +
          "merged and deduplicated by phone number + business name."
        }
      />

      {/* ── Input Card ── */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Keyword"
            placeholder="e.g. Plumbers"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={running}
          />
          <Input
            label="Max Results per Slot"
            type="number"
            min={1}
            max={120}
            value={maxPerSlot}
            onChange={(e) => setMaxPerSlot(e.target.value)}
            disabled={running}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Sub-Locations / Postal Codes
            {parsedSlots.length > 0 && (
              <span className="ml-2 rounded-md bg-violet-500/15 px-2 py-0.5 text-xs font-normal text-violet-300">
                {parsedSlots.length} slot{parsedSlots.length !== 1 ? "s" : ""}
              </span>
            )}
          </label>
          <textarea
            rows={4}
            placeholder={"Croydon, Bromley, Wandsworth\n(comma or newline separated — max 30)"}
            value={subLocationsText}
            onChange={(e) => setSubLocationsText(e.target.value)}
            disabled={running}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-violet-500/60 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
          />
          <p className="text-xs text-slate-500">
            Each location runs as a separate search — you get up to {maxPerSlot} results per slot,
            deduplicated across all slots.
          </p>
        </div>

        {validationError && (
          <p className="text-sm text-rose-400">{validationError}</p>
        )}

        <div className="flex items-center gap-3">
          {running ? (
            <Button variant="secondary" onClick={cancelGrid}>
              <RiStopCircleLine />
              Cancel
            </Button>
          ) : (
            <Button onClick={handleStart}>
              <RiPlayFill />
              Start Grid Scrape
              {parsedSlots.length > 0 && ` (${parsedSlots.length} slots)`}
            </Button>
          )}
        </div>
      </Card>

      {/* ── Live Progress ── */}
      {running && (
        <SlotProgress progress={progress} totalSlots={parsedSlots.length} />
      )}

      {/* ── Error ── */}
      {error && !running && (
        <Card className="flex items-center gap-3 border-rose-500/30 bg-rose-500/5 p-5">
          <RiErrorWarningLine className="shrink-0 text-xl text-rose-400" />
          <p className="text-sm text-rose-300">{error}</p>
        </Card>
      )}

      {/* ── Results ── */}
      {results.length > 0 && !running && (
        <div className="flex flex-col gap-5">
          {/* Stats row */}
          <StatsCard stats={stats} />

          {/* Summary line */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <RiCheckboxCircleLine className="text-base text-emerald-400" />
            <span>
              Found <span className="font-semibold text-white">{results.length}</span> unique
              leads across <span className="font-semibold text-white">{stats?.totalSlots}</span>{" "}
              location{stats?.totalSlots !== 1 ? "s" : ""}.
              {stats?.deduplicatedAway > 0 && (
                <span className="ml-1 text-slate-500">
                  ({stats.deduplicatedAway} duplicates removed)
                </span>
              )}
            </span>
          </div>

          {/* Table */}
          <StickyHeadTable data={results} />

          {/* Export controls */}
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-white">Export & Pipeline</h3>
              <p className="text-sm text-slate-400">
                Split by website for the lead pipeline, or sync directly to your phone contacts
                before outreach to bypass WhatsApp's unsaved-contact spam filter.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                disabled={withWebsite.length === 0}
                onClick={() => downloadLeadsCsv(withWebsite, "grid_has_website.csv")}
              >
                <RiDownloadLine />
                Has Website ({withWebsite.length})
              </Button>
              <Button
                variant="secondary"
                disabled={withoutWebsite.length === 0}
                onClick={() => downloadLeadsCsv(withoutWebsite, "grid_no_website.csv")}
              >
                <RiDownloadLine />
                No Website ({withoutWebsite.length})
              </Button>
              <Button
                variant="secondary"
                onClick={() => downloadLeadsCsv(results, "grid_all_leads.csv")}
              >
                <RiDownloadLine />
                All Leads ({results.length})
              </Button>
              <ExportContactsMenu rows={results} filenamePrefix="grid" />
            </div>
          </Card>
        </div>
      )}

      {/* ── Empty ── */}
      {results.length === 0 && !running && !error && (
        <EmptyState
          icon={RiGridLine}
          title="No results yet"
          description="Enter a keyword and sub-locations above, then click Start Grid Scrape."
        />
      )}
    </div>
  );
};

export default GoogleMapGrid;
