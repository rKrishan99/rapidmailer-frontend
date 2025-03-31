import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

const CircularProgress = ({ percentage }) => {
  console.log(percentage);

  percentage = 66;


  return (
    <div>
      <CircularProgressbar
        value={percentage}
        text={`${percentage}%`}
        styles={buildStyles({
          rotation: 0.25,
          strokeLinecap: "butt",
          textSize: "12px",
          pathTransitionDuration: 0.5,
          pathColor: `rgba(62, 152, 199, ${percentage / 100})`,
          textColor: "rgb(250 250 250)",
          trailColor: "#d6d6d6",
          backgroundColor: "#3EC795"
    
        })}
      />
    </div>
  );
};

export default CircularProgress;
