import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL as API_BASE } from "../constants/api";

// Shared WhatsApp connection state, used by every WhatsApp-related tool
// (Bulk Sender, Number Filter). RapidMailer supports MULTIPLE connected
// WhatsApp Business accounts at once — e.g. one per client project — so
// this holds the whole list; each tool run picks one account by id rather
// than there being a single global "the" connection.
export const WhatsAppContext = createContext();

export function WhatsAppProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
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

  const addAccount = async (draft) => {
    setSaving(true);
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/accounts`, draft);
      await fetchAccounts();
      return { ok: true, message: response.data.message || "Account added.", account: response.data.account };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to add account." };
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

  // draft: either { accessToken, phoneNumberId, apiVersion } for a not-yet-
  // saved account, or { accountId } (optionally with overrides) to re-test
  // a saved one.
  const testConnection = async (draft) => {
    setTesting(true);
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/test-connection`, draft);
      if (draft.accountId) await fetchAccounts();
      return { ok: true, message: response.data.message };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Connection test failed." };
    } finally {
      setTesting(false);
    }
  };

  // The actual API call, with no side effect on this context's shared
  // sending/results/sendError state — used by tools (like the Number
  // Filter) that want to manage their own local loading/results state so
  // they don't clobber the Bulk Sender's, and vice versa.
  const sendBulkRaw = async ({ recipients, message, settings }) => {
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/send-bulk`, { recipients, message, settings });
      return { ok: true, results: response.data.results || [], stats: response.data.stats };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to send WhatsApp messages." };
    }
  };

  // settings must include { accountId, batchSize, delayMs, defaultCountryCode }
  const sendBulk = async ({ recipients, message, settings }) => {
    setSending(true);
    setSendError(null);
    const res = await sendBulkRaw({ recipients, message, settings });
    if (res.ok) {
      setResults(res.results);
    } else {
      setSendError(res.message);
    }
    setSending(false);
    return res;
  };

  const value = {
    accounts,
    loading,
    saving,
    testing,
    loadError,
    refreshAccounts: fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    testConnection,
    sending,
    results,
    setResults,
    sendError,
    sendBulk,
    sendBulkRaw,
  };

  return <WhatsAppContext.Provider value={value}>{children}</WhatsAppContext.Provider>;
}

export function useWhatsApp() {
  return useContext(WhatsAppContext);
}
