import { createContext, useState, useContext } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const EmailsSendContext = createContext();

export function EmailsSendProvider({ children }) {
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  // Full delivery report payload: { stats, results, skippedRows, testMode }
  const [campaignData, setCampaignData] = useState(null);

  /**
   * Send a campaign (or a test email).
   *
   * Payload shape (blast):
   *   { emailTemplate, emails, accountId, testMode?, testEmail? }
   *
   * Payload shape (personalized):
   *   { emailTemplate, mode: "personalized", records, accountId, testMode?, testEmail? }
   *
   * Returns the full API response object so callers can read stats immediately.
   */
  const sendCampaign = async (payload) => {
    setLoading(true);
    setError(null);
    setCampaignData(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/send-emails`, payload);
      setCampaignData(res.data);
      return res.data;
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
    campaignData,
    setCampaignData,
    sendCampaign,
  };

  return (
    <EmailsSendContext.Provider value={value}>
      {children}
    </EmailsSendContext.Provider>
  );
}

/** Convenience hook — throws when used outside the provider. */
export function useEmailSend() {
  const ctx = useContext(EmailsSendContext);
  if (!ctx) throw new Error("useEmailSend must be used inside EmailsSendProvider");
  return ctx;
}
