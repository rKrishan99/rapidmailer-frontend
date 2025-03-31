import { createContext, useState } from "react";
import axios from "axios";

export const EmailsVerifyContext = createContext();

export function EmailsVerifyProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validEmails, setValidEmails] = useState([]);
  const [totalEmails, setTotalEmails] = useState(0);

  const validateEmails = async (emails) => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/verify-emails",
        { emails }
      );
      setValidEmails(response.data.validEmails);
      console.log("valid emails here: ", response.data.validEmails);

      setTotalEmails(emails.length);
    } catch (error) {
        setError(err.message);
    }
    setLoading(false);
  };

  const value = {
    loading,
    setLoading,
    error,
    setError,
    validEmails,
    validateEmails,
    totalEmails,
  };

  return (
    <EmailsVerifyContext.Provider value={value}>
      {children}
    </EmailsVerifyContext.Provider>
  );
}
