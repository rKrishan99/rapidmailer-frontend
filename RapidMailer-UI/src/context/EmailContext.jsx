// src/context/EmailContext.js
import { createContext, useState, useContext } from 'react';

const EmailContext = createContext();

export const EmailProvider = ({ children }) => {
  const [emailTemplate, setEmailTemplate] = useState(null);
  const [emailHtml, setEmailHtml] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const resetEmailContext = () => {
    setEmailTemplate(null);
    setEmailHtml('');
    setIsEditing(false);
  };

  return (
    <EmailContext.Provider
      value={{
        emailTemplate,
        setEmailTemplate,
        emailHtml,
        setEmailHtml,
        isEditing,
        setIsEditing,
        resetEmailContext
      }}
    >
      {children}
    </EmailContext.Provider>
  );
};

export const useEmailContext = () => useContext(EmailContext);