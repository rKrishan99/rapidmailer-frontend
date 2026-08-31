import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleMapDataProvider } from "./context/MapDataContext.jsx";
import { WebDataProvider } from "./context/WebDataContext.jsx";
import { EmailFinderProvider } from "./context/EmailFinderContext.jsx";
import { SocialEnricherProvider } from "./context/SocialEnricherContext.jsx";
import { SidebarExpandProvider } from "./context/SidebarExpandContext.jsx";
import { EmailsVerifyProvider } from "./context/EmailsVerifyContext.jsx";
import { EmailProvider } from "./context/EmailContext.jsx";
import { UploadedListsProvider } from "./context/UploadedListsContext.jsx";
import { EmailsSendProvider } from "./context/EmailsSendContext.jsx";
import { TechDetectorProvider } from "./context/TechDetectorContext.jsx";
import { WebsiteAuditProvider } from "./context/WebsiteAuditContext.jsx";
import { WhatsAppProvider } from "./context/WhatsAppContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleMapDataProvider>
      <WebDataProvider>
        <EmailFinderProvider>
          <SocialEnricherProvider>
            <SidebarExpandProvider>
              <EmailsVerifyProvider>
                <EmailsSendProvider>
                  <EmailProvider>
                    <UploadedListsProvider>
                      <TechDetectorProvider>
                        <WebsiteAuditProvider>
                          <WhatsAppProvider>
                            <SettingsProvider>
                              <App />
                            </SettingsProvider>
                          </WhatsAppProvider>
                        </WebsiteAuditProvider>
                      </TechDetectorProvider>
                    </UploadedListsProvider>
                  </EmailProvider>
                </EmailsSendProvider>
              </EmailsVerifyProvider>
            </SidebarExpandProvider>
          </SocialEnricherProvider>
        </EmailFinderProvider>
      </WebDataProvider>
    </GoogleMapDataProvider>
  </BrowserRouter>
);
