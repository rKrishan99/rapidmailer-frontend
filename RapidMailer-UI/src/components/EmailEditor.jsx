import { useEffect, useRef, useState } from "react";
import EmailEditor from "react-email-editor";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { useEmailContext } from "../context/EmailContext";
import Button from "./ui/Button";

const EmailEditorComponent = () => {
  const emailEditorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const { emailTemplate, setEmailTemplate, setEmailHtml, isEditing, setIsEditing } =
    useEmailContext();
  const navigate = useNavigate();

  const onEditorLoad = () => {
    setIsEditorReady(true);

    if (!emailEditorRef.current) return;

    if (isEditing && emailTemplate) {
      emailEditorRef.current.editor.loadDesign(emailTemplate);
    } else {
      emailEditorRef.current.editor.loadDesign({});
    }
  };

  useEffect(() => {
    if (isEditorReady && emailEditorRef.current?.editor) {
      if (isEditing && emailTemplate) {
        emailEditorRef.current.editor.loadDesign(emailTemplate);
      } else {
        emailEditorRef.current.editor.loadDesign({});
      }
    }
  }, [isEditing, emailTemplate, isEditorReady]);

  const handleSave = async () => {
    if (!isEditorReady || !emailEditorRef.current?.editor) {
      console.error("Editor not ready");
      return;
    }
    try {
      const design = await new Promise((resolve) => {
        emailEditorRef.current.editor.saveDesign(resolve);
      });
      setEmailTemplate(design);
      alert("Template saved successfully!");
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!isEditorReady || !emailEditorRef.current?.editor) return;

    try {
      const design = await new Promise((resolve) => {
        emailEditorRef.current.editor.saveDesign(resolve);
      });
      setEmailTemplate(design);

      const data = await new Promise((resolve) => {
        emailEditorRef.current.editor.exportHtml(resolve);
      });

      const { html } = data;
      setEmailHtml(html);
      setIsEditing(false);
      navigate("/send-mails");
    } catch (error) {
      console.error("Error saving and continuing:", error);
    }
  };

  const exportHtml = () => {
    if (!emailEditorRef.current?.editor) return;

    emailEditorRef.current.editor.exportHtml((data) => {
      console.log("Exported HTML:", data.html);
    });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-white/[0.02] p-4">
        <button
          type="button"
          onClick={() => navigate("/send-mails")}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.06] cursor-pointer"
        >
          <IoIosArrowBack />
        </button>
        <Button variant="secondary" onClick={handleSave}>
          Save Template
        </Button>
        <Button variant="primary" onClick={handleSaveAndContinue}>
          Save & Continue
        </Button>
        <Button variant="secondary" onClick={exportHtml}>
          Export HTML
        </Button>
      </div>

      <EmailEditor
        ref={emailEditorRef}
        style={{ flex: 1 }}
        onLoad={onEditorLoad}
        options={{
          appearance: {
            theme: "dark",
            panels: {
              tools: {
                dock: "left",
              },
            },
          },
          customCSS: [".my-button { background-color: #8b5cf6; }"],
        }}
      />
    </div>
  );
};

export default EmailEditorComponent;
