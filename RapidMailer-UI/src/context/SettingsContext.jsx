import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL as API_BASE } from "../constants/api";

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await axios.get(`${API_BASE}/settings`);
      setSettings(response.data.settings);
    } catch (err) {
      setLoadError(err.response?.data?.error || err.message || "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (partial) => {
    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE}/settings`, partial);
      setSettings(response.data.settings);
      return { ok: true, message: response.data.message || "Settings saved" };
    } catch (err) {
      return { ok: false, message: err.response?.data?.error || err.message || "Failed to save settings." };
    } finally {
      setSaving(false);
    }
  };

  const value = {
    settings,
    loading,
    saving,
    loadError,
    refresh: fetchSettings,
    saveSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
