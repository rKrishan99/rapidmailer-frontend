import { useContext } from "react";
import { RiSendPlaneFill } from "react-icons/ri";
import { EmailsSendContext } from "../context/EmailsSendContext";
import Card from "../components/ui/Card";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";

const SentResult = () => {
  const { loading, response } = useContext(EmailsSendContext);

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader eyebrow="Email" title="Campaign Sent" />

      {loading ? (
        <SectionLoader label="Sending your campaign..." />
      ) : (
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <div className="grad-ring flex h-14 w-14 items-center justify-center rounded-2xl">
            <RiSendPlaneFill className="text-2xl text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">Campaign sent</h2>
          <p className="max-w-md text-sm text-slate-400">{response}</p>
        </Card>
      )}
    </div>
  );
};

export default SentResult;
