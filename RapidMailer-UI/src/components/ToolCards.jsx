import React from "react";
import { toolInfo } from "../assets/toolCardsInfo";
import { useNavigate } from "react-router-dom";

const ToolCards = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-6">
      {toolInfo.map((item, index) => (
        <div key={index}>
          <div
            onClick={() => navigate(item.path)}
            className="flex flex-col gap-2 justify-center items-center p-4 w-[200px] h-[200px] bg-[#f1f1f1] rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <img className="w-[80px]" src={item.icon} alt="" />
            <h1 className="text-center">{item.title}</h1>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ToolCards;
