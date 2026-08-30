import { useContext, useState } from "react";
import { RiMapPin2Line, RiPlayFill } from "react-icons/ri";
import DownloadDataBlock from "../components/DownloadDataBlock";
import { GoogleMapDataContext } from "../context/MapDataContext";
import StickyHeadTable from "../components/ShowMapDataTable";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";

const GoogleMapData = () => {
  const { googleMapData, loading, fetchGoogleMapData, error } = useContext(GoogleMapDataContext);

  const [keyword, setkeyword] = useState("");
  const [location, setLocation] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleStart = () => {
    if (keyword && location) {
      fetchGoogleMapData(keyword, location);
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
        title="Extract Data from Google Maps"
        description="Search a keyword and a location to pull business leads with contact details."
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
            label="Location"
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
        {showAlert && (
          <span className="text-sm text-rose-400">Please enter both a keyword and a location!</span>
        )}
      </Card>

      {loading ? (
        <SectionLoader label="Data collection has started. Please wait..." />
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : googleMapData?.results?.length > 0 ? (
        <div className="flex flex-col gap-5">
          <StickyHeadTable data={googleMapData?.results || []} />
          <DownloadDataBlock data={googleMapData?.results || []} />
        </div>
      ) : (
        <EmptyState
          icon={RiMapPin2Line}
          title="No leads yet"
          description="Run a search above to pull leads from Google Maps."
        />
      )}
    </div>
  );
};

export default GoogleMapData;
