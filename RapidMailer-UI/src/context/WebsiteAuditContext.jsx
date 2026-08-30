import { createContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const WebsiteAuditContext = createContext();

export function WebsiteAuditProvider({ children }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Single-URL audit
  const auditSingle = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/audit-website`, {
        params: { url },
      });
      setResults([response.data.result]);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to audit website.");
    } finally {
      setLoading(false);
    }
  };

  // Bulk audit — a pasted/uploaded list of URLs
  const auditBulk = async (urls) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/audit-website-bulk`, {
        urls,
      });
      setResults(response.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to audit websites.");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    results,
    setResults,
    loading,
    error,
    setError,
    auditSingle,
    auditBulk,
  };

  return (
    <WebsiteAuditContext.Provider value={value}>{children}</WebsiteAuditContext.Provider>
  );
}
