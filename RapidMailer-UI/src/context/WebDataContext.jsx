import { createContext, useState, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const WebDataContext = createContext();

export function WebDataProvider({ children }) {
  const [results, setResults] = useState([]); // [{ url, emails, error? }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Send a list of URLs to the backend, scrape each for emails, and store
   * the per-URL results.
   *
   * @param {string[]} urls
   */
  const extractEmailsFromUrls = useCallback(async (urls) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/extract-emails-from-urls`,
        { urls },
        { timeout: 5 * 60 * 1000 } // up to 5 min for large lists
      );
      setResults(response.data?.results ?? []);
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        "An error occurred while extracting emails.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    results,
    setResults,
    loading,
    error,
    setError,
    extractEmailsFromUrls,
  };

  return (
    <WebDataContext.Provider value={value}>{children}</WebDataContext.Provider>
  );
}