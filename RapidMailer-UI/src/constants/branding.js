// src/constants/branding.js

/**
 * Global Application Branding Configuration
 *
 * Change the application name, tagline, or company name here in ONE place
 * to reflect across the entire user interface, documents, headers, and dashboard.
 *
 * Can also be overridden at build or runtime using VITE_APP_NAME in .env
 */
export const APP_NAME = import.meta.env.VITE_APP_NAME || "Omini Plus";

export const APP_CONFIG = {
  name: APP_NAME,
  shortName: APP_NAME,
  tagline: "All-in-One Lead Generation, Email & WhatsApp Automation Solution",
  description: `Powerful tools to find leads, verify emails, and launch successful outreach campaigns — without leaving one dashboard.`,
  version: "v4.0",
  defaultSenderName: APP_NAME,
};

export default APP_CONFIG;
