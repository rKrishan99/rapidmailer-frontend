import {
  RiMapPin2Line,
  RiGlobalLine,
  RiMailCheckLine,
  RiSendPlaneLine,
  RiCodeSSlashLine,
  RiShieldCheckLine,
} from "react-icons/ri";

export const toolInfo = [
  {
    icon: RiMapPin2Line,
    title: "Extract Leads from Google Maps",
    description: "Pull business name, address, phone and website by keyword + location.",
    path: "/gmap-data",
  },
  {
    icon: RiGlobalLine,
    title: "Extract Emails from Google Search",
    description: "Crawl search results to surface contact emails for a keyword.",
    path: "/web-data",
  },
  {
    icon: RiMailCheckLine,
    title: "Email Validation",
    description: "Upload a CSV and split it into valid and invalid addresses.",
    path: "/verify-mails",
  },
  {
    icon: RiSendPlaneLine,
    title: "Bulk Email Sending",
    description: "Design a campaign and send it to your uploaded list.",
    path: "/send-mails",
  },
  {
    icon: RiCodeSSlashLine,
    title: "Website Tech Stack Detector",
    description: "Detect the CMS, framework and server behind any site.",
    path: "/tech-detector",
  },
  {
    icon: RiShieldCheckLine,
    title: "Bulk Website Audit",
    description: "Check performance, security and SEO basics at a glance.",
    path: "/website-audit",
  },
];
