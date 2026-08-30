import { useContext, useMemo, useState } from "react";
import { RiShieldCheckLine, RiSearchLine } from "react-icons/ri";
import DownloadDataBlock from "../components/DownloadDataBlock";
import ShowAuditDataTable from "../components/ShowAuditDataTable";
import { WebsiteAuditContext } from "../context/WebsiteAuditContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Textarea } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";

const WebsiteAudit = () => {
  const { results, loading, error, auditSingle, auditBulk } = useContext(WebsiteAuditContext);

  const [urlsText, setUrlsText] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleStart = () => {
    const urls = urlsText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

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

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Website Intel"
        title="Bulk Website Audit"
        description="Paste one website per line — we'll check performance (Google PageSpeed), security (SSL, headers, exposed files) and SEO/technical basics, then write a ready-to-use outreach summary for each site."
      />

      <Card className="flex flex-col gap-4 p-6">
        <Textarea
          placeholder={"example.com\nanother-site.com\nyetanother.com"}
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          className="h-32 w-full max-w-xl"
        />
        <div>
          <Button onClick={handleStart}>
            <RiSearchLine />
            Run Audit
          </Button>
        </div>
        {showAlert && (
          <span className="text-sm text-rose-400">Please enter at least one website URL!</span>
        )}
      </Card>

      {loading ? (
        <SectionLoader
          label={`Auditing site${
            urlsText.split("\n").filter(Boolean).length > 1 ? "s" : ""
          }. This checks performance, security and SEO, so it can take a moment per site...`}
        />
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-5">
          <ShowAuditDataTable data={results} />
          <DownloadDataBlock data={csvData} />
        </div>
      ) : (
        <EmptyState
          icon={RiShieldCheckLine}
          title="No audits yet"
          description="Paste one or more website URLs above to run a full audit."
        />
      )}
    </div>
  );
};

export default WebsiteAudit;
