import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import {
  RiUpload2Line,
  RiDeleteBinLine,
  RiPlayFill,
  RiMailAddLine,
  RiEditLine,
  RiSendPlaneLine,
  RiFlaskLine,
  RiMailSendLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import StickyHeadTable from "../components/EmailTable";
import { useEmailContext } from "../context/EmailContext";
import { UploadedListsContext } from "../context/UploadedListsContext";
import { useEmailSend } from "../context/EmailsSendContext";
import { parseLeadsCsv, sanitizeEmailCell } from "../utils/leadCsv";
import EmailAccountSelect from "../components/EmailAccountSelect";
import { useEmailAccounts } from "../context/EmailAccountsContext";
import MailMergeComposer from "../components/MailMergeComposer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";
import PageHeader from "../components/ui/PageHeader";
import EmptyState from "../components/ui/EmptyState";
import DataTable from "../components/ui/DataTable";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip HTML tags and collapse whitespace to check if a Quill body has any real content. */
function hasRealContent(html) {
  if (!html) return false;
  const text = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return text.length > 0;
}

/**
 * Given all column headers, find the most likely email column by name.
 * Returns the matching column name or "" if none found.
 */
function detectEmailColumn(columns) {
  const candidates = ["email", "Email", "EMAIL", "e-mail", "E-mail", "emailAddress", "email_address"];
  for (const c of candidates) {
    if (columns.includes(c)) return c;
  }
  return "";
}

/**
 * Client-side email format check — mirrors the backend's validateEmail utility.
 * Uses the full sanitizer so cells like "user@a.com website" are counted correctly.
 */
function isValidEmail(value) {
  return sanitizeEmailCell(value) !== null;
}

const EMAIL_ADDR_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmailAddress(value) {
  return EMAIL_ADDR_RE.test(String(value || "").trim().toLowerCase());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const SendEmails = () => {
  const navigate = useNavigate();

  // ── Blast-mode shared state ─────────────────────────────────────────────
  const { emailTemplate, emailHtml, subject, setIsEditing } = useEmailContext();
  const { emailList, setEmailList } = useContext(UploadedListsContext);
  const { sendCampaign, setCampaignData } = useEmailSend();
  const { accounts } = useEmailAccounts();

  const [sendMode, setSendMode]     = useState("blast");
  const [accountId, setAccountId]   = useState("");

  // Default to the first account once accounts load
  useEffect(() => {
    if (!accountId && accounts.length > 0) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  // ── Personalized-mode state ─────────────────────────────────────────────
  const [records, setRecords]               = useState([]);
  const [csvColumns, setCsvColumns]         = useState([]);
  const [emailColumn, setEmailColumn]       = useState("");
  const [recordsFileName, setRecordsFileName] = useState("");

  // In-page composer state (personalized mode only)
  const [mergeSubject, setMergeSubject] = useState("");
  const [mergeBody, setMergeBody]       = useState("");

  // ── Test / Verify mode state ────────────────────────────────────────────
  // testMode: "none" | "single" | "bcc"
  const [testMode, setTestMode]   = useState("none");
  const [testEmail, setTestEmail] = useState("");

  // ── Validation errors ───────────────────────────────────────────────────
  const [errors, setErrors] = useState({});

  // ── Blast file upload ───────────────────────────────────────────────────
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      complete: (result) => {
        const emails = result.data.map((row) => ({ email: row[0] }));
        setEmailList(emails);
        setErrors((e) => ({ ...e, data: null }));
      },
      skipEmptyLines: true,
    });
    event.target.value = "";
  };

  // ── Personalized CSV upload ─────────────────────────────────────────────
  const handleRecordsUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setRecordsFileName(file.name);
    const rows = await parseLeadsCsv(file);

    if (rows.length === 0) {
      setErrors((e) => ({ ...e, data: "The uploaded CSV appears to be empty." }));
      event.target.value = "";
      return;
    }

    const columns = Object.keys(rows[0]);
    setCsvColumns(columns);
    setRecords(rows);

    const detected = detectEmailColumn(columns);
    setEmailColumn(detected);

    setErrors((e) => ({ ...e, data: null, emailColumn: null }));
    event.target.value = "";
  };

  const handleClearRecords = () => {
    setRecords([]);
    setCsvColumns([]);
    setEmailColumn("");
    setRecordsFileName("");
    setErrors({});
  };

  // ── Test mode toggle helpers ────────────────────────────────────────────
  const handleTestModeToggle = (mode) => {
    setTestMode((prev) => (prev === mode ? "none" : mode));
    setErrors((e) => ({ ...e, testEmail: null }));
  };

  // ── Send handler ────────────────────────────────────────────────────────
  const handleStart = () => {
    const nextErrors = {};

    if (accounts.length > 0 && !accountId) {
      nextErrors.account = "Pick which account to send this campaign from.";
    }

    // Test mode validation
    if (testMode !== "none") {
      if (!testEmail.trim() || !isValidEmailAddress(testEmail.trim())) {
        nextErrors.testEmail = "Enter a valid verification email address.";
      }
    }

    if (sendMode === "personalized") {
      if (!emailColumn) {
        nextErrors.emailColumn = "Select which column contains the recipient email addresses.";
      }
      if (!mergeSubject.trim()) {
        nextErrors.subject = "Please enter a subject line.";
      }
      if (!hasRealContent(mergeBody)) {
        nextErrors.body = "Please write an email body.";
      }
      if (records.length === 0) {
        nextErrors.data = "Please upload a leads CSV first.";
      } else if (emailColumn) {
        const validCount = records.filter((r) => isValidEmail(r[emailColumn])).length;
        if (validCount === 0) {
          nextErrors.emailColumn =
            `None of the rows in "${emailColumn}" contain a valid email address. ` +
            `Please choose a different column or fix the CSV.`;
        }
      }
    } else {
      if (!emailTemplate) {
        nextErrors.template = "Please create an email template first.";
      }
      if (!subject || !subject.trim()) {
        nextErrors.subject = "Please add a subject line (edit the email to set one).";
      }
      if (emailList.length === 0) {
        nextErrors.data = "Please add an email list.";
      } else {
        const validCount = emailList.filter((r) => isValidEmail(r.email)).length;
        if (validCount === 0) {
          nextErrors.data = "None of the emails in your list are valid. Please check the CSV.";
        }
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // ── Dispatch ───────────────────────────────────────────────────────────
    if (sendMode === "personalized") {
      const remapped = records
        .filter((r) => isValidEmail(r[emailColumn]))
        .map((r) => ({ ...r, email: sanitizeEmailCell(r[emailColumn]) }));

      const skippedCount = records.length - remapped.length;

      if (skippedCount > 0) {
        setErrors((prev) => ({
          ...prev,
          skipWarning:
            `${skippedCount} row${skippedCount === 1 ? "" : "s"} skipped — ` +
            `blank or malformed address in the "${emailColumn}" column. ` +
            `Sending to the remaining ${remapped.length} valid recipient${remapped.length === 1 ? "" : "s"}.`,
        }));
      }

      const mailTemplate = { subject: mergeSubject, html: mergeBody };

      navigate("/sent-results");
      setCampaignData(null);
      sendCampaign({
        emailTemplate: mailTemplate,
        mode: "personalized",
        records: remapped,
        accountId,
        testMode,
        testEmail: testMode !== "none" ? testEmail.trim() : undefined,
      }).catch(() => {});
      handleClearRecords();
    } else {
      const validEmails = emailList
        .map((r) => String(r.email || "").trim())
        .map(sanitizeEmailCell)
        .filter(Boolean);

      const mailTemplate = { subject, html: emailHtml };

      navigate("/sent-results");
      setCampaignData(null);
      sendCampaign({
        emailTemplate: mailTemplate,
        emails: validEmails,
        accountId,
        testMode,
        testEmail: testMode !== "none" ? testEmail.trim() : undefined,
      }).catch(() => {});
      setEmailList([]);
    }
  };

  const handleEditEmail = () => {
    setIsEditing(true);
    navigate("/create-email");
  };

  // ── Preview table columns for personalized mode ─────────────────────────
  const previewColumns = (() => {
    if (csvColumns.length === 0) return [];
    const cols = emailColumn ? [emailColumn] : [];
    for (const c of csvColumns) {
      if (!cols.includes(c) && cols.length < 3) cols.push(c);
    }
    return cols.map((c) => ({ id: c, label: c, minWidth: 180 }));
  })();

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Email"
        title="Email Campaign"
        description="Create the email, choose how you want to send it, then go."
      />

      {/* ── Campaign settings card ─────────────────────────────────────── */}
      <Card className="flex flex-col gap-5 p-6">
        <Toggle
          checked={sendMode === "personalized"}
          onChange={(checked) => {
            setSendMode(checked ? "personalized" : "blast");
            setErrors({});
          }}
          label="Personalized (mail-merge)"
          description="Each recipient gets their own subject/body filled in from their CSV row — e.g. {{business_name}}, {{score}}. Off = same email to everyone."
        />

        {/* Blast mode — template picker */}
        {sendMode === "blast" && (
          <>
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
                {subject && (
                  <span className="text-sm text-slate-400">Subject: {subject}</span>
                )}
              </div>
            )}
            {errors.template && (
              <span className="text-sm text-rose-400">{errors.template}</span>
            )}
            {errors.subject && (
              <span className="text-sm text-rose-400">{errors.subject}</span>
            )}
          </>
        )}

        <EmailAccountSelect value={accountId} onChange={setAccountId} />
        {errors.account && (
          <span className="text-sm text-rose-400">{errors.account}</span>
        )}
      </Card>

      {/* ── Test & Verify card ─────────────────────────────────────────── */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
            <RiFlaskLine className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Test &amp; Verify <span className="ml-1.5 rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-slate-400">optional</span></h3>
            <p className="text-xs text-slate-500">Verify formatting and SMTP deliverability before the full queue runs.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          {/* Single Test Lead */}
          <button
            type="button"
            onClick={() => handleTestModeToggle("single")}
            className={`flex flex-1 items-start gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
              testMode === "single"
                ? "border-violet-500/50 bg-violet-500/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${testMode === "single" ? "bg-violet-500/20" : "bg-white/[0.06]"}`}>
              <RiMailSendLine className={testMode === "single" ? "text-violet-400" : "text-slate-400"} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${testMode === "single" ? "text-violet-200" : "text-slate-200"}`}>
                Send Single Test Lead
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Dispatches row&nbsp;#1 to your email with all merge variables filled in. Full queue is <strong className="text-slate-400">not</strong> triggered.
              </p>
            </div>
            <div className={`ml-auto mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${testMode === "single" ? "border-violet-400 bg-violet-400" : "border-slate-600"}`} />
          </button>

          {/* BCC Owner */}
          <button
            type="button"
            onClick={() => handleTestModeToggle("bcc")}
            className={`flex flex-1 items-start gap-3 rounded-xl border p-4 text-left transition-all cursor-pointer ${
              testMode === "bcc"
                ? "border-violet-500/50 bg-violet-500/10"
                : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}
          >
            <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${testMode === "bcc" ? "bg-violet-500/20" : "bg-white/[0.06]"}`}>
              <RiShieldCheckLine className={testMode === "bcc" ? "text-violet-400" : "text-slate-400"} />
            </div>
            <div>
              <p className={`text-sm font-semibold ${testMode === "bcc" ? "text-violet-200" : "text-slate-200"}`}>
                BCC Me on Every Dispatch
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Full queue runs normally. You receive a silent BCC copy of every email sent.
              </p>
            </div>
            <div className={`ml-auto mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${testMode === "bcc" ? "border-violet-400 bg-violet-400" : "border-slate-600"}`} />
          </button>
        </div>

        {/* Verification email input — visible when any test mode is active */}
        {testMode !== "none" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">
              Your verification email <span className="text-rose-400">*</span>
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => {
                setTestEmail(e.target.value);
                setErrors((er) => ({ ...er, testEmail: null }));
              }}
              placeholder="you@gmail.com"
              className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-violet-400/60"
            />
            {errors.testEmail && (
              <span className="text-xs text-rose-400">{errors.testEmail}</span>
            )}
            {testMode === "single" && (
              <p className="text-xs text-slate-500">
                The first lead's email will be replaced with yours, and the subject will be prefixed with <code className="rounded bg-white/[0.06] px-1 py-0.5 text-violet-300">[TEST]</code>.
              </p>
            )}
          </div>
        )}
      </Card>

      {/* ── Main content grid ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Left column — CSV upload + controls */}
        <Card className="flex flex-col gap-5 p-6">
          {sendMode === "personalized" ? (
            <>
              {/* File upload row */}
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="records-csv-input"
                  className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
                >
                  <RiUpload2Line />
                  {records.length > 0 ? "Replace CSV" : "Choose Leads CSV"}
                </label>
                <input
                  id="records-csv-input"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleRecordsUpload}
                />
                {records.length > 0 && (
                  <Button variant="danger" onClick={handleClearRecords}>
                    <RiDeleteBinLine />
                    Clear
                  </Button>
                )}
              </div>

              {recordsFileName && (
                <p className="text-sm text-slate-400">
                  <span className="font-medium text-slate-200">{recordsFileName}</span>
                  {" — "}
                  {records.length} row{records.length !== 1 ? "s" : ""} loaded
                </p>
              )}

              {/* Dynamic email column selector */}
              {csvColumns.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-300">
                    Recipient Email Column{" "}
                    <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={emailColumn}
                    onChange={(e) => {
                      setEmailColumn(e.target.value);
                      setErrors((er) => ({ ...er, emailColumn: null, skipWarning: null }));
                    }}
                    className="rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-violet-400/60 cursor-pointer"
                  >
                    <option value="">— Select a column —</option>
                    {csvColumns.map((col) => (
                      <option key={col} value={col}>
                        {col}
                      </option>
                    ))}
                  </select>
                  {emailColumn && (() => {
                    const valid = records.filter((r) => isValidEmail(r[emailColumn])).length;
                    const total = records.filter((r) => r[emailColumn] && String(r[emailColumn]).trim()).length;
                    const invalid = total - valid;
                    return (
                      <p className="text-xs text-slate-500">
                        <span className="text-slate-300 font-medium">{valid}</span> valid recipient{valid !== 1 ? "s" : ""}
                        {invalid > 0 && (
                          <span className="ml-1 text-amber-400">· {invalid} with invalid/blank address (will be skipped)</span>
                        )}
                      </p>
                    );
                  })()}
                  {errors.emailColumn && (
                    <span className="text-xs text-rose-400">{errors.emailColumn}</span>
                  )}
                </div>
              )}

              {/* Skip warning — shown when some rows were dropped at dispatch */}
              {errors.skipWarning && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-300">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  <span>{errors.skipWarning}</span>
                </div>
              )}

              {errors.data && (
                <span className="text-sm text-rose-400">{errors.data}</span>
              )}
            </>
          ) : (
            /* Blast mode — plain email-list CSV */
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
              {errors.data && (
                <span className="text-sm text-rose-400">{errors.data}</span>
              )}
            </>
          )}

          {/* Start button */}
          <div className="pt-1">
            <Button onClick={handleStart}>
              <RiPlayFill />
              {testMode === "single" ? "Send Test Email" : "Start Campaign"}
            </Button>
          </div>
        </Card>

        {/* Right column — preview table */}
        <div>
          {sendMode === "personalized" ? (
            records.length > 0 ? (
              <DataTable
                columns={
                  previewColumns.length > 0
                    ? previewColumns
                    : [{ id: csvColumns[0], label: csvColumns[0], minWidth: 220 }]
                }
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

      {/* ── In-page composer (personalized mode only) ────────────────────── */}
      {sendMode === "personalized" && (
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-slate-100">Compose Email</h3>
            <p className="text-sm text-slate-400">
              Use{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-xs text-violet-300">
                {"{{column_name}}"}
              </code>{" "}
              anywhere in the subject or body. Each recipient gets the value from their own row.
            </p>
          </div>

          <MailMergeComposer
            subject={mergeSubject}
            onSubjectChange={(val) => {
              setMergeSubject(val);
              setErrors((e) => ({ ...e, subject: null }));
            }}
            body={mergeBody}
            onBodyChange={(val) => {
              setMergeBody(val);
              setErrors((e) => ({ ...e, body: null }));
            }}
            columns={csvColumns}
            subjectError={errors.subject}
            bodyError={errors.body}
          />
        </Card>
      )}
    </div>
  );
};

export default SendEmails;
