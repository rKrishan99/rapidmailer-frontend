import React from "react";
import EmailEditorComponent from "../components/EmailEditor";
import { COLORS } from "../constants/theme";

const CreateEmail = () => {
  return (
    <div
      style={{ backgroundColor: COLORS.background }}
      className="flex flex-col lg:flex-row p-6 h-full"
    >
      <EmailEditorComponent/>
    </div>
  );
};

export default CreateEmail;
