import {
  RiMapPin2Line,
  RiGlobalLine,
  RiSearchLine,
  RiMailCheckLine,
  RiSendPlaneLine,
  RiCodeSSlashLine,
  RiShieldCheckLine,
  RiShareForwardLine,
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
    icon: RiSearchLine,
    title: "Email Finder (from CSV)",
    description: "Upload a leads CSV and fill in an email column from each site.",
    path: "/email-finder",
  },
  {
    icon: RiShareForwardLine,
    title: "Social Enricher (from CSV)",
    description: "Upload your \"No Website\" leads and find their Facebook/Instagram page instead.",
    path: "/social-enricher",
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
    description: "Design a campaign and send it as a blast or a personalized mail-merge.",
    path: "/send-mails",
  },
  {
    icon: RiCodeSSlashLine,
    title: "Website Tech Stack Detector",
    description: "Detect the CMS, framework and server behind any site — single or bulk CSV.",
    path: "/tech-detector",
  },
  {
    icon: RiShieldCheckLine,
    title: "Bulk Website Audit",
    description: "Check performance, security and SEO basics, then filter out dead leads.",
    path: "/website-audit",
  },
];
