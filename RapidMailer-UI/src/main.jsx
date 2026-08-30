import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleMapDataProvider } from "./context/MapDataContext.jsx";
import { WebDataProvider } from "./context/WebDataContext.jsx";
import { SidebarExpandProvider } from "./context/SidebarExpandContext.jsx";
import { EmailsVerifyProvider } from "./context/EmailsVerifyContext.jsx";
import { EmailProvider } from "./context/EmailContext.jsx";
import { UploadedListsProvider } from "./context/UploadedListsContext.jsx";
import { EmailsSendProvider } from "./context/EmailsSendContext.jsx";
import { TechDetectorProvider } from "./context/TechDetectorContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleMapDataProvider>
      <WebDataProvider>
        <SidebarExpandProvider>
          <EmailsVerifyProvider>
            <EmailsSendProvider>
              <EmailProvider>
                <UploadedListsProvider>
                  <TechDetectorProvider>
                    <App />
                  </TechDetectorProvider>
                </UploadedListsProvider>
              </EmailProvider>
            </EmailsSendProvider>
          </EmailsVerifyProvider>
        </SidebarExpandProvider>
      </WebDataProvider>
    </GoogleMapDataProvider>
  </BrowserRouter>
);
