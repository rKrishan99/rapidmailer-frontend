import React from "react";
import Sidebar from "../components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import Tools from "./Tools";
import GoogleMapData from "./GoogleMapData";
import WebData from "./WebData";
import VerifyEmails from "./VerifyEmails";
import SendEmails from "./SendEmails";
import ValidationResult from "./ValidationResult";
import CreateEmail from "./CreateEmail";
import SentResult from "./SentResult";
import TechDetector from "./TechDetector";

const Home = () => {
  return (
    <div className="flex">
      <div className="">
        <Sidebar />
      </div>
      <div className="w-full overflow-hidden">
        <Routes>
          <Route path="/dashbord" element={<Dashboard />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/gmap-data" element={<GoogleMapData />} />
          <Route path="/web-data" element={<WebData />} />
          <Route path="/verify-mails" element={<VerifyEmails />} />
          <Route path="/send-mails" element={<SendEmails />} />
          <Route path="/validation-results" element={<ValidationResult />} />
          <Route path="/create-email" element={<CreateEmail />} />
          <Route path="/sent-results" element={<SentResult />} />
          <Route path="/tech-detector" element={<TechDetector />} />
        </Routes>
      </div>
    </div>
  );
};

export default Home;
