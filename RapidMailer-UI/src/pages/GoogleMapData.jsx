import React from "react";

const GoogleMapData = () => {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1>Scrpe data from google</h1>
      <div className="flex flex-row gap-6  items-center">
        <div className="flex flex-row  items-center gap-4">
          <span>Enter a keyword </span>
          <input className="border-1 px-2 py-1 focus:border-[#1EAE98] border-gray-400 rounded-lg" type="text" placeholder="" />
        </div>
        <div className="flex flex-row  items-center gap-4">
          <span>Enter a location </span>
          <input className="border-1 px-2 py-1 focus:border-[#1EAE98] border-gray-400 rounded-lg" type="text" placeholder="" />
        </div>
        <button className="bg-[#1EAE98] flex items-center justify-center text-white px-8 py-1 rounded-lg cursor-pointer hover:bg-[#1eae7c]">Start</button>
      </div>
    </div>
  );
};

export default GoogleMapData;
