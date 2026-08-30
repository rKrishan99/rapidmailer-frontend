import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  RiUpload2Line,
  RiDeleteBinLine,
  RiPlayFill,
  RiMailAddLine,
  RiEditLine,
  RiSendPlaneLine,
} from "react-icons/ri";
import StickyHeadTable from "../components/EmailTable";
import { useEmailContext } from "../context/EmailContext";
import { UploadedListsContext } from "../context/UploadedListsContext";
import { EmailsSendContext } from "../context/EmailsSendContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";

const SendEmails = () => {
  const navigate = useNavigate();
  const [isDataEmptyError, setIsDataEmptyError] = useState(false);
  const [isEmailEmptyError, setIsEmailEmptyError] = useState(false);
  const { emailTemplate, setIsEditing } = useEmailContext();
  const { emailList, setEmailList } = useContext(UploadedListsContext);
  const { setResponse, SendEmails } = useContext(EmailsSendContext);

  const handleEditEmail = () => {
    setIsEditing(true);
    navigate("/create-email");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          const emails = result.data.map((row) => ({ email: row[0] }));
          setEmailList(emails);
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
    const emails = emailList.map((row) => row.email);
    const response = SendEmails(emailTemplate, emails);
    setResponse(response);
    navigate("/sent-results");
    setEmailList([]);
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Email"
        title="Email Campaign"
        description="Create the email, upload your list, then send it in one click."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-5 p-6">
          {emailTemplate == null ? (
            <Button onClick={() => navigate("/create-email")} className="w-fit">
              <RiMailAddLine />
              Create an Email
            </Button>
          ) : (
            <Button onClick={handleEditEmail} className="w-fit">
              <RiEditLine />
              Edit the Email
            </Button>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="csv-file-input"
              className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
            >
              <RiUpload2Line />
              Choose CSV File
            </label>
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button variant="danger" onClick={() => setEmailList([])}>
              <RiDeleteBinLine />
              Clear
            </Button>
          </div>

          {emailList.length > 0 && (
            <p className="text-sm text-slate-400">{emailList.length} emails loaded.</p>
          )}

          <div className="flex flex-col gap-2">
            {isDataEmptyError && (
              <span className="text-sm text-rose-400">Please add an email list.</span>
            )}
            {isEmailEmptyError && (
              <span className="text-sm text-rose-400">Please create an email.</span>
            )}
          </div>

          <div>
            <Button onClick={handleStart}>
              <RiPlayFill />
              Start
            </Button>
          </div>
        </Card>

        <div>
          {emailList.length > 0 ? (
            <StickyHeadTable data={emailList} />
          ) : (
            <EmptyState
              icon={RiSendPlaneLine}
              title="No recipients loaded"
              description="Upload a CSV file to preview the recipient list here."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SendEmails;
