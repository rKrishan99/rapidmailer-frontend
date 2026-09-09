import ToolCards from "../components/ToolCards";
import PageHeader from "../components/ui/PageHeader";

const Tools = () => (
  <div className="flex flex-col gap-8 p-6 md:p-10">
    <PageHeader
      eyebrow="Toolkit"
      title="All Tools"
      description="Everything you need to find, verify and reach leads — pick a tool to get started."
    />
    <ToolCards />
  </div>
);

export default Tools;
