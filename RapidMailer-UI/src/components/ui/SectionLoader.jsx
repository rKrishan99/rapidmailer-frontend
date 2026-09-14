import PropagateLoader from "react-spinners/PropagateLoader";

const SectionLoader = ({ label }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16">
    {label && (
      <span className="text-sm font-medium" style={{ color: "var(--accent-primary)" }}>
        {label}
      </span>
    )}
    <PropagateLoader color="var(--accent-primary)" />
  </div>
);

export default SectionLoader;
