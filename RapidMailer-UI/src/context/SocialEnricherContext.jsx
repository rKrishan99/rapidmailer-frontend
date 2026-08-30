import { createContext, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

export const SocialEnricherContext = createContext();

export function SocialEnricherProvider({ children }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Takes a leads CSV — typically the "No Website" export from the Google
  // Maps tool — and finds each business's Facebook/Instagram page via a
  // free search (no API key), plus a best-effort public email/phone off the
  // Facebook page. Every other column on the lead passes straight through.
  const enrichSocial = async (inputLeads) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/enrich/social-bulk`, {
        leads: inputLeads,
      });
      setLeads(response.data.results || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to enrich social profiles.");
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
    enrichSocial,
  };

  return <SocialEnricherContext.Provider value={value}>{children}</SocialEnricherContext.Provider>;
}
