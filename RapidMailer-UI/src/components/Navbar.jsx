import React, { useContext } from "react";
import { images } from "../assets/assets";
import { SidebarExpandContext } from "../context/SidebarExpandContext";

const Navbar = () => {
  const { isExpand, setIsExpand } = useContext(SidebarExpandContext);

  return (
    <div className="flex items-center px-3 justify-between w-full h-[70px] bg-[#1EAE98]">
      <div className="flex gap-5">
        {isExpand ? (
          <img
            className="w-[40px] cursor-pointer"
            src={images.burgerExpandIcon}
            alt=""
            onClick={() => setIsExpand(false)}
          />
        ) : (
          <img
            className="w-[40px] cursor-pointer"
            src={images.burgerIcon}
            alt=""
            onClick={() => setIsExpand(true)}
          />
        )}

        <img className="w-[220px]" src={images.logo} alt="" />
      </div>
      <div>
        <div className="flex gap-1 text-white items-center justify-center">
          <div className="w-[1px] h-[14px] bg-white"></div>
          <span>3.2.1</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
