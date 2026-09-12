import { useRef, useCallback, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { RiAddLine } from "react-icons/ri";
import { Input } from "./ui/Field";

// ---------------------------------------------------------------------------
// Quill toolbar configuration — Gmail-style subset
// ---------------------------------------------------------------------------
const QUILL_MODULES = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "bold", "italic", "underline", "strike",
  "list",
  "link",
];

// ---------------------------------------------------------------------------
// MailMergeComposer
// ---------------------------------------------------------------------------

/**
 * In-page Gmail-style email composer for the mail-merge (personalized) flow.
 *
 * Props
 * ─────
 * subject        string       Current subject line value
 * onSubjectChange fn          Called whenever subject changes
 * body           string       Current body HTML value
 * onBodyChange   fn           Called whenever body changes
 * columns        string[]     All CSV column names available as merge tags
 * subjectError   string|null  Inline validation message for subject
 * bodyError      string|null  Inline validation message for body
 */
const MailMergeComposer = ({
  subject,
  onSubjectChange,
  body,
  onBodyChange,
  columns = [],
  subjectError,
  bodyError,
}) => {
  const quillRef = useRef(null);
  const subjectRef = useRef(null);
  const [selectedColumn, setSelectedColumn] = useState("");

  // Keep selectedColumn in sync when columns first load
  const effectiveColumn = selectedColumn || columns[0] || "";

  // ── Insert merge tag into subject ──────────────────────────────────────
  const insertIntoSubject = useCallback(() => {
    if (!effectiveColumn) return;
    const tag = `{{${effectiveColumn}}}`;
    const input = subjectRef.current;

    if (input) {
      const start = input.selectionStart ?? subject.length;
      const end = input.selectionEnd ?? subject.length;
      const next = subject.slice(0, start) + tag + subject.slice(end);
      onSubjectChange(next);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        input.setSelectionRange(start + tag.length, start + tag.length);
        input.focus();
      });
    } else {
      onSubjectChange(subject + tag);
    }
  }, [effectiveColumn, subject, onSubjectChange]);

  // ── Insert merge tag into Quill body ──────────────────────────────────
  const insertIntoBody = useCallback(() => {
    if (!effectiveColumn) return;
    const tag = `{{${effectiveColumn}}}`;
    const quill = quillRef.current?.getEditor?.();

    if (quill) {
      const range = quill.getSelection(true); // focus + get cursor
      const index = range ? range.index : quill.getLength() - 1;
      quill.insertText(index, tag, "user");
      quill.setSelection(index + tag.length, 0);
    } else {
      // Fallback: append to body HTML as plain text
      onBodyChange(body + tag);
    }
  }, [effectiveColumn, body, onBodyChange]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Subject line ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <Input
          ref={subjectRef}
          label="Subject"
          placeholder="e.g. Hey {{business_name}}, we noticed something…"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />
        {subjectError && (
          <span className="text-xs text-rose-400">{subjectError}</span>
        )}
      </div>

      {/* ── Body editor ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-slate-300">Body</span>
        <div className="quill-wrapper rounded-xl overflow-hidden border border-white/10">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={body}
            onChange={onBodyChange}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            placeholder="Write your email body here… use {{column_name}} as merge tags."
          />
        </div>
        {bodyError && (
          <span className="text-xs text-rose-400">{bodyError}</span>
        )}
      </div>

      {/* ── Merge-tag insertion panel ─────────────────────────────────── */}
      {columns.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Insert Merge Tag
          </span>

          <div className="flex flex-wrap items-center gap-3">
            {/* Column selector */}
            <select
              value={effectiveColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-violet-400/60 cursor-pointer"
            >
              {columns.map((col) => (
                <option key={col} value={col}>
                  {`{{${col}}}`}
                </option>
              ))}
            </select>

            {/* Insert buttons */}
            <button
              type="button"
              onClick={insertIntoSubject}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/[0.1] cursor-pointer"
            >
              <RiAddLine />
              Insert into Subject
            </button>

            <button
              type="button"
              onClick={insertIntoBody}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/[0.1] cursor-pointer"
            >
              <RiAddLine />
              Insert into Body
            </button>
          </div>

          {/* Available tags reference */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {columns.map((col) => (
              <span
                key={col}
                title={`Click "Insert" above to add {{${col}}} to your email`}
                className="rounded-md bg-violet-900/30 px-2 py-0.5 font-mono text-xs text-violet-300 border border-violet-500/20"
              >
                {`{{${col}}}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MailMergeComposer;
