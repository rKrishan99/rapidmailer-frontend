import React, { useState } from "react";
import { images } from "../assets/assets";
import { saveAs } from "file-saver";
import { Checkbox } from "@mui/material";

const DownloadDataBlock = ({ data, showOption }) => {
  const [checkAll, setCheckAll] = useState(true);
  const [checkMail, setCheckMail] = useState(false);

  const downloadCSV = () => {
    if (!data || data.length === 0) {
      alert("No data available to download.");
      return;
    }

    // Determine which data to include based on the selected option
    let csvContent;

    if (checkAll) {
      // Export all data
      const headers = Object.keys(data[0]);

      csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...data.map((row) => headers.map((key) => row[key]).join(",")),
        ].join("\n");
    } else if (checkMail) {
      // Export only emails
      const headers = ["emails"]; // Only include the 'emails' column

      csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...data.map((row) =>
            headers.map((key) => (Array.isArray(row[key]) ? row[key].join("; ") : row[key])).join(",")
          ),
        ].join("\n");
    }

    // Create a blob and trigger download
    const encodedUri = encodeURI(csvContent);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, checkAll ? "all_data.csv" : "emails_only.csv");
  };

  const handleChangeAll = () => {
    setCheckAll(true);
    setCheckMail(false);
  };

  const handleChangeMail = () => {
    setCheckAll(false);
    setCheckMail(true);
  };

  return (
    <div className="flex flex-row gap-8 justify-end">
      {showOption && (
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm">Export All Data</span>
            <Checkbox
              checked={checkAll}
              onChange={handleChangeAll}
              inputProps={{ "aria-label": "controlled" }}
              sx={{
                color: "#1EAE98", // Default unchecked color
                "&.Mui-checked": {
                  color: "#1EAE98", // Checked color
                },
              }}
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm">Export Only Emails</span>
            <Checkbox
              checked={checkMail}
              onChange={handleChangeMail}
              inputProps={{ "aria-label": "controlled" }}
              sx={{
                color: "#1EAE98", // Default unchecked color
                "&.Mui-checked": {
                  color: "#1EAE98", // Checked color
                },
              }}
            />
          </div>
        </div>
      )}

      <div
        onClick={downloadCSV}
        className="flex flex-row h-8 items-center gap-1 bg-[#1EAE98] hover:bg-[#1eae7c] px-6 py-2 rounded-lg cursor-pointer"
      >
        <img className="w-4" src={images.downloadIcon} alt="" />
        <span className="text-white">Export</span>
      </div>
    </div>
  );
};

export default DownloadDataBlock;