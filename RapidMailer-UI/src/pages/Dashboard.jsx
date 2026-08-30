import React from "react";
import { COLORS } from "../constants/theme";
import {
  RiMailSendLine,
  RiRocket2Line,
  RiUserSearchLine,
  RiCheckboxCircleLine,
} from "react-icons/ri";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";
import { images } from "../assets/assets";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{ backgroundColor: COLORS.secondary }}
      className="flex flex-col gap-10 h-full p-8"
    >
      <TypeAnimation
        sequence={[
          "RapidMailer", // First text
          1000, // Wait 1s
          "RapidMailer - Lead Generation", // Second text
          1000,
          "RapidMailer - Email Marketing",
          1000,
          "RapidMailer - Your All-in-One Solution",
          1000,
          "RapidMailer - Your All-in-One Lead Generation & Email Marketing Solution", // Final text
          3000, // Stay on final text longer
          () => {
            console.log("Animation completed");
          },
        ]}
        wrapper="h1"
        cursor={true}
        repeat={Infinity}
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          display: "inline-block",
          color: "#ffffff",
        }}
      />
      <p className="text-gray-300 text-lg">
        Powerful tools to find leads, verify emails, and launch successful
        campaigns
      </p>
      <div className="flex gap-6 md:flex-row flex-col-reverse">
        <div className="flex-1 ">
          <div className="flex flex-col-reverse md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-white text-2xl font-bold">
                Transform Your Outreach
              </h2>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-3">
                  <RiUserSearchLine className="text-blue-400 text-xl mt-1" />
                  <span>
                    Extract targeted leads from Google Maps and websites
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <RiCheckboxCircleLine className="text-green-400 text-xl mt-1" />
                  <span>Verify email deliverability before sending</span>
                </li>
                <li className="flex items-start gap-3">
                  <RiRocket2Line className="text-purple-400 text-xl mt-1" />
                  <span>Launch high-performance email campaigns</span>
                </li>
              </ul>
            </div>
          </div>
          <div
            onClick={() => navigate("/send-mails")}
            style={{
              backgroundColor: COLORS.primary,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              transform: "translateZ(0)",
              ":hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 10px 20px -5px ${COLORS.primary}80`,
                filter: "brightness(110%)",
              },
            }}
            className="flex items-center justify-center gap-4 w-60 py-3 px-4 mt-32 rounded-lg cursor-pointer"
          >
            <RiMailSendLine className="text-white text-xl" />
            <span className="text-white text-xl">Start Campaign</span>
          </div>
        </div>
        <div className="flex-1 items-center justify-center">
          <img className="w-[450px]" src={images.bannerImg} alt="" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

