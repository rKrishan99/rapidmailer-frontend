import DataTable from "./ui/DataTable";

const columns = [{ id: "email", label: "Email", minWidth: 240 }];

export default function StickyHeadTable({ data = [] }) {
  return <DataTable columns={columns} data={data} emptyLabel="No emails loaded yet" />;
}
