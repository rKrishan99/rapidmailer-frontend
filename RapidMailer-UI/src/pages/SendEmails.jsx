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
import { parseLeadsCsv } from "../utils/leadCsv";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import DataTable from "../components/ui/DataTable";

const SendEmails = () => {
  const navigate = useNavigate();
  const [isDataEmptyError, setIsDataEmptyError] = useState(false);
  const [isEmailEmptyError, setIsEmailEmptyError] = useState(false);
  const [isSubjectEmptyError, setIsSubjectEmptyError] = useState(false);
  const { emailTemplate, emailHtml, subject, setIsEditing } = useEmailContext();
  const { emailList, setEmailList } = useContext(UploadedListsContext);
  const { setResponse, SendEmails } = useContext(EmailsSendContext);

  // "blast" = same content to every address (plain email-list CSV).
  // "personalized" = mail-merge: each recipient's own row data fills in
  // {{field}} placeholders in the subject/body.
  const [sendMode, setSendMode] = useState("blast");
  const [records, setRecords] = useState([]);
  const [recordsFileName, setRecordsFileName] = useState("");

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

  const handleRecordsUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setRecordsFileName(file.name);
    const rows = await parseLeadsCsv(file);
    setRecords(rows.filter((r) => r.email));
    setIsDataEmptyError(false);
    event.target.value = "";
  };

  const handleStart = () => {
    if (emailTemplate === null) {
      setIsEmailEmptyError(true);
      return;
    }
    if (!subject || !subject.trim()) {
      setIsSubjectEmptyError(true);
      return;
    }

    setIsEmailEmptyError(false);
    setIsSubjectEmptyError(false);

    const mailTemplate = { subject, html: emailHtml };

    if (sendMode === "personalized") {
      if (records.length === 0) {
        setIsDataEmptyError(true);
        return;
      }
      setIsDataEmptyError(false);

      navigate("/sent-results");
      setResponse(null);
      SendEmails({ emailTemplate: mailTemplate, mode: "personalized", records })
        .then((data) => {
          setResponse(
            `Sent ${data.stats.sent}/${data.stats.total} personalized emails successfully.` +
              (data.stats.failed ? ` ${data.stats.failed} failed.` : "")
          );
        })
        .catch(() => {});
      setRecords([]);
    } else {
      if (emailList.length === 0) {
        setIsDataEmptyError(true);
        return;
      }
      setIsDataEmptyError(false);
      const emails = emailList.map((row) => row.email);

      navigate("/sent-results");
      setResponse(null);
      SendEmails({ emailTemplate: mailTemplate, emails })
        .then((data) => {
          setResponse(
            `Sent ${data.stats.sent}/${data.stats.total} emails successfully.` +
              (data.stats.failed ? ` ${data.stats.failed} failed.` : "")
          );
        })
        .catch(() => {});
      setEmailList([]);
    }
  };

  const mergeFields = records.length > 0 ? Object.keys(records[0]) : [];

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Email"
        title="Email Campaign"
        description="Create the email, choose how you want to send it, then go."
      />

      <Card className="flex flex-col gap-5 p-6">
        {emailTemplate == null ? (
          <Button onClick={() => navigate("/create-email")} className="w-fit">
            <RiMailAddLine />
            Create an Email
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleEditEmail} className="w-fit">
              <RiEditLine />
              Edit the Email
            </Button>
            {subject && <span className="text-sm text-slate-400">Subject: {subject}</span>}
          </div>
        )}
        {isSubjectEmptyError && (
          <span className="text-sm text-rose-400">
            Please add a subject line (edit the email to set one).
          </span>
        )}

        <Toggle
          checked={sendMode === "personalized"}
          onChange={(checked) => setSendMode(checked ? "personalized" : "blast")}
          label="Personalized (mail-merge)"
          description="Each recipient gets their own subject/body filled in from their CSV row — e.g. {{business_name}}, {{score}}. Off = same email to everyone."
        />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-5 p-6">
          {sendMode === "personalized" ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="records-csv-input"
                  className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
                >
                  <RiUpload2Line />
                  Choose Leads CSV
                </label>
                <input
                  id="records-csv-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleRecordsUpload}
                />
                <Button variant="danger" onClick={() => setRecords([])}>
                  <RiDeleteBinLine />
                  Clear
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Needs an <code className="text-slate-400">email</code> column — any other columns
                (name, website, performanceScore, outreachSummary...) become available as{" "}
                <code className="text-slate-400">{"{{field}}"}</code> placeholders.
              </p>
              {recordsFileName && (
                <p className="text-sm text-slate-400">
                  {recordsFileName} — {records.length} recipients with a valid email loaded.
                </p>
              )}
              {mergeFields.length > 0 && (
                <p className="text-xs text-slate-500">
                  Available fields:{" "}
                  {mergeFields.map((f) => (
                    <code key={f} className="mr-1 text-slate-400">
                      {`{{${f}}}`}
                    </code>
                  ))}
                </p>
              )}
            </>
          ) : (
            <>
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
            </>
          )}

          <div className="flex flex-col gap-2">
            {isDataEmptyError && (
              <span className="text-sm text-rose-400">
                {sendMode === "personalized"
                  ? "Please upload a leads CSV with an email column."
                  : "Please add an email list."}
              </span>
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
          {sendMode === "personalized" ? (
            records.length > 0 ? (
              <DataTable
                columns={[
                  { id: "email", label: "Email", minWidth: 220 },
                  { id: "name", label: "Name", minWidth: 180 },
                ]}
                data={records}
                emptyLabel="No recipients loaded"
              />
            ) : (
              <EmptyState
                icon={RiSendPlaneLine}
                title="No recipients loaded"
                description="Upload a leads CSV to preview the recipient list here."
              />
            )
          ) : emailList.length > 0 ? (
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
