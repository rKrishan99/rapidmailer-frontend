import { useContext } from "react";
import { RiCheckboxCircleLine, RiCloseCircleLine } from "react-icons/ri";
import DataTable from "../components/ui/DataTable";
import Card from "../components/ui/Card";
import CircularProgress from "../components/CircularProgress";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import { EmailsVerifyContext } from "../context/EmailsVerifyContext";

const validColumns = [{ id: "email", label: "Email", minWidth: 240 }];

const invalidColumns = [
  { id: "email", label: "Email", minWidth: 220 },
  {
    id: "reason",
    label: "Reason",
    minWidth: 160,
    render: (row) => <span className="capitalize">{row.reason}</span>,
  },
];

const ValidationResult = () => {
  const { validEmails, invalidEmails, loading, totalEmails } = useContext(EmailsVerifyContext);

  const percentage = totalEmails ? Math.round((validEmails.length / totalEmails) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader eyebrow="Email" title="Validation Results" />

      {loading ? (
        <SectionLoader label="Validating emails..." />
      ) : (
        <>
          <Card className="flex flex-col items-center gap-6 p-8 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-1 text-center sm:text-left">
              <span className="text-sm text-slate-400">Deliverability score</span>
              <span className="grad-text text-4xl font-bold">{percentage}%</span>
              <span className="text-sm text-slate-400">
                {validEmails.length} valid / {invalidEmails.length} invalid of {totalEmails} total
              </span>
            </div>
            <div className="h-32 w-32">
              <CircularProgress percentage={percentage} />
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-semibold text-emerald-300">
                <RiCheckboxCircleLine />
                Valid Emails ({validEmails.length}/{totalEmails})
              </h3>
              <DataTable columns={validColumns} data={validEmails} emptyLabel="No valid emails" />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 font-semibold text-rose-300">
                <RiCloseCircleLine />
                Invalid Emails ({invalidEmails.length}/{totalEmails})
              </h3>
              <DataTable
                columns={invalidColumns}
                data={invalidEmails}
                emptyLabel="No invalid emails"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ValidationResult;
