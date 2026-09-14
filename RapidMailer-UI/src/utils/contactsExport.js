// src/utils/contactsExport.js
//
// Client-side vCard 3.0 and Google Contacts CSV generator.
// Accepts any lead row shape — tolerant of missing fields.
// No server round-trip needed — everything runs in the browser.

import { saveAs } from "file-saver";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Sanitise a string for embedding inside a vCard line (RFC 6350 §6.7.6). */
function escapeVcard(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

/**
 * Strip a phone to E.164 digits where possible.
 * If the number already starts with + we keep it; otherwise return as-is
 * (don't guess country code since we don't have a default here).
 */
function normalisePhone(raw) {
  if (!raw) return "";
  const s = String(raw).trim();
  // Already E.164 style
  if (s.startsWith("+")) return s.replace(/[^\d+]/g, "");
  // Looks like a plain international number — prefix +
  const digitsOnly = s.replace(/\D/g, "");
  if (digitsOnly.length >= 10) return `+${digitsOnly}`;
  return s;
}

/** Pull the best "name" out of a lead row. */
function getName(row) {
  return (
    row.name ||
    row.businessName ||
    row.Name ||
    row.BusinessName ||
    ""
  ).trim();
}

/** Pull the best "phone" out of a lead row. */
function getPhone(row) {
  const candidates = [
    row.phone,
    row.Phone,
    row.phoneNumber,
    row.mobile,
    row.Mobile,
    row.tel,
    row.Tel,
    row.whatsapp,
    row.extractedPhone,
  ];
  for (const c of candidates) {
    if (c && String(c).trim()) return String(c).trim();
  }
  return "";
}

/** Pull the best "org / category" out of a lead row. */
function getOrg(row) {
  return (
    row.category ||
    row.Category ||
    row.organization ||
    row.company ||
    row.Company ||
    ""
  ).trim();
}

// ---------------------------------------------------------------------------
// vCard 3.0 builder
// ---------------------------------------------------------------------------

/**
 * Build a single vCard 3.0 entry for one lead row.
 * @param {object} row
 * @returns {string}
 */
function buildVcard(row) {
  const name = getName(row);
  const phone = normalisePhone(getPhone(row));
  const org = getOrg(row);
  const address = (row.address || row.Address || "").trim();

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${escapeVcard(name || "Unknown")}`,
  ];

  if (org) lines.push(`ORG:${escapeVcard(org)}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
  if (address) lines.push(`ADR;TYPE=WORK:;;${escapeVcard(address)};;;;`);

  // Embed extracted email if present
  const email =
    row.extractedEmail || row.email || row.Email || "";
  if (email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(email)}`);

  // Website
  const website = row.website || row.Website || row.url || "";
  if (website && website.toLowerCase() !== "no website") {
    lines.push(`URL:${escapeVcard(website)}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

/**
 * Export rows as a multi-contact vCard (.vcf) file and trigger browser download.
 * @param {object[]} rows     Lead rows
 * @param {string}  filename  Output filename (include .vcf)
 */
export function exportVcf(rows, filename = "contacts.vcf") {
  if (!rows || rows.length === 0) return;
  const vcf = rows.map(buildVcard).join("\r\n");
  const blob = new Blob([vcf], { type: "text/vcard;charset=utf-8" });
  saveAs(blob, filename);
}

// ---------------------------------------------------------------------------
// Google Contacts CSV builder
// ---------------------------------------------------------------------------
// Standard Google Contacts import CSV format.
// See: https://support.google.com/contacts/answer/1069522
//
// Required columns for a clean import:
//   Name, Phone 1 - Value, Phone 1 - Type,
//   Organization 1 - Name, Organization 1 - Title,
//   Notes
// ---------------------------------------------------------------------------

const GOOGLE_CONTACTS_HEADERS = [
  "Name",
  "Given Name",
  "Family Name",
  "Phone 1 - Value",
  "Phone 1 - Type",
  "Organization 1 - Name",
  "Organization 1 - Title",
  "E-mail 1 - Value",
  "E-mail 1 - Type",
  "Website 1 - Value",
  "Notes",
];

function csvEscape(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Export rows as a Google Contacts-compatible CSV and trigger browser download.
 * @param {object[]} rows
 * @param {string}  filename
 */
export function exportGoogleContactsCsv(rows, filename = "google_contacts.csv") {
  if (!rows || rows.length === 0) return;

  const dataRows = rows.map((row) => {
    const name = getName(row) || "Unknown";
    const phone = normalisePhone(getPhone(row));
    const org = getOrg(row);
    const email = row.extractedEmail || row.email || row.Email || "";
    const website =
      row.website || row.Website || row.url || "";
    const notes = (row.address || row.Address || "").trim();

    return [
      name,       // Name
      name,       // Given Name (full name again — Google splits if it can)
      "",         // Family Name
      phone,      // Phone 1 - Value
      "Mobile",   // Phone 1 - Type
      org,        // Organization 1 - Name
      org ? "Business" : "", // Organization 1 - Title
      email,      // E-mail 1 - Value
      email ? "Work" : "",   // E-mail 1 - Type
      website && website.toLowerCase() !== "no website" ? website : "",
      notes,      // Notes
    ].map(csvEscape);
  });

  const csvLines = [
    GOOGLE_CONTACTS_HEADERS.join(","),
    ...dataRows.map((r) => r.join(",")),
  ];
  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  saveAs(blob, filename);
}
