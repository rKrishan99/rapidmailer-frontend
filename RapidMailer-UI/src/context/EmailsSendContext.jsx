import { createContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const EmailsSendContext = createContext();

export function EmailsSendProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  // Takes the full request body ({emailTemplate, emails} for a blast, or
  // {emailTemplate, mode: "personalized", records} for a mail-merge send)
  // and posts it straight through to the backend.
  const SendEmails = async (payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/send-emails`, payload);
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
    response,
    SendEmails,
    setResponse,
  };

  return (
    <EmailsSendContext.Provider value={value}>
      {children}
    </EmailsSendContext.Provider>
  );
}
