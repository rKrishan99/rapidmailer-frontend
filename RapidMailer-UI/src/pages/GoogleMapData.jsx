import React, { useContext, useState } from "react";
import DownloadDataBlock from "../components/DownloadDataBlock";
import { GoogleMapDataContext } from "../context/MapDataContext";
import StickyHeadTable from "../components/ShowMapDataTable";
import PropagateLoader from "react-spinners/PropagateLoader";
import { COLORS } from "../constants/theme";

const GoogleMapData = () => {
  const { googleMapData, loading, fetchGoogleMapData, error } =
    useContext(GoogleMapDataContext);

  const [keyword, setkeyword] = useState("");
  const [location, setLocation] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleStart = () => {
    console.log("here is handleStart..", keyword, location);
    if (keyword && location) {
      fetchGoogleMapData(keyword, location);
      setkeyword("");
      setLocation("");
    } else {
      setShowAlert(true);
    }
  };

  console.log("again at GoogleMapData:", googleMapData);

  return (
    <div style={{ backgroundColor: COLORS.background }} className="flex flex-col gap-6 p-6 h-full">
      <h1 className="text-lg font-bold">Extract Data from Google Maps</h1>
      <div className="flex flex-row gap-12 mt-4  items-center">
        <div className="flex flex-row  items-center gap-4">
          <span className="font-semibold">Enter a keyword </span>
          <input
            className="border-1 px-2 py-1 focus:border-[#1EAE98] border-gray-400 rounded-lg"
            type="text"
            placeholder="eg: coffee shop"
            value={keyword}
            onChange={(e) => setkeyword(e.target.value)}
          />
        </div>
        <div className="flex flex-row  items-center gap-4">
          <span className="font-semibold">Enter a location </span>
          <input
            className="border-1 px-2 py-1 focus:border-[#1EAE98] border-gray-400 rounded-lg"
            type="text"
            placeholder="eg: texas"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button
          onClick={handleStart}
          className="bg-[#1EAE98] flex items-center justify-center text-white px-8 py-1 rounded-lg cursor-pointer hover:bg-[#1eae7c]"
        >
          Start
        </button>
      </div>
      {showAlert && <span className="text-red-600 text-sm ">Please enter both a keyword and a location!</span>}
      {loading ? (
        <div className="pt-6">
          <span className="text-[#1EAE98]">
            Data collection has started. Please wait...
          </span>
          <div className="flex h-[300px] items-center justify-center">
            <PropagateLoader color="#1EAE98" />
          </div>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : googleMapData?.results?.length > 0 ? (
        <div className="flex flex-col gap-6 mt-10">
          <StickyHeadTable data={googleMapData?.results || []} />
          <DownloadDataBlock data={googleMapData?.results || []} />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default GoogleMapData;
