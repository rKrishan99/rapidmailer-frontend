import DataTable from "./ui/DataTable";
import Badge from "./ui/Badge";

function scoreTone(score) {
  if (typeof score !== "number") return "neutral";
  if (score >= 90) return "good";
  if (score >= 50) return "warn";
  return "bad";
}

function countSecurityIssues(security) {
  if (!security) return 0;
  let n = 0;
  if (security.ssl && security.ssl.valid === false) n += 1;
  n += security.missingHeaders?.length || 0;
  n += security.exposedFiles?.length || 0;
  if (security.wordpress?.outdated) n += 1;
  return n;
}

function countSeoIssues(seo) {
  if (!seo) return 0;
  let n = 0;
  if (!seo.hasSitemapXml) n += 1;
  if (!seo.hasRobotsTxt) n += 1;
  if (!seo.metaDescription) n += 1;
  if (!seo.hasViewport) n += 1;
  if (!seo.title) n += 1;
  return n;
}

const columns = [
  { id: "url", label: "Website", minWidth: 200 },
  {
    id: "performance",
    label: "Performance",
    minWidth: 110,
    render: (row) => {
      if (row.error) return <Badge tone="neutral">—</Badge>;
      const score = row.performance?.performanceScore;
      return row.performance?.error ? (
        <Badge tone="neutral">No data</Badge>
      ) : (
        <Badge tone={scoreTone(score)}>{score}/100</Badge>
      );
    },
  },
  {
    id: "security",
    label: "Security",
    minWidth: 110,
    render: (row) => {
      if (row.error) return <Badge tone="neutral">—</Badge>;
      const issues = countSecurityIssues(row.security);
      return (
        <Badge tone={issues === 0 ? "good" : issues >= 3 ? "bad" : "warn"}>
          {issues === 0 ? "Clean" : `${issues} issue${issues > 1 ? "s" : ""}`}
        </Badge>
      );
    },
  },
  {
    id: "seo",
    label: "SEO",
    minWidth: 110,
    render: (row) => {
      if (row.error) return <Badge tone="neutral">—</Badge>;
      const issues = countSeoIssues(row.seo);
      return (
        <Badge tone={issues === 0 ? "good" : issues >= 3 ? "bad" : "warn"}>
          {issues === 0 ? "Clean" : `${issues} issue${issues > 1 ? "s" : ""}`}
        </Badge>
      );
    },
  },
  {
    id: "outreachSummary",
    label: "Outreach Summary",
    minWidth: 260,
    render: (row) =>
      row.error ? (
        <span className="text-rose-400">{row.error}</span>
      ) : (
        <span className="line-clamp-2 text-sm text-slate-400">{row.outreachSummary}</span>
      ),
  },
];

function ExpandedAudit({ row }) {
  if (row.error) return null;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div>
        <h4 className="mb-2 text-sm font-bold text-slate-200">Performance (mobile)</h4>
        {row.performance?.error ? (
          <p className="text-sm text-rose-400">{row.performance.error}</p>
        ) : (
          <ul className="space-y-1 text-sm text-slate-400">
            <li>Performance score: {row.performance?.performanceScore ?? "N/A"}/100</li>
            <li>SEO score (Lighthouse): {row.performance?.seoScore ?? "N/A"}/100</li>
            <li>Best practices: {row.performance?.bestPracticesScore ?? "N/A"}/100</li>
            <li>Accessibility: {row.performance?.accessibilityScore ?? "N/A"}/100</li>
            <li>Largest Contentful Paint: {row.performance?.largestContentfulPaint || "N/A"}</li>
            <li>Cumulative Layout Shift: {row.performance?.cumulativeLayoutShift || "N/A"}</li>
            <li>Total Blocking Time: {row.performance?.totalBlockingTime || "N/A"}</li>
          </ul>
        )}
      </div>
      <div>
        <h4 className="mb-2 text-sm font-bold text-slate-200">Security</h4>
        <ul className="space-y-1 text-sm text-slate-400">
          <li>
            SSL/HTTPS:{" "}
            {row.security?.ssl?.valid ? (
              <span className="text-emerald-400">Valid</span>
            ) : (
              <span className="text-rose-400">{row.security?.ssl?.error || "Invalid"}</span>
            )}
          </li>
          <li>
            Missing headers:{" "}
            {row.security?.missingHeaders?.length ? row.security.missingHeaders.join(", ") : "None"}
          </li>
          <li>
            Exposed files:{" "}
            {row.security?.exposedFiles?.length ? row.security.exposedFiles.join(", ") : "None found"}
          </li>
          {row.security?.wordpress && (
            <li>
              WordPress: v{row.security.wordpress.detectedVersion}
              {row.security.wordpress.latestVersion
                ? row.security.wordpress.outdated
                  ? ` (outdated — latest is v${row.security.wordpress.latestVersion})`
                  : " (up to date)"
                : " (latest version unknown)"}
            </li>
          )}
        </ul>
      </div>
      <div>
        <h4 className="mb-2 text-sm font-bold text-slate-200">SEO / Technical</h4>
        <ul className="space-y-1 text-sm text-slate-400">
          <li>
            Title: {row.seo?.title || "Missing"} ({row.seo?.titleLength || 0} chars)
          </li>
          <li>
            Meta description:{" "}
            {row.seo?.metaDescription ? `${row.seo.metaDescriptionLength} chars` : "Missing"}
          </li>
          <li>Mobile viewport tag: {row.seo?.hasViewport ? "Yes" : "Missing"}</li>
          <li>Canonical tag: {row.seo?.hasCanonical ? "Yes" : "Missing"}</li>
          <li>Open Graph tags: {row.seo?.hasOpenGraph ? "Yes" : "Missing"}</li>
          <li>robots.txt: {row.seo?.hasRobotsTxt ? "Found" : "Missing"}</li>
          <li>sitemap.xml: {row.seo?.hasSitemapXml ? "Found" : "Missing"}</li>
        </ul>
      </div>
      <div className="rounded-xl bg-white/[0.04] p-4 md:col-span-3">
        <h4 className="mb-1 text-sm font-bold text-slate-200">Outreach summary</h4>
        <p className="text-sm text-slate-400">{row.outreachSummary}</p>
      </div>
    </div>
  );
}

export default function ShowAuditDataTable({ data = [] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      emptyLabel="No audits yet"
      renderExpanded={(row) => <ExpandedAudit row={row} />}
    />
  );
}
