import DataTable from "./ui/DataTable";

const columns = [
  { id: "name", label: "Name", minWidth: 200 },
  { id: "website", label: "Website", minWidth: 220 },
  {
    id: "email",
    label: "Email",
    minWidth: 220,
    render: (row) => row.email || "—",
  },
];

export default function ShowEmailFinderTable({ data = [] }) {
  return <DataTable columns={columns} data={data} emptyLabel="No leads yet" />;
}
