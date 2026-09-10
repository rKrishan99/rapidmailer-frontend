import DataTable from "./ui/DataTable";

const columns = [
  { id: "url", label: "Website URL", minWidth: 260 },
  { id: "found_emails", label: "Found Emails", minWidth: 300 },
];

/**
 * Map raw result objects ({url, emails[]}) to flat rows the DataTable
 * understands before rendering.
 */
function normaliseRows(data) {
  return data.map((row) => ({
    url: row.url || "",
    found_emails:
      row.error
        ? `⚠ ${row.error}`
        : Array.isArray(row.emails) && row.emails.length > 0
        ? row.emails.join(", ")
        : "—",
  }));
}

export default function WebDataTable({ data = [] }) {
  const rows = normaliseRows(data);
  return (
    <DataTable columns={columns} data={rows} emptyLabel="No results yet" />
  );
}
