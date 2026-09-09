import { createContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const EmailFinderContext = createContext();

export function EmailFinderProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Takes an EXISTING list of leads (e.g. a Google Maps export) and fills in
  // an `email` column for each one, reusing the same website-scraping logic
  // as the Google Search email extractor — but without running a fresh
  // search first.
  const findEmails = async (inputLeads) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/enrich-emails-bulk`, {
        leads: inputLeads,
      });
      setLeads(response.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to find emails.");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    leads,
    setLeads,
    loading,
    error,
    setError,
    findEmails,
  };

  return <EmailFinderContext.Provider value={value}>{children}</EmailFinderContext.Provider>;
}
