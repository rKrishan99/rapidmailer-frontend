import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import Dashboard from "./Dashboard";
import Tools from "./Tools";
import GoogleMapData from "./GoogleMapData";
import GoogleMapGrid from "./GoogleMapGrid";
import WebData from "./WebData";
import EmailFinder from "./EmailFinder";
import SocialEnricher from "./SocialEnricher";
import VerifyEmails from "./VerifyEmails";
import SendEmails from "./SendEmails";
import ValidationResult from "./ValidationResult";
import CreateEmail from "./CreateEmail";
import SentResult from "./SentResult";
import TechDetector from "./TechDetector";
import WebsiteAudit from "./WebsiteAudit";
import WhatsAppConnect from "./WhatsAppConnect";
import WhatsAppSender from "./WhatsAppSender";
import WhatsAppNumberFilter from "./WhatsAppNumberFilter";
import WhatsAppGroupGrabber from "./WhatsAppGroupGrabber";
import WhatsAppPollAnalytics from "./WhatsAppPollAnalytics";
import WhatsAppAutoResponder from "./WhatsAppAutoResponder";
import WhatsAppChatBackup from "./WhatsAppChatBackup";
import WhatsAppWarmer from "./WhatsAppWarmer";
import WhatsAppActiveMembers from "./WhatsAppActiveMembers";
import WhatsAppWebLinks from "./WhatsAppWebLinks";
import WhatsAppGroupFinder from "./WhatsAppGroupFinder";
import WhatsAppGroupJoiner from "./WhatsAppGroupJoiner";
import WhatsAppGroupAdder from "./WhatsAppGroupAdder";
import WhatsAppGroupCreator from "./WhatsAppGroupCreator";
import EmailAccounts from "./EmailAccounts";
import Settings from "./Settings";

const Home = () => {
  const location = useLocation();

  return (
    // Keyed on the route so navigating away (via the still-visible sidebar)
    // automatically recovers from an error on the previous page, instead of
    // the fallback screen persisting until a manual "Try again".
    <ErrorBoundary key={location.pathname} label="This page hit an unexpected error.">
      <Routes>
    <Route path="/" element={<Navigate to="/dashbord" replace />} />
    <Route path="/dashbord" element={<Dashboard />} />
    <Route path="/tools" element={<Tools />} />
    <Route path="/gmap-data" element={<GoogleMapData />} />
    <Route path="/gmap-grid" element={<GoogleMapGrid />} />
    <Route path="/web-data" element={<WebData />} />
    <Route path="/email-finder" element={<EmailFinder />} />
    <Route path="/social-enricher" element={<SocialEnricher />} />
    <Route path="/verify-mails" element={<VerifyEmails />} />
    <Route path="/send-mails" element={<SendEmails />} />
    <Route path="/validation-results" element={<ValidationResult />} />
    <Route path="/create-email" element={<CreateEmail />} />
    <Route path="/sent-results" element={<SentResult />} />
    <Route path="/tech-detector" element={<TechDetector />} />
    <Route path="/website-audit" element={<WebsiteAudit />} />
    <Route path="/whatsapp-connect" element={<WhatsAppConnect />} />
    <Route path="/whatsapp-filter" element={<WhatsAppNumberFilter />} />
    <Route path="/whatsapp-sender" element={<WhatsAppSender />} />
    <Route path="/whatsapp-groups" element={<WhatsAppGroupGrabber />} />
    <Route path="/whatsapp-polls" element={<WhatsAppPollAnalytics />} />
    <Route path="/whatsapp-autoresponder" element={<WhatsAppAutoResponder />} />
    <Route path="/whatsapp-backup" element={<WhatsAppChatBackup />} />
    <Route path="/whatsapp-warmer" element={<WhatsAppWarmer />} />
    <Route path="/whatsapp-active-members" element={<WhatsAppActiveMembers />} />
    <Route path="/whatsapp-web-links" element={<WhatsAppWebLinks />} />
    <Route path="/whatsapp-group-finder" element={<WhatsAppGroupFinder />} />
    <Route path="/whatsapp-group-joiner" element={<WhatsAppGroupJoiner />} />
    <Route path="/whatsapp-group-adder" element={<WhatsAppGroupAdder />} />
    <Route path="/whatsapp-group-creator" element={<WhatsAppGroupCreator />} />
    <Route path="/email-accounts" element={<EmailAccounts />} />
    <Route path="/settings" element={<Settings />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default Home;
