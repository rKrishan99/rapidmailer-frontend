import { useContext, useMemo, useState } from "react";
import { RiCodeSSlashLine, RiSearchLine } from "react-icons/ri";
import DownloadDataBlock from "../components/DownloadDataBlock";
import ShowTechDataTable from "../components/ShowTechDataTable";
import { TechDetectorContext } from "../context/TechDetectorContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Textarea } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";

const TechDetector = () => {
  const { results, loading, error, detectSingle, detectBulk } = useContext(TechDetectorContext);

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

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Website Intel"
        title="Website Tech Stack Detector"
        description="Paste one website per line — WordPress, Wix, Shopify, Next.js, React, Angular and more, detected automatically."
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
            Detect Tech Stack
          </Button>
        </div>
        {showAlert && (
          <span className="text-sm text-rose-400">Please enter at least one website URL!</span>
        )}
      </Card>

      {loading ? (
        <SectionLoader
          label={`Scanning site${
            urlsText.split("\n").filter(Boolean).length > 1 ? "s" : ""
          }. This can take a moment per site...`}
        />
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : tableData.length > 0 ? (
        <div className="flex flex-col gap-5">
          <ShowTechDataTable data={tableData} />
          <DownloadDataBlock data={tableData} />
        </div>
      ) : (
        <EmptyState
          icon={RiCodeSSlashLine}
          title="No sites scanned yet"
          description="Paste one or more website URLs above to detect their tech stack."
        />
      )}
    </div>
  );
};

export default TechDetector;
