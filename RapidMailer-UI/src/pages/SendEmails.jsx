import React, { useContext, useState } from "react";
import StickyHeadTable from "../components/EmailTable";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { EmailsVerifyContext } from "../context/EmailsVerifyContext";
import { COLORS } from "../constants/theme";
import { MdOutlineAttachEmail } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import { useEmailContext } from "../context/EmailContext";
import { UploadedListsContext } from "../context/UploadedListsContext";
import { EmailsSendContext } from "../context/EmailsSendContext";

const SendEmails = () => {
  const navigate = useNavigate();
  const [isDataEmptyError, setIsDataEmptyError] = useState(false);
  const [isEmailEmptyError, setIsEmailEmptyError] = useState(false);
  const { emailTemplate, setIsEditing } = useEmailContext();
  const { emailList, setEmailList } = useContext(UploadedListsContext);
  const { setResponse, SendEmails } = useContext(EmailsSendContext);

  const handleEditEmail = () => {
    setIsEditing(true); // Set editing mode to true
    navigate("/create-email"); // Navigate to editor
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const emails = result.data.map((row) => ({ email: row[0] }));
          setEmailList(emails);
          console.log(emails);
          setIsDataEmptyError(false);
        },
        skipEmptyLines: true,
      });
    }
  };

  const handleStart = () => {
    if (emailTemplate === null) {
      setIsEmailEmptyError(true);
      return;
    }

    if (emailList.length === 0) {
      setIsDataEmptyError(true);
      return;
    }

    setIsDataEmptyError(false);

    // Extract emails from emailData
    const emails = emailList.map((row) => row.email);

    // Call the validateEmails function
    const response = SendEmails(emailTemplate, emails);
    setResponse(response);
    console.log(response);
    navigate("/sent-results");
    setEmailList([]);
  };

  return (
    <div
      style={{ backgroundColor: COLORS.background }}
      className="flex flex-col p-6 h-full"
    >
      <h1 className="text-lg font-bold">Email Campeign</h1>
      <div className="flex w-full">
        <div className="flex-1 flex-col lg:gap-4 lg:flex-1">
          {emailTemplate == null ? (
            <div
              onClick={() => navigate("/create-email")}
              style={{
                backgroundColor: COLORS.primary,
              }}
              className="flex flex-row items-center justify-center gap-2 w-[200px] mt-12 rounded-lg  cursor-pointer py-2 px-4"
            >
              <MdOutlineAttachEmail className="text-white text-md mt-1" />
              <span className="text-white text-md">Create an Email</span>
            </div>
          ) : (
            <div
              onClick={handleEditEmail}
              style={{
                backgroundColor: COLORS.primary,
              }}
              className="flex flex-row items-center justify-center gap-2 w-[200px] mt-12 rounded-lg  cursor-pointer py-2 px-4"
            >
              <FaRegEdit className="text-white text-md mt-1" />
              <span className="text-white text-md">Edit the Email</span>
            </div>
          )}
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

          <div className="mt-10">
            {isDataEmptyError ? (
              <span className="mt-6 text-red-500">
                Pease add an email list.
              </span>
            ) : (
              <></>
            )}
            {isEmailEmptyError ? (
              <span className="mt-6 text-red-500">Pease Create an email.</span>
            ) : (
              <></>
            )}
          </div>

          <button
            onClick={handleStart}
            className="bg-[#1EAE98] mt-4 text-white rounded-sm w-[100px] cursor-pointer"
          >
            Start
          </button>
        </div>
        <div className="mt-12 lg:mt-0 flex-1">
          <div className="lg:mt-20">
            {emailList.length !== 0 && <StickyHeadTable data={emailList} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmails;
