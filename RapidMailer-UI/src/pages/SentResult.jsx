import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RiSendPlaneFill,
  RiErrorWarningLine,
  RiDownloadLine,
  RiRefreshLine,
  RiMailLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiSkipForwardLine,
  RiInboxLine,
  RiArrowLeftLine,
  RiFlaskLine,
} from "react-icons/ri";
import { useEmailSend } from "../context/EmailsSendContext";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import CampaignMetricCard from "../components/CampaignMetricCard";
import { downloadLeadsCsv } from "../utils/leadCsv";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusBadge(status) {
  switch (status) {
    case "sent":    return <Badge tone="good">✓ Sent</Badge>;
    case "failed":  return <Badge tone="bad">✗ Failed</Badge>;
    case "skipped": return <Badge tone="warn">— Skipped</Badge>;
    default:        return <Badge tone="neutral">{status}</Badge>;
  }
}

/** Merge results + skippedRows into one flat list for the table. */
function buildTableRows(results = [], skippedRows = []) {
  return [
    ...results,
    ...skippedRows.map((s) => ({
      ...s,
      status: "skipped",
      messageId: null,
      errorDetail: s.reason || "Invalid or blocked address",
    })),
  ];
}

// Table column definitions
const TABLE_COLUMNS = [
  {
    id: "email",
    label: "Recipient Email",
    minWidth: 220,
    render: (row) => (
      <span className="font-mono text-xs text-slate-200 break-all">{row.email || "—"}</span>
    ),
  },
  {
    id: "domain",
    label: "Domain / Company",
    minWidth: 160,
    render: (row) => (
      <span className="text-sm text-slate-400">{row.domain || "—"}</span>
    ),
  },
  {
    id: "status",
    label: "Status",
    minWidth: 110,
    render: (row) => statusBadge(row.status),
  },
  {
    id: "timestamp",
    label: "Timestamp",
    minWidth: 160,
    render: (row) => (
      <span className="text-xs text-slate-500">{formatTimestamp(row.timestamp)}</span>
    ),
  },
  {
    id: "errorDetail",
    label: "Error / Server Response",
    minWidth: 240,
    render: (row) =>
      row.errorDetail ? (
        <span className="text-xs text-rose-400 break-all">{row.errorDetail}</span>
      ) : (
        <span className="text-xs text-slate-600">—</span>
      ),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SentResult = () => {
  const navigate = useNavigate();
  const { loading, error, campaignData, sendCampaign } = useEmailSend();

  // Local state for retry tracking
  const [retrying, setRetrying]             = useState(false);
  const [retryError, setRetryError]         = useState(null);
  // After retry, merge new results so the table updates in-place
  const [extraResults, setExtraResults]     = useState([]);
  // Keep the original template available for retries
  const [savedPayload, setSavedPayload]     = useState(null);

  // Persist payload once on first render so retry works
  // (SendEmails.jsx navigates here after calling sendCampaign — the payload
  //  is unavailable here, so retry is only enabled if the data is in context)

  // Build the unified table data
  const allResults  = campaignData?.results ?? [];
  const skippedRows = campaignData?.skippedRows ?? [];
  const stats       = campaignData?.stats ?? {};
  const testMode    = campaignData?.testMode;

  const tableData = [...buildTableRows(allResults, skippedRows), ...extraResults];
  const failedRows = tableData.filter((r) => r.status === "failed");

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Email" title="Campaign Delivery Report" />
        <SectionLoader label="Sending your campaign…" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Email" title="Campaign Delivery Report" />
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10">
            <RiErrorWarningLine className="text-2xl text-rose-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Campaign failed</h2>
          <p className="max-w-md text-sm text-rose-400">{error}</p>
          <Button variant="secondary" onClick={() => navigate("/send-mails")}>
            <RiArrowLeftLine />
            Back to Campaign
          </Button>
        </Card>
      </div>
    );
  }

  // ── No data yet (user navigated here directly) ───────────────────────────
  if (!campaignData) {
    return (
      <div className="flex flex-col gap-8 p-6 md:p-10">
        <PageHeader eyebrow="Email" title="Campaign Delivery Report" />
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06]">
            <RiInboxLine className="text-2xl text-slate-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">No campaign data</h2>
          <p className="max-w-md text-sm text-slate-400">
            Run a campaign to see the delivery report here.
          </p>
          <Button onClick={() => navigate("/send-mails")}>
            <RiArrowLeftLine />
            Go to Campaign
          </Button>
        </Card>
      </div>
    );
  }

  // ── Export handler ───────────────────────────────────────────────────────
  const handleExport = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadLeadsCsv(
      tableData.map((r) => ({
        email:       r.email       ?? "",
        domain:      r.domain      ?? "",
        status:      r.status      ?? "",
        timestamp:   r.timestamp   ?? "",
        messageId:   r.messageId   ?? "",
        errorDetail: r.errorDetail ?? "",
      })),
      `campaign-report-${date}.csv`,
    );
  };

  // ── Retry handler ────────────────────────────────────────────────────────
  const handleRetry = async () => {
    if (failedRows.length === 0) return;
    setRetrying(true);
    setRetryError(null);

    try {
      const retryEmails = failedRows.map((r) => r.email);
      // Re-use the original template from campaignData if available
      const retryPayload = {
        emailTemplate: campaignData._template,
        emails: retryEmails,
        accountId: campaignData._accountId,
      };
      // If we don't have the original template persisted, show a helpful error
      if (!campaignData._template) {
        setRetryError("Original template not available. Please go back and re-send the campaign.");
        return;
      }
      const result = await sendCampaign(retryPayload);
      setExtraResults((prev) => [...prev, ...(result.results ?? [])]);
    } catch (err) {
      setRetryError(err?.message ?? "Retry failed");
    } finally {
      setRetrying(false);
    }
  };

  // ── Total leads = sent + failed + skipped ────────────────────────────────
  const totalLeads = (stats.total ?? 0) + (stats.skipped ?? 0);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Email"
        title="Campaign Delivery Report"
        description={
          testMode === "single"
            ? "Test email dispatched — this is a single-lead preview, not the full queue."
            : testMode === "bcc"
            ? "Full campaign sent with BCC copies to your verification address."
            : "Here's the full breakdown of your campaign."
        }
      />

      {/* Test mode notice */}
      {testMode === "single" && (
        <div className="flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3">
          <RiFlaskLine className="mt-0.5 shrink-0 text-violet-400" />
          <p className="text-sm text-violet-300">
            <strong>Test mode — Single Lead.</strong> Only row&nbsp;#1 was dispatched to your
            verification address. The full recipient list was <em>not</em> sent.
            Go back to start the full campaign.
          </p>
        </div>
      )}

      {/* ── 4 metric cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <CampaignMetricCard
          icon={RiMailLine}
          label="Total Leads Loaded"
          value={totalLeads}
          tone="default"
        />
        <CampaignMetricCard
          icon={RiCheckboxCircleLine}
          label="Successfully Sent"
          value={stats.sent ?? 0}
          tone="green"
        />
        <CampaignMetricCard
          icon={RiCloseCircleLine}
          label="Failed / Bounced"
          value={stats.failed ?? 0}
          tone="red"
        />
        <CampaignMetricCard
          icon={RiSkipForwardLine}
          label="Skipped / Invalid"
          value={stats.skipped ?? 0}
          tone="amber"
        />
      </div>

      {/* ── Action buttons ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleExport} variant="secondary">
          <RiDownloadLine />
          Export Report (CSV)
        </Button>

        {failedRows.length > 0 && (
          <Button
            onClick={handleRetry}
            disabled={retrying}
            variant="secondary"
            className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
          >
            <RiRefreshLine className={retrying ? "animate-spin" : ""} />
            {retrying
              ? "Retrying…"
              : `Retry Failed (${failedRows.length})`}
          </Button>
        )}

        <Button variant="ghost" onClick={() => navigate("/send-mails")}>
          <RiArrowLeftLine />
          New Campaign
        </Button>
      </div>

      {retryError && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300">
          <RiErrorWarningLine className="mt-0.5 shrink-0" />
          <span>{retryError}</span>
        </div>
      )}

      {/* ── Delivery detail table ─────────────────────────────────────── */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Delivery Details
        </h3>
        <DataTable
          columns={TABLE_COLUMNS}
          data={tableData}
          emptyLabel="No delivery data"
        />
      </div>
    </div>
  );
};

export default SentResult;
