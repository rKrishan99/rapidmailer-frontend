import React from "react";
import StickyHeadTable from "../components/EmailTable";
import { useNavigate } from "react-router-dom";

const VerifyEmails = () => {

  const navigate = useNavigate();

  return (
    <div className="flex p-6 h-full bg-[#233E8B]">
      <div className="flex flex-col gap-4 flex-1">
        <h1 className="text-lg font-bold text-white">Email Validation</h1>
        <div className="flex flex-row mt-12 gap-4 items-center">
          <h1 className="text-lg font-semibold text-white">Add Email List</h1>
          <label
            htmlFor="csv-file-input"
            className="bg-[#1EAE98] cursor-pointer px-4 py-1 rounded-sm text-white"
          >
            Choose CSV File
          </label>
          <input
            id="csv-file-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files[0];
              if (file) {
                console.log("Selected file:", file.name);
              }
            }}
          />
          <button className="bg-red-700 text-white px-3 rounded-sm cursor-pointer">
            Clear
          </button>
        </div>
        <button onClick={() => navigate('/validation-results')} className="bg-[#1EAE98] mt-10 text-white rounded-sm w-[100px] cursor-pointer">
          Start
        </button>
      </div>
      <div className="flex-1">
        <div className="mt-20">
          <StickyHeadTable data={[]} />
        </div>
      </div>
    </div>
  );
};

export default VerifyEmails;
