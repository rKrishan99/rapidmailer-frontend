import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL as API_BASE } from "../constants/api";

// Shared sender-account state, used by the campaign sending flow. RapidMailer
// supports MULTIPLE configured SMTP accounts at once (e.g. one per domain or
// client) — this holds the whole list; a send picks one account by id rather
// than there being a single global "the" SMTP connection.
export const EmailAccountsContext = createContext();

export function EmailAccountsProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await axios.get(`${API_BASE}/email-accounts`);
      setAccounts(response.data.accounts || []);
    } catch (err) {
      setLoadError(err.response?.data?.error || err.message || "Failed to load email accounts.");
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
      const response = await axios.post(`${API_BASE}/email-accounts`, draft);
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
      const response = await axios.put(`${API_BASE}/email-accounts/${accountId}`, draft);
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
      const response = await axios.delete(`${API_BASE}/email-accounts/${accountId}`);
      await fetchAccounts();
      return { ok: true, message: response.data.message || "Account removed." };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to remove account." };
    } finally {
      setSaving(false);
    }
  };

  // draft: either full SMTP fields for a not-yet-saved account, or
  // { accountId, to? } to send a test through a saved one.
  const testAccount = async (draft) => {
    setTesting(true);
    try {
      const response = await axios.post(`${API_BASE}/email-accounts/test`, draft);
      return { ok: true, message: response.data.message };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Test failed." };
    } finally {
      setTesting(false);
    }
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
    testAccount,
  };

  return <EmailAccountsContext.Provider value={value}>{children}</EmailAccountsContext.Provider>;
}

export function useEmailAccounts() {
  return useContext(EmailAccountsContext);
}
