import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL as API_BASE } from "../constants/api";

export const WhatsAppContext = createContext();

export function WhatsAppProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [sending, setSending] = useState(false);
  const [filtering, setFiltering] = useState(false);
  const [results, setResults] = useState([]);
  const [filterResults, setFilterResults] = useState([]);
  const [sendError, setSendError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await axios.get(`${API_BASE}/whatsapp/accounts`);
      setAccounts(response.data.accounts || []);
    } catch (err) {
      setLoadError(err.response?.data?.error || err.message || "Failed to load WhatsApp accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = async ({ label }) => {
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/accounts`, { label });
      await fetchAccounts();
      return {
        ok: true,
        message: response.data.message || "WhatsApp account created.",
        account: response.data.account,
      };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to create account." };
    } finally {
      setSaving(false);
    }
  };

  const updateAccount = async (accountId, draft) => {
    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE}/whatsapp/accounts/${accountId}`, draft);
      await fetchAccounts();
      return { ok: true, message: response.data.message || "Account updated." };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to update account." };
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async (accountId) => {
    setSaving(true);
    try {
      const response = await axios.delete(`${API_BASE}/whatsapp/accounts/${accountId}`);
      await fetchAccounts();
      return { ok: true, message: response.data.message || "Account removed." };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to remove account." };
    } finally {
      setSaving(false);
    }
  };

  const initSession = async (accountId) => {
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/session/${accountId}/init`);
      return { ok: true, data: response.data };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || err.message };
    }
  };

  const getSessionStatus = async (accountId) => {
    try {
      const response = await axios.get(`${API_BASE}/whatsapp/session/${accountId}/status`);
      return { ok: true, data: response.data };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || err.message };
    }
  };

  const logoutSession = async (accountId) => {
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/session/${accountId}/logout`);
      await fetchAccounts();
      return { ok: true, message: response.data.message };
    } catch (err) {
      return { ok: false, error: err.response?.data?.error || err.message };
    }
  };

  // Instant protocol check without sending any messages
  const filterNumbers = async ({ recipients, options }) => {
    setFiltering(true);
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/filter-numbers`, { recipients, options });
      setFilterResults(response.data.results || []);
      return {
        ok: true,
        results: response.data.results || [],
        valid: response.data.valid || [],
        invalid: response.data.invalid || [],
        stats: response.data.stats,
      };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to filter numbers." };
    } finally {
      setFiltering(false);
    }
  };

  // Bulk message sender with anti-ban safeguards
  const sendBulk = async ({ recipients, message, settings }) => {
    setSending(true);
    setSendError(null);
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/send-bulk`, { recipients, message, settings });
      setResults(response.data.results || []);
      return { ok: true, results: response.data.results || [], stats: response.data.stats };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to send WhatsApp messages.";
      setSendError(msg);
      return { ok: false, message: msg };
    } finally {
      setSending(false);
    }
  };

  const value = {
    accounts,
    loading,
    saving,
    loadError,
    refreshAccounts: fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    initSession,
    getSessionStatus,
    logoutSession,
    sending,
    filtering,
    results,
    setResults,
    filterResults,
    setFilterResults,
    sendError,
    sendBulk,
    filterNumbers,
  };

  return <WhatsAppContext.Provider value={value}>{children}</WhatsAppContext.Provider>;
}

export function useWhatsApp() {
  const ctx = useContext(WhatsAppContext);
  if (!ctx) throw new Error("useWhatsApp must be used within a WhatsAppProvider");
  return ctx;
}
