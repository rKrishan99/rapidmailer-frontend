import { createContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const EmailsSendContext = createContext();

export function EmailsSendProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);



  const SendEmails = async (emailTemplate, emails) => {
    setLoading(true);
    setError(null);

    try { 
      const response = await axios.post(
        `${API_BASE_URL}/send-emails`,
        { emailTemplate, emails }
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    setLoading,
    error,
    setError,
    SendEmails,
    setResponse,
  };

  return (
    <EmailsSendContext.Provider value={value}>
      {children}
    </EmailsSendContext.Provider>
  );
}
