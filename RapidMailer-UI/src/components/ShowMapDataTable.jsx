import DataTable from "./ui/DataTable";

const columns = [
  { id: "name", label: "Name", minWidth: 200 },
  { id: "address", label: "Address", minWidth: 220 },
  { id: "phone", label: "Phone", minWidth: 140 },
  { id: "category", label: "Category", minWidth: 150 },
  { id: "rating", label: "Rating", minWidth: 90 },
  { id: "reviews", label: "Reviews", minWidth: 100 },
  { id: "website", label: "Website", minWidth: 200 },
];

export default function StickyHeadTable({ data = [] }) {
  return <DataTable columns={columns} data={data} emptyLabel="No results yet" />;
}
