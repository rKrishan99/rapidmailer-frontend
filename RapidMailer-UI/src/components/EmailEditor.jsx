import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../constants/theme";
import EmailEditor from "react-email-editor";
import { useEmailContext } from "../context/EmailContext";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const EmailEditorComponent = () => {
  const emailEditorRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false); // Add loading state
  const {
    emailTemplate,
    setEmailTemplate,
    setEmailHtml,
    isEditing,
    setIsEditing,
  } = useEmailContext();
  const navigate = useNavigate();

  // Initialize the editor when it's ready
  const onEditorLoad = () => {
    setIsEditorReady(true);

    if (!emailEditorRef.current) return; // Add null check

    if (isEditing && emailTemplate) {
      emailEditorRef.current.editor.loadDesign(emailTemplate);
    } else {
      emailEditorRef.current.editor.loadDesign({});
    }
  };

  // Load existing template if editing
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
      console.log("Template saved:", design);
      alert("Template saved successfully!"); // Add user feedback
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!isEditorReady || !emailEditorRef.current?.editor) return;

    try {
      // First save the design
      const design = await new Promise((resolve) => {
        emailEditorRef.current.editor.saveDesign(resolve);
      });
      setEmailTemplate(design);

      // Then export HTML
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
      const { html } = data;
      console.log("Exported HTML:", html);
    });
  };

  return (
    <div
      style={{ backgroundColor: COLORS.background }}
      className="h-full w-full flex flex-col"
    >
      <div onClick={() => navigate("/send-mails")} className="flex gap-4 p-4">
        <div className="bg-[#1EAE98] flex items-center justify-content-center cursor-pointer text-white px-2 py-2 rounded">
          <IoIosArrowBack />
        </div>
        <button
          onClick={handleSave}
          className="bg-[#1EAE98] text-white px-4 py-2 rounded cursor-pointer"
        >
          Save Template
        </button>
        <button
          onClick={handleSaveAndContinue}
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Save & Continue
        </button>
        <button
          onClick={exportHtml}
          className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          Export HTML
        </button>
      </div>

      <EmailEditor
        ref={emailEditorRef}
        style={{ flex: 1 }}
        onLoad={onEditorLoad} // Add this callback
        options={{
          appearance: {
            theme: "dark",
            panels: {
              tools: {
                dock: "left",
              },
            },
          },
          customCSS: [`.my-button { background-color: ${COLORS.primary}; }`],
        }}
      />
    </div>
  );
};

export default EmailEditorComponent;
