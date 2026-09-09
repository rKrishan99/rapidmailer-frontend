import DataTable from "./ui/DataTable";
import Badge from "./ui/Badge";

const StatusBadge = ({ status }) => {
  if (status === "sent") return <Badge tone="good">Accepted</Badge>;
  if (status === "failed") return <Badge tone="bad">Rejected</Badge>;
  return <Badge tone="neutral">{status || "—"}</Badge>;
};

const columns = [
  { id: "name", label: "Name", minWidth: 160, render: (row) => row.name || row.businessName || "N/A" },
  { id: "phone", label: "Phone", minWidth: 140, render: (row) => row.phone || "N/A" },
  { id: "status", label: "Result", minWidth: 110, render: (row) => <StatusBadge status={row.status} /> },
  {
    id: "detail",
    label: "Detail",
    minWidth: 260,
    render: (row) =>
      row.status === "sent" ? (
        <span className="text-xs text-slate-500">{row.messageId}</span>
      ) : (
        <span className="text-xs text-rose-300">{row.error || "Unknown error"}</span>
      ),
  },
];

const ShowWhatsAppResultsTable = ({ data }) => <DataTable columns={columns} data={data} emptyLabel="No sends yet" />;

export default ShowWhatsAppResultsTable;
