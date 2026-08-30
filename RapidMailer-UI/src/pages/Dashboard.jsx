import {
  RiMailSendLine,
  RiRocket2Line,
  RiUserSearchLine,
  RiCheckboxCircleLine,
  RiArrowRightLine,
} from "react-icons/ri";
import { TypeAnimation } from "react-type-animation";
import { useNavigate } from "react-router-dom";
import { images } from "../assets/assets";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const FEATURES = [
  {
    icon: RiUserSearchLine,
    title: "Find leads",
    description: "Extract targeted leads from Google Maps and web search.",
  },
  {
    icon: RiCheckboxCircleLine,
    title: "Verify emails",
    description: "Confirm deliverability before you send a single message.",
  },
  {
    icon: RiRocket2Line,
    title: "Launch campaigns",
    description: "Design and send bulk email campaigns that land in the inbox.",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-10 p-6 md:p-10">
      <Card className="relative overflow-hidden p-8 md:p-12">
        <div className="grad-bg absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-30 blur-3xl" />
        <div className="relative flex flex-col-reverse items-center gap-10 lg:flex-row">
          <div className="flex flex-1 flex-col gap-6">
            <TypeAnimation
              sequence={[
                "RapidMailer",
                1000,
                "RapidMailer — Lead Generation",
                1000,
                "RapidMailer — Email Marketing",
                1000,
                "RapidMailer — Your All-in-One Solution",
                1000,
                "RapidMailer — Your All-in-One Lead Generation & Email Marketing Solution",
                3000,
              ]}
              wrapper="h1"
              cursor
              repeat={Infinity}
              className="grad-text text-3xl font-bold md:text-4xl"
            />
            <p className="max-w-xl text-lg text-slate-400">
              Powerful tools to find leads, verify emails, and launch successful campaigns —
              without leaving one dashboard.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate("/send-mails")}>
                <RiMailSendLine className="text-lg" />
                Start Campaign
              </Button>
              <Button variant="secondary" onClick={() => navigate("/tools")}>
                Browse Tools
                <RiArrowRightLine />
              </Button>
            </div>
          </div>
          <img className="w-full max-w-[380px] flex-1" src={images.bannerImg} alt="" />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="flex flex-col gap-4 p-6">
            <div className="grad-ring flex h-11 w-11 items-center justify-center rounded-xl">
              <Icon className="text-xl text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400">{description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
