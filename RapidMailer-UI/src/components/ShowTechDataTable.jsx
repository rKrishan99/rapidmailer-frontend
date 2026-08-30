import DataTable from "./ui/DataTable";

const columns = [
  { id: "url", label: "Website", minWidth: 220 },
  {
    id: "technologies",
    label: "Detected Technology",
    minWidth: 260,
    render: (row) =>
      row.error ? <span className="text-rose-400">{row.error}</span> : row.technologies || "N/A",
  },
  { id: "server", label: "Server", minWidth: 120 },
  { id: "poweredBy", label: "Powered By", minWidth: 120 },
];

export default function ShowTechDataTable({ data = [] }) {
  return <DataTable columns={columns} data={data} emptyLabel="No results yet" />;
}
