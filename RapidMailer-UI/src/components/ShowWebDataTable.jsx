import DataTable from "./ui/DataTable";

const columns = [
  { id: "name", label: "Name", minWidth: 200 },
  { id: "address", label: "Address", minWidth: 220 },
  { id: "email", label: "Email", minWidth: 220 },
];

export default function StickyHeadTable({ data = [] }) {
  return <DataTable columns={columns} data={data} emptyLabel="No results yet" />;
}
