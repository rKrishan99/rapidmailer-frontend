import {
  RiMessengerLine,
  RiFacebookBoxLine,
  RiInstagramLine,
  RiLinkedinBoxLine,
  RiTwitterXLine,
  RiYoutubeLine,
  RiMapPinLine,
  RiWhatsappLine,
} from "react-icons/ri";
import { SiTiktok } from "react-icons/si";
import DataTable from "./ui/DataTable";
import Button from "./ui/Button";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * A vanity Facebook Page URL (facebook.com/<slug>) usually has Messenger
 * at m.me/<slug> — a much more direct "start chatting" link.
 * Falls back to the page URL for non-slug paths.
 */
function getMessengerLink(facebookUrl) {
  if (!facebookUrl) return null;
  try {
    const url = new URL(facebookUrl);
    const slug = url.pathname.replace(/^\/+|\/+$/g, "");
    if (slug && !slug.includes("/")) return `https://m.me/${slug}`;
  } catch {
    // fall through
  }
  return facebookUrl;
}

/** Render a social profile link cell with an icon. */
function SocialLink({ url, icon: Icon, color }) {
  if (!url) return <span className="text-slate-600">—</span>;
  const display = url.replace(/^https?:\/\/(www\.)?/, "");
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 hover:underline truncate max-w-[200px] ${color}`}
      title={url}
    >
      <Icon className="shrink-0 text-base" />
      <span className="truncate">{display}</span>
    </a>
  );
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const columns = [
  { id: "name", label: "Name", minWidth: 180 },
  { id: "address", label: "Address", minWidth: 200 },

  // ── Facebook ──────────────────────────────────────────────────────────────
  {
    id: "facebookUrl",
    label: "Facebook",
    minWidth: 180,
    render: (row) => (
      <SocialLink
        url={row.facebookUrl}
        icon={RiFacebookBoxLine}
        color="text-blue-400 hover:text-blue-300"
      />
    ),
  },
  // ── Instagram ─────────────────────────────────────────────────────────────
  {
    id: "instagramUrl",
    label: "Instagram",
    minWidth: 180,
    render: (row) => (
      <SocialLink
        url={row.instagramUrl}
        icon={RiInstagramLine}
        color="text-pink-400 hover:text-pink-300"
      />
    ),
  },
  // ── LinkedIn ──────────────────────────────────────────────────────────────
  {
    id: "linkedinUrl",
    label: "LinkedIn",
    minWidth: 180,
    render: (row) => (
      <SocialLink
        url={row.linkedinUrl}
        icon={RiLinkedinBoxLine}
        color="text-sky-400 hover:text-sky-300"
      />
    ),
  },
  // ── Twitter / X ───────────────────────────────────────────────────────────
  {
    id: "twitterUrl",
    label: "Twitter / X",
    minWidth: 160,
    render: (row) => (
      <SocialLink
        url={row.twitterUrl}
        icon={RiTwitterXLine}
        color="text-slate-300 hover:text-white"
      />
    ),
  },
  // ── YouTube ───────────────────────────────────────────────────────────────
  {
    id: "youtubeUrl",
    label: "YouTube",
    minWidth: 180,
    render: (row) => (
      <SocialLink
        url={row.youtubeUrl}
        icon={RiYoutubeLine}
        color="text-red-400 hover:text-red-300"
      />
    ),
  },
  // ── TikTok ────────────────────────────────────────────────────────────────
  {
    id: "tiktokUrl",
    label: "TikTok",
    minWidth: 160,
    render: (row) => (
      <SocialLink
        url={row.tiktokUrl}
        icon={SiTiktok}
        color="text-teal-400 hover:text-teal-300"
      />
    ),
  },
  // ── Google Business ───────────────────────────────────────────────────────
  {
    id: "googleBusinessUrl",
    label: "Google Business",
    minWidth: 180,
    render: (row) => (
      <SocialLink
        url={row.googleBusinessUrl}
        icon={RiMapPinLine}
        color="text-emerald-400 hover:text-emerald-300"
      />
    ),
  },
  // ── Action buttons ────────────────────────────────────────────────────────
  {
    id: "messengerAction",
    label: "Messenger",
    minWidth: 130,
    render: (row) => {
      const link = getMessengerLink(row.facebookUrl);
      if (!link) return <span className="text-slate-600">—</span>;
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
    id: "whatsappAction",
    label: "WhatsApp Biz",
    minWidth: 130,
    render: (row) => {
      if (!row.whatsappBusinessUrl)
        return <span className="text-slate-600">—</span>;
      return (
        <Button
          as="a"
          href={row.whatsappBusinessUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          className="!px-3 !py-1.5 text-xs !border-emerald-800 !text-emerald-400 hover:!bg-emerald-900/30"
        >
          <RiWhatsappLine />
          Chat
        </Button>
      );
    },
  },
  // ── Extracted contact ─────────────────────────────────────────────────────
  {
    id: "enrichedContact",
    label: "Extracted Email / Phone",
    minWidth: 220,
    render: (row) => {
      if (!row.extractedEmail && !row.extractedPhone)
        return <span className="text-slate-600">—</span>;
      return (
        <div className="flex flex-col gap-0.5">
          {row.extractedEmail && (
            <span className="text-slate-200 text-sm">{row.extractedEmail}</span>
          )}
          {row.extractedPhone && (
            <span className="text-slate-400 text-xs">{row.extractedPhone}</span>
          )}
        </div>
      );
    },
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShowSocialEnricherTable({ data = [] }) {
  return <DataTable columns={columns} data={data} emptyLabel="No leads yet" />;
}
