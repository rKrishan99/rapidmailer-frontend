import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { RiUpload2Line, RiDeleteBinLine, RiPlayFill, RiMailCheckLine } from "react-icons/ri";
import StickyHeadTable from "../components/EmailTable";
import { EmailsVerifyContext } from "../context/EmailsVerifyContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";

const VerifyEmails = () => {
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
    const emails = emailData.map((row) => row.email);
    validateEmails(emails);
    navigate("/validation-results");
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Email"
        title="Email Validation"
        description="Upload a CSV of email addresses to check which ones are deliverable."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-5 p-6">
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
            <Button variant="danger" onClick={() => setEmailData([])}>
              <RiDeleteBinLine />
              Clear
            </Button>
          </div>

          {emailData.length > 0 && (
            <p className="text-sm text-slate-400">{emailData.length} emails loaded.</p>
          )}

          {isDataEmptyError && (
            <span className="text-sm text-rose-400">Please add an email list.</span>
          )}

          <div>
            <Button onClick={handleStart}>
              <RiPlayFill />
              Start
            </Button>
          </div>
        </Card>

        <div>
          {emailData.length > 0 ? (
            <StickyHeadTable data={emailData} />
          ) : (
            <EmptyState
              icon={RiMailCheckLine}
              title="No emails loaded"
              description="Upload a CSV file to preview the addresses here."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmails;
