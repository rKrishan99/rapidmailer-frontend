import React, { useContext } from "react";
import { images } from "../assets/assets";
import { sidebarContent } from "../assets/sidebarWidgets";
import { useNavigate } from "react-router-dom";
import { SidebarExpandContext } from "../context/SidebarExpandContext";
import { COLORS } from "../constants/theme";

const Sidebar = () => {

  const { isExpand, setIsExpand } = useContext(SidebarExpandContext);

  const navigate = useNavigate();

  return (
    <div style={{ backgroundColor: COLORS.primary }} className={`${isExpand ? "w-[220px]" : "w-[60px]"} overflow-hidden transition-all duration-300 h-screen`}>
      <div
        onClick={() => navigate("/dashbord")}
        style={{ backgroundColor: COLORS.lightGreeen }}
        className="flex w-full flex-row p-2 gap-3 items-center cursor-pointer"
      >
        <img className="w-[40px]" src={images.dashboard} alt="" />
        <h1 className={`${ isExpand ? "font-bold text-lg text-[#03288b]" : "hidden"}`}>Dashboard</h1>
      </div>
      <div className={`${isExpand ? "px-2 pt-3" : "flex flex-col items-center px-2 pt-3"}`}>
        <div className="flex flex-col">
          {sidebarContent.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="flex gap-2 p-2 rounded-[5px] items-center cursor-pointer hover:bg-[#A9F1DF] focus:bg-[#A9F1DF]"
            >
              <img className="w-[20px]" src={item.icon} />
              <span className={`${isExpand ? "font-semibold text-lg" : "hidden"}`}>{item.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
