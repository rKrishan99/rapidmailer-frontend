import { useContext, useState } from "react";
import { RiGlobalLine, RiPlayFill } from "react-icons/ri";
import DownloadDataBlock from "../components/DownloadDataBlock";
import StickyHeadTable from "../components/ShowWebDataTable";
import { WebDataContext } from "../context/WebDataContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";

const WebData = () => {
  const { webData, loading, fetchWebData, error } = useContext(WebDataContext);

  const [keyword, setkeyword] = useState("");
  const [location, setLocation] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleStart = () => {
    if (keyword) {
      fetchWebData(keyword, location);
      setkeyword("");
      setLocation("");
      setShowAlert(false);
    } else {
      setShowAlert(true);
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Lead Generation"
        title="Extract Data from Google Search"
        description="Search a keyword to crawl results and surface contact emails."
      />

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <Input
            label="Keyword"
            placeholder="e.g. coffee shop"
            value={keyword}
            onChange={(e) => setkeyword(e.target.value)}
            className="md:w-64"
          />
          <Input
            label="Location (optional)"
            placeholder="e.g. texas"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="md:w-64"
          />
          <Button onClick={handleStart}>
            <RiPlayFill />
            Start
          </Button>
        </div>
        {showAlert && <span className="text-sm text-rose-400">Please enter a keyword!</span>}
      </Card>

      {loading ? (
        <SectionLoader label="Data collection has started. Please wait..." />
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : webData?.results?.length > 0 ? (
        <div className="flex flex-col gap-5">
          <StickyHeadTable data={webData?.results || []} />
          <DownloadDataBlock data={webData?.results || []} showOption />
        </div>
      ) : (
        <EmptyState
          icon={RiGlobalLine}
          title="No results yet"
          description="Run a search above to pull leads from Google search results."
        />
      )}
    </div>
  );
};

export default WebData;
