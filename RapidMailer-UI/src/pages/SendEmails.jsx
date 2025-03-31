import React, { useContext, useState } from "react";
import StickyHeadTable from "../components/EmailTable";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { EmailsVerifyContext } from "../context/EmailsVerifyContext";
import { COLORS } from "../constants/theme";
// import EmailEditor from "../components/EmailEditor";

const SendEmails = () => {
  const navigate = useNavigate();
  const [emailData, setEmailData] = useState([]);
  const [isDataEmptyError, setIsDataEmptyError] = useState(false);
  const { validateEmails } = useContext(EmailsVerifyContext);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const emails = result.data.map((row) => ({ email: row[0] }));
          setEmailData(emails);
          setIsDataEmptyError(false);
        },
        skipEmptyLines: true,
      });
    }
  };

  const handleStart = () => {
    if (emailData.length === 0) {
      setIsDataEmptyError(true);
      return;
    }

    setIsDataEmptyError(false);

    // Extract emails from emailData
    const emails = emailData.map((row) => row.email);

    // Call the validateEmails function
    validateEmails(emails);

    navigate("/validation-results");
  };

  return (
    <div
      style={{ backgroundColor: COLORS.background }}
      className="flex flex-col lg:flex-row p-6 h-full"
    >
      <div>
      <div className="flex flex-col lg:gap-4 lg:flex-1">
        <h1 className="text-lg font-bold">Email Validation</h1>
        <div className="flex flex-row mt-12 gap-4 items-center">
          <h1 className="text-lg font-semibold">Add Email List</h1>
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
            onChange={handleFileUpload}
          />
          <button
            onClick={() => setEmailData([])}
            className="bg-red-700 text-white px-3 rounded-sm cursor-pointer"
          >
            Clear
          </button>
        </div>
        {isDataEmptyError ? (
          <span className="mt-6 text-red-500">Pease add a email list.</span>
        ) : (
          <></>
        )}

        <button
          onClick={handleStart}
          className="bg-[#1EAE98] mt-10 text-white rounded-sm w-[100px] cursor-pointer"
        >
          Start
        </button>
      </div>
      <div className="mt-12 lg:mt-0 flex-1">
        <div className="lg:mt-20">
          <StickyHeadTable data={emailData} />
        </div>
      </div>
      </div>
      <div>
        {/* <EmailEditor /> */}
      </div>
    </div>
  );
};



export default SendEmails;