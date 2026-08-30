import React, { useContext, useMemo, useState } from "react";
import DownloadDataBlock from "../components/DownloadDataBlock";
import ShowTechDataTable from "../components/ShowTechDataTable";
import PropagateLoader from "react-spinners/PropagateLoader";
import { TechDetectorContext } from "../context/TechDetectorContext";
import { COLORS } from "../constants/theme";

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

  // Flatten the technologies array into a display string so the shared
  // table + CSV export components (which expect flat row values) work
  // the same way they do for every other tool.
  const tableData = useMemo(
    () =>
      results.map((r) => ({
        url: r.url,
        technologies: r.error
          ? r.error
          : (r.technologies || []).map((t) => t.name).join(", "),
        server: r.server,
        poweredBy: r.poweredBy,
        error: r.error,
      })),
    [results]
  );

  return (
    <div
      style={{ backgroundColor: COLORS.background }}
      className="flex flex-col gap-6 p-6 h-full"
    >
      <h1 className="text-lg font-bold">Website Tech Stack Detector</h1>
      <p className="text-sm text-gray-600 -mt-4">
        Paste one website per line — WordPress, Wix, Shopify, Next.js, React, Angular
        and more, detected automatically.
      </p>

      <div className="flex flex-col gap-3">
        <textarea
          className="border-1 px-3 py-2 focus:border-[#1EAE98] border-gray-400 rounded-lg w-full max-w-xl h-32 resize-y"
          placeholder={"example.com\nanother-site.com\nyetanother.com"}
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
        />
        <div>
          <button
            onClick={handleStart}
            className="bg-[#1EAE98] flex items-center justify-center text-white px-8 py-1.5 rounded-lg cursor-pointer hover:bg-[#1eae7c] w-fit"
          >
            Detect Tech Stack
          </button>
        </div>
      </div>

      {showAlert && (
        <span className="text-red-600 text-sm">Please enter at least one website URL!</span>
      )}

      {loading ? (
        <div className="pt-6">
          <span className="text-[#1EAE98]">
            Scanning site{urlsText.split("\n").filter(Boolean).length > 1 ? "s" : ""}. This can
            take a moment per site...
          </span>
          <div className="flex h-[300px] items-center justify-center">
            <PropagateLoader color="#1EAE98" />
          </div>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : tableData.length > 0 ? (
        <div className="flex flex-col gap-6 mt-4">
          <ShowTechDataTable data={tableData} />
          <DownloadDataBlock data={tableData} showOption={false} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default TechDetector;
