import React, { useContext } from "react";
import StickyHeadTable from "../components/EmailTable";
import CircularProgress from "../components/CircularProgress";
import { EmailsVerifyContext } from "../context/EmailsVerifyContext";
import PropagateLoader from "react-spinners/PropagateLoader";

const ValidationResult = () => {
  const { validEmails, totalEmails, loading } = useContext(EmailsVerifyContext);
  const percentage = totalEmails ? (validEmails.length / totalEmails) * 100 : 0;

  return (
    <div className="flex flex-col gap-20 p-6 h-full bg-[#233E8B]">
      <h1>Valid emails</h1>
      {loading ? (
        <div className="flex w-full h-[400px] justify-center items-center">
          <PropagateLoader color="#1EAE98" />
        </div>
      ) : (
        <div className="flex flex-col-reverse lg:flex-row gap-16">
          <div className="flex-1 flex-col gap-6">
            <div>
              <h1></h1>
              <StickyHeadTable data={validEmails.map((email) => ({ email }))} />
            </div>
            <button className="bg-[#1EAE98] mt-6 text-white rounded-sm w-[100px] cursor-pointer">
              Export
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-8">
            <h1>Overview</h1>
            <div className="flex flex-col gap-10 items-center">
              <div className="w-[250px]">
                <CircularProgress percentage={percentage} />
              </div>
              <p>Number of valid emails: {validEmails.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationResult;
