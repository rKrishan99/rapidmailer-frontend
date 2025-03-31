import React from "react";
import { toolInfo } from "../assets/toolCardsInfo";
import { useNavigate } from "react-router-dom";
import { COLORS } from "../constants/theme";

const ToolCards = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap justify-start gap-4 w-full px-4">
      {toolInfo.map((item, index) => (
        <div key={index}>
          <div
            onClick={() => navigate(item.path)}
            style={{ backgroundColor: COLORS.white }}
            className="flex flex-col lg:gap-4 md:gap-10 items-center lg:p-6 md:p-4 p-2 w-[200px] h-[200px] rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <div className="md:h-[40px] lg:h-[60px] h-[90px] ">
              <img className="w-[70px]" src={item.icon} alt="" />
            </div>

            <h1 className="text-center font-semibold">{item.title}</h1>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToolCards;
