import React, { useContext } from "react";
import CircularProgress from "../components/CircularProgress";
import PropagateLoader from "react-spinners/PropagateLoader";
import { EmailsSendContext } from "../context/EmailsSendContext";

const SentResult = () => {
  const { loading, response } = useContext(EmailsSendContext);
  // const percentage = totalEmails ? (validEmails.length / totalEmails) * 100 : 0;

  return (
    <div className="flex flex-col gap-20 p-6 h-full bg-[#233E8B]">
      <h1>Send Emails</h1>
      {loading ? (
        <div className="flex w-full h-[400px] justify-center items-center">
          <PropagateLoader color="#1EAE98" />
        </div>
      ) : (
        <div className="flex flex-col-reverse lg:flex-row gap-16">
          
          <div className="flex flex-1 flex-col gap-8">
            <h1>Overview</h1>
            <div className="flex flex-col gap-10 items-center">
              {/* <div className="w-[250px]">
                <CircularProgress percentage={percentage} />
              </div>
              <p>Number of valid emails: {validEmails.length}</p> */}
              <p>{response}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentResult;
