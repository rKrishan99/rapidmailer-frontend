// src/utils/leadCsv.js
//
// Shared CSV "lead record" plumbing used across the whole RapidMailer
// pipeline: Google Maps -> Email Finder -> Tech Detector -> Website Audit
// -> Send Emails. Every tool downstream of Google Maps reads the same CSV
// shape and only writes the columns it's responsible for, so a lead's
// name/address/phone/etc. survive the whole trip untouched.
import Papa from "papaparse";
import { saveAs } from "file-saver";

// Canonical columns the pipeline tools read/write. This isn't enforced
// anywhere (a CSV can have extra columns and they pass straight through) —
// it's just the shared vocabulary so every tool agrees on a field's name.
export const LEAD_COLUMNS = [
  "name",
  "website",
  "address",
  "phone",
  "category",
  "rating",
  "reviews",
  "email",
  "facebookUrl",
  "instagramUrl",
  "extractedEmail",
  "extractedPhone",
  "technology",
  "wordpressTheme",
  "performanceScore",
  "sslValid",
  "missingSecurityHeaders",
  "exposedFiles",
  "wordpressVersion",
  "wordpressOutdated",
  "hasSitemapXml",
  "hasRobotsTxt",
  "metaDescription",
  "outreachSummary",
  "auditError",
];

// A lead's website column can disagree in small ways between steps
// ("https://foo.com", "foo.com/", "www.foo.com") — normalize down to a
// bare-domain key so the same site still matches when merging results back.
export function normalizeWebsiteKey(url) {
  if (!url) return "";
  return url
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

// True when a lead actually has a website — false for empty/missing values
// and for the literal "No Website" the Google Maps scraper writes.
export function hasRealWebsite(website) {
  if (!website) return false;
  const v = website.toString().trim().toLowerCase();
  return v !== "" && v !== "no website" && v !== "n/a";
}

// Reads a website/url value off a row regardless of which column name the
// CSV happened to use.
export function getRowWebsite(row) {
  return row?.website || row?.url || row?.Website || row?.URL || "";
}

// Parses an uploaded CSV into an array of plain row objects (header row ->
// keys). Keeps every column the file has, not just LEAD_COLUMNS, so a tool
// never silently drops data it doesn't recognize.
export function parseLeadsCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => resolve(result.data || []),
      error: reject,
    });
  });
}

// Merges enrichment results (each carrying a website/url field) back onto
// the original full lead rows, matched by normalized website. A tool only
// needs to hand back {website/url, ...the new fields it found} — the rest of
// the row (name, phone, address, whatever came before) is preserved as-is.
// Rows with no match are returned unchanged.
export function mergeByWebsite(baseRows, updates, { baseKey = "website", updateKey = "url" } = {}) {
  const updateMap = new Map();
  (updates || []).forEach((u) => {
    const key = normalizeWebsiteKey(u[updateKey] ?? u[baseKey] ?? getRowWebsite(u));
    if (key) updateMap.set(key, u);
  });

  return (baseRows || []).map((row) => {
    const key = normalizeWebsiteKey(getRowWebsite(row));
    const update = key ? updateMap.get(key) : null;
    if (!update) return row;
    // Never let the update's key column clobber the row's own website value.
    const { [updateKey]: _ignoredUrl, ...rest } = update;
    return { ...row, ...rest };
  });
}

// Exports rows as a downloaded CSV file, using Papa.unparse so commas/quotes
// in real data (business names, addresses) are escaped properly.
export function downloadLeadsCsv(rows, filename = "leads.csv") {
  if (!rows || rows.length === 0) return;
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, filename);
}
