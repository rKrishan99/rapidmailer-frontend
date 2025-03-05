import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleMapDataProvider } from "./context/MapDataContext.jsx";
import { WebDataProvider } from "./context/WebDataContext.jsx";
import { SidebarExpandProvider } from "./context/SidebarExpandContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GoogleMapDataProvider>
      <WebDataProvider>
        <SidebarExpandProvider>
          <App />
        </SidebarExpandProvider>
      </WebDataProvider>
    </GoogleMapDataProvider>
  </BrowserRouter>
);
