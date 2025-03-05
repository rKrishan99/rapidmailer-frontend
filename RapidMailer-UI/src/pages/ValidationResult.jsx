import React from "react";
import StickyHeadTable from "../components/EmailTable";
import { render } from "react-dom";
import CircularProgress from "../components/CircularProgress";

const ValidationResult = () => {
  return (
    <div className="flex gap-20 p-6 h-full bg-[#233E8B]">
      <div className="flex-1 flex-col gap-6">
        <h1>Valid emails</h1>
        <div>
          <h1></h1>
          <StickyHeadTable data={[]} />
        </div>
        <button className="bg-[#1EAE98] mt-6 text-white rounded-sm w-[100px] cursor-pointer">Export</button>
      </div>

      <div className="flex-1">
        <h1>Overview</h1>
        <CircularProgress />
      </div>
    </div>
  );
};

export default ValidationResult;
