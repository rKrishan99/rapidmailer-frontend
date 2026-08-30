import { RiMessengerLine, RiFacebookBoxLine } from "react-icons/ri";
import DataTable from "./ui/DataTable";
import Button from "./ui/Button";

// A vanity Facebook Page URL (facebook.com/<slug>) usually has Messenger
// enabled at m.me/<slug> — a much more direct "start chatting" link than
// the page itself. Falls back to the page URL when the path isn't a clean
// single-segment slug.
function getDirectMessageLink(facebookUrl) {
  if (!facebookUrl) return null;
  try {
    const url = new URL(facebookUrl);
    const slug = url.pathname.replace(/^\/+|\/+$/g, "");
    if (slug && !slug.includes("/")) {
      return `https://m.me/${slug}`;
    }
  } catch {
    // fall through to the raw page URL below
  }
  return facebookUrl;
}

const columns = [
  { id: "name", label: "Name", minWidth: 200 },
  { id: "address", label: "Address", minWidth: 220 },
  {
    id: "facebookUrl",
    label: "Facebook URL",
    minWidth: 200,
    render: (row) =>
      row.facebookUrl ? (
        <a
          href={row.facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200 hover:underline"
        >
          <RiFacebookBoxLine className="shrink-0" />
          <span className="truncate">{row.facebookUrl.replace(/^https?:\/\/(www\.)?/, "")}</span>
        </a>
      ) : (
        <span className="text-slate-500">—</span>
      ),
  },
  {
    id: "directMessage",
    label: "Direct Message",
    minWidth: 150,
    render: (row) => {
      const link = getDirectMessageLink(row.facebookUrl);
      if (!link) return <span className="text-slate-500">—</span>;
      return (
        <Button
          as="a"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          className="!px-3 !py-1.5 text-xs"
        >
          <RiMessengerLine />
          Message
        </Button>
      );
    },
  },
  {
    id: "enrichedContact",
    label: "Enriched Email/Phone",
    minWidth: 220,
    render: (row) => {
      if (!row.extractedEmail && !row.extractedPhone) return <span className="text-slate-500">—</span>;
      return (
        <div className="flex flex-col gap-0.5">
          {row.extractedEmail && <span>{row.extractedEmail}</span>}
          {row.extractedPhone && <span className="text-slate-400">{row.extractedPhone}</span>}
        </div>
      );
    },
  },
];

export default function ShowSocialEnricherTable({ data = [] }) {
  return <DataTable columns={columns} data={data} emptyLabel="No leads yet" />;
}
