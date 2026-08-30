import { useState } from "react";
import { saveAs } from "file-saver";
import { RiDownloadLine } from "react-icons/ri";
import Button from "./ui/Button";

const DownloadDataBlock = ({ data, showOption }) => {
  const [mode, setMode] = useState("all");

  const downloadCSV = () => {
    if (!data || data.length === 0) {
      alert("No data available to download.");
      return;
    }

    let csvContent;

    if (mode === "all") {
      const headers = Object.keys(data[0]);
      csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...data.map((row) => headers.map((key) => row[key]).join(","))].join(
          "\n"
        );
    } else {
      const headers = ["emails"];
      csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...data.map((row) =>
            headers.map((key) => (Array.isArray(row[key]) ? row[key].join("; ") : row[key])).join(",")
          ),
        ].join("\n");
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, mode === "all" ? "all_data.csv" : "emails_only.csv");
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-6">
      {showOption && (
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="export-mode"
              checked={mode === "all"}
              onChange={() => setMode("all")}
              className="h-4 w-4 accent-violet-500"
            />
            Export all data
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="export-mode"
              checked={mode === "emails"}
              onChange={() => setMode("emails")}
              className="h-4 w-4 accent-violet-500"
            />
            Export emails only
          </label>
        </div>
      )}

      <Button onClick={downloadCSV} variant="primary">
        <RiDownloadLine />
        Export
      </Button>
    </div>
  );
};

export default DownloadDataBlock;
