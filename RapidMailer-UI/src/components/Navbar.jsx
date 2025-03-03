import React from "react";
import { images } from "../assets/assets";

const Navbar = () => {
  return (
    <div className="flex items-center px-5 justify-between w-full h-[70px] bg-[#1EAE98]">
      <div className="flex gap-5">
        <img
          className="w-[40px] cursor-pointer"
          src={images.burgerIcon}
          alt=""
        />
        <img className="w-[220px]" src={images.logo} alt="" />
      </div>
      <div>
        <div className="flex gap-1 text-gray-300 items-center justify-center">
          <div className="w-[1px] h-[14px] bg-gray-300"></div>
          <span>3.2.1</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
