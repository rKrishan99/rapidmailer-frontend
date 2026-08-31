import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL as API_BASE } from "../constants/api";

// Shared WhatsApp connection state, used by every WhatsApp-related tool
// (currently just the Bulk Sender) so the user connects their WhatsApp
// Business account ONCE from the sidebar, not per tool.
export const WhatsAppContext = createContext();

export function WhatsAppProvider({ children }) {
  const [status, setStatus] = useState(null); // { phoneNumberId, wabaId, accessTokenConfigured, connected, verifiedDisplayName, verifiedPhoneNumber }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [sending, setSending] = useState(false);
  const [results, setResults] = useState([]);
  const [sendError, setSendError] = useState(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await axios.get(`${API_BASE}/whatsapp/status`);
      setStatus(response.data.whatsapp);
    } catch (err) {
      setLoadError(err.response?.data?.error || err.message || "Failed to load WhatsApp status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const saveCredentials = async (draft) => {
    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE}/whatsapp/credentials`, draft);
      setStatus(response.data.whatsapp);
      return { ok: true, message: response.data.message || "Saved." };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to save credentials." };
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (draft) => {
    setTesting(true);
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/test-connection`, draft);
      await fetchStatus();
      return { ok: true, message: response.data.message };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Connection test failed." };
    } finally {
      setTesting(false);
    }
  };

  const sendBulk = async ({ recipients, message, settings }) => {
    setSending(true);
    setSendError(null);
    try {
      const response = await axios.post(`${API_BASE}/whatsapp/send-bulk`, { recipients, message, settings });
      setResults(response.data.results || []);
      return { ok: true, stats: response.data.stats };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to send WhatsApp messages.";
      setSendError(msg);
      return { ok: false, message: msg };
    } finally {
      setSending(false);
    }
  };

  const value = {
    status,
    loading,
    saving,
    testing,
    loadError,
    refreshStatus: fetchStatus,
    saveCredentials,
    testConnection,
    sending,
    results,
    setResults,
    sendError,
    sendBulk,
  };

  return <WhatsAppContext.Provider value={value}>{children}</WhatsAppContext.Provider>;
}

export function useWhatsApp() {
  return useContext(WhatsAppContext);
}
