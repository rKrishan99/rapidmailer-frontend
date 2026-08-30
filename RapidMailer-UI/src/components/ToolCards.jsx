import { useNavigate } from "react-router-dom";
import { toolInfo } from "../assets/toolCardsInfo";
import Card from "./ui/Card";

const ToolCards = () => {
  const navigate = useNavigate();

  return (
    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {toolInfo.map((item) => (
        <Card
          key={item.path}
          onClick={() => navigate(item.path)}
          className="group flex cursor-pointer flex-col gap-4 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20"
        >
          <div className="grad-ring flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105">
            <item.icon className="text-2xl text-white" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-white">{item.title}</h3>
            <p className="text-sm text-slate-400">{item.description}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ToolCards;
