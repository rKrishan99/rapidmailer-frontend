import React from "react";
import { images } from "../assets/assets";
import { sidebarContent } from "../assets/sidebarWidgets";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {

const navigate =useNavigate();

  return (
    <div className="w-full bg-[#f1f1f1] h-screen">
      <div onClick={() => navigate("/dashbord")} className="flex w-full flex-row px-3 py-2 gap-3 items-center bg-[#A9F1DF] cursor-pointer">
        <img className="w-[40px]" src={images.dashboard} alt="" />
        <h1 className="font-bold text-lg text-[#1EAE98] ">Dashboard</h1>
      </div>
      <div className="px-2 pt-3">
        <div className="flex flex-col">
          {sidebarContent.map((item, index) => (
            <div key={index} onClick={() => navigate(item.path)} className="flex gap-2 p-2 rounded-[5px] items-center cursor-pointer hover:bg-[#A9F1DF]">
              <img className="w-[30px]" src={item.icon} />
              <span className="">{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
