// src/context/MapGridContext.jsx
//
// Manages state for the Maps Grid Scraper page.
// Uses fetch() + ReadableStream to consume the SSE endpoint —
// EventSource only supports GET, so we manually read the POST response stream.

import { createContext, useContext, useState, useRef, useCallback } from "react";
import { API_BASE_URL } from "../constants/api";

export const MapGridContext = createContext(null);

export function MapGridProvider({ children }) {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);   // latest GridProgress event
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  /**
   * Start a grid scrape run.
   * @param {string}   query
   * @param {string[]} subLocations
   * @param {number}   maxPerSlot
   */
  const startGrid = useCallback(async (query, subLocations, maxPerSlot = 120) => {
    // Cancel any in-flight run
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setResults([]);
    setStats(null);
    setProgress(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/google-maps-grid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, subLocations, maxPerSlot }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${response.status}`);
      }

      // Read SSE stream line-by-line
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE lines are separated by double newline
        const parts = buffer.split(/\n\n/);
        buffer = parts.pop() ?? ""; // keep incomplete chunk

        for (const part of parts) {
          const dataLine = part
            .split("\n")
            .find((l) => l.startsWith("data: "));
          if (!dataLine) continue;
          const json = dataLine.slice(6).trim();
          if (!json) continue;
          try {
            const event = JSON.parse(json);
            handleEvent(event);
          } catch (_) {
            // malformed — skip
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return; // cancelled by user
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setRunning(false);
    }
  }, []);

  function handleEvent(event) {
    switch (event.event) {
      case "slot_start":
      case "slot_done":
      case "complete":
        setProgress(event);
        break;
      case "error":
        // Non-fatal slot error — update progress but keep going
        setProgress(event);
        break;
      case "results":
        setResults(event.results || []);
        setStats(event.stats || null);
        break;
      case "fatal":
        setError(event.message || "Fatal scraping error.");
        break;
      default:
        break;
    }
  }

  const cancelGrid = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  const value = {
    running,
    results,
    stats,
    progress,
    error,
    startGrid,
    cancelGrid,
  };

  return (
    <MapGridContext.Provider value={value}>
      {children}
    </MapGridContext.Provider>
  );
}

export function useMapGrid() {
  const ctx = useContext(MapGridContext);
  if (!ctx) throw new Error("useMapGrid must be used within MapGridProvider");
  return ctx;
}
