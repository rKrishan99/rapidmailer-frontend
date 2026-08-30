import PropagateLoader from "react-spinners/PropagateLoader";

const SectionLoader = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16">
    {label && <span className="text-sm font-medium text-violet-300">{label}</span>}
    <PropagateLoader color="#a78bfa" />
  </div>
);

export default SectionLoader;
