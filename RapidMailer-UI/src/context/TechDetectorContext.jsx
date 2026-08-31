import { createContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const TechDetectorContext = createContext();

export function TechDetectorProvider({ children }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Single-URL check
  const detectSingle = async (url) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/detect-tech`, { url });
      setResults([response.data.result]);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to detect website technology.");
    } finally {
      setLoading(false);
    }
  };

  // Bulk check — a pasted/uploaded list of URLs
  const detectBulk = async (urls) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/detect-tech-bulk`, {
        urls,
      });
      setResults(response.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to detect website technologies.");
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
    detectSingle,
    detectBulk,
  };

  return (
    <TechDetectorContext.Provider value={value}>{children}</TechDetectorContext.Provider>
  );
}
