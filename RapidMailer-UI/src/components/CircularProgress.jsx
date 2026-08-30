import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const CircularProgress = ({ percentage = 0 }) => (
  <CircularProgressbar
    value={percentage}
    text={`${percentage}%`}
    styles={buildStyles({
      rotation: 0.25,
      strokeLinecap: "round",
      textSize: "16px",
      pathTransitionDuration: 0.6,
      pathColor: "#22d3ee",
      textColor: "#f1f5f9",
      trailColor: "rgba(255,255,255,0.08)",
    })}
  />
);

export default CircularProgress;
