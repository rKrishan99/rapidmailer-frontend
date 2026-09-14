import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  RiLinksLine,
  RiDownloadLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiCheckLine,
  RiUserAddLine,
  RiSearchLine,
} from "react-icons/ri";
import { API_BASE_URL } from "../constants/api";
import WhatsAppAccountSelect from "../components/WhatsAppAccountSelect";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import { downloadLeadsCsv } from "../utils/leadCsv";

export default function WhatsAppWebLinks() {
  const navigate = useNavigate();
  const [urlsText, setUrlsText] = useState("");
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [extractedLinks, setExtractedLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [error, setError] = useState(null);

  const handleExtract = async () => {
    const urls = urlsText
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://"));

    if (urls.length === 0) {
      setError("Please enter at least one valid webpage URL starting with http:// or https://");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/whatsapp/web-links/extract`, {
        urls,
        accountId: accountId || undefined,
      });
      setExtractedLinks(res.data.links || []);
      setStats(res.data.stats || null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to extract links.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (link, code) => {
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const handlePushToJoiner = () => {
    if (!extractedLinks.length) return;
    const linksOnly = extractedLinks.map((l) => l.inviteLink).join("\n");
    localStorage.setItem("rapidmailer:auto-join-links", linksOnly);
    navigate("/whatsapp-group-joiner");
  };

  const handleExportCsv = () => {
    if (!extractedLinks.length) return;
    const rows = extractedLinks.map((l) => ({
      inviteLink: l.inviteLink,
      groupTitle: l.subject,
      memberCount: l.size || "",
      status: l.status,
      sourceUrl: (l.sourceUrls || []).join("; "),
    }));
    downloadLeadsCsv(rows, `extracted_whatsapp_groups.csv`);
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Lead Scraping"
        title="Grab Group Links from Web Pages"
        description="Scrape and extract raw WhatsApp group invite links (chat.whatsapp.com/...) from any web page or online directory. Push extracted links directly to the Auto Group Joiner with 1 click."
      />

      {/* Input Card */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Target Web Page URLs (one per line)
          </label>
          <textarea
            rows={4}
            placeholder={"https://example.com/whatsapp-communities\nhttps://directory.com/groups"}
            value={urlsText}
            onChange={(e) => setUrlsText(e.target.value)}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-violet-500/60 focus:bg-white/[0.06]"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-end pt-2 border-t border-white/10">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              Optional Account (to verify group titles &amp; member counts):
            </span>
            <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExtract} disabled={loading}>
              <RiSearchLine />
              {loading ? "Crawling Web Pages..." : "Extract Group Links"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </Card>

      {/* Results View */}
      {loading ? (
        <SectionLoader label="Crawling target URLs and parsing HTML DOM for WhatsApp invite links..." />
      ) : extractedLinks.length > 0 ? (
        <div className="flex flex-col gap-5">
          {/* Action Toolbar */}
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-2">
              <Badge tone="good">{extractedLinks.length} Group Links Found</Badge>
              <span className="text-xs text-slate-400">across {stats?.urlsScanned} webpage(s)</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleExportCsv} variant="secondary">
                <RiDownloadLine />
                Export CSV ({extractedLinks.length})
              </Button>
              <Button onClick={handlePushToJoiner}>
                <RiUserAddLine />
                Push to Auto Group Joiner
              </Button>
            </div>
          </Card>

          {/* Links Table */}
          <DataTable
            columns={[
              {
                id: "link",
                label: "WhatsApp Invite Link",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <a
                      href={r.inviteLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-violet-300 hover:text-violet-200 hover:underline flex items-center gap-1"
                    >
                      {r.inviteLink}
                      <RiExternalLinkLine className="text-slate-500" />
                    </a>
                    <button
                      type="button"
                      onClick={() => copyLink(r.inviteLink, r.code)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
                      title="Copy link"
                    >
                      {copiedCode === r.code ? <RiCheckLine className="text-emerald-400" /> : <RiFileCopyLine />}
                    </button>
                  </div>
                ),
              },
              {
                id: "title",
                label: "Group Title",
                render: (r) => r.subject || "WhatsApp Group",
              },
              {
                id: "size",
                label: "Members",
                render: (r) => (r.size ? `${r.size} members` : "—"),
              },
              {
                id: "source",
                label: "Source Page",
                render: (r) => (
                  <span className="text-xs text-slate-400 truncate max-w-xs block" title={(r.sourceUrls || []).join(", ")}>
                    {(r.sourceUrls || [])[0] || "—"}
                  </span>
                ),
              },
              {
                id: "status",
                label: "Status",
                render: (r) => (
                  <Badge tone={r.status === "verified" ? "good" : "neutral"}>
                    {r.status || "Extracted"}
                  </Badge>
                ),
              },
            ]}
            data={extractedLinks}
            emptyLabel="No links found."
          />
        </div>
      ) : (
        <EmptyState
          icon={RiLinksLine}
          title="No links extracted yet"
          description="Enter one or more web page URLs above and click 'Extract Group Links'."
        />
      )}
    </div>
  );
}
