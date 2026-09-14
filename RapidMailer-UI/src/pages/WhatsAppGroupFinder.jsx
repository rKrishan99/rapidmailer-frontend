import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  RiCompass3Line,
  RiSearchLine,
  RiDownloadLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiCheckLine,
  RiUserAddLine,
  RiSparklingLine,
} from "react-icons/ri";
import { API_BASE_URL } from "../constants/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import { downloadLeadsCsv } from "../utils/leadCsv";

export default function WhatsAppGroupFinder() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState([]);
  const [copiedCode, setCopiedCode] = useState("");
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) {
      setError("Please enter a niche keyword (e.g. 'Real Estate', 'Crypto', 'Jobs').");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/group-finder/search`, {
        params: {
          keyword: keyword.trim(),
          country: country.trim() || undefined,
        },
      });
      setGroups(res.data.groups || []);
      if ((res.data.groups || []).length === 0) {
        setError("No public groups found for this query. Try broader keywords.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to search groups.");
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
    if (!groups.length) return;
    const linksOnly = groups.map((g) => g.inviteLink).join("\n");
    localStorage.setItem("rapidmailer:auto-join-links", linksOnly);
    navigate("/whatsapp-group-joiner");
  };

  const handleExportCsv = () => {
    if (!groups.length) return;
    const rows = groups.map((g) => ({
      title: g.title,
      inviteLink: g.inviteLink,
      keyword: g.keyword,
      snippet: g.snippet,
    }));
    downloadLeadsCsv(rows, `discovered_groups_${keyword.replace(/[^a-z0-9]/gi, "_")}.csv`);
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Target Audience Discovery"
        title="WhatsApp Group Finder"
        description="Automatically discover niche-specific public WhatsApp groups across search engine dorks without third-party API keys. Find targeted communities for any industry or geographic region."
      />

      {/* Search Input Card */}
      <Card className="flex flex-col gap-4 p-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
          <div>
            <Input
              label="Niche Keyword / Topic"
              placeholder="e.g. Real Estate, Crypto, Dropshipping"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <Input
              label="Country / Region (Optional)"
              placeholder="e.g. United Kingdom, Dubai, USA"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          <div>
            <Button type="submit" disabled={loading} className="w-full justify-center">
              <RiSearchLine />
              {loading ? "Searching Dorks..." : "Find Groups"}
            </Button>
          </div>
        </form>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </Card>

      {/* Results View */}
      {loading ? (
        <SectionLoader label="Querying search dorks for public WhatsApp communities and invite links..." />
      ) : groups.length > 0 ? (
        <div className="flex flex-col gap-5">
          {/* Action Toolbar */}
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-2">
              <Badge tone="good">{groups.length} Public Groups Discovered</Badge>
              <span className="text-xs text-slate-400">for "{keyword}"</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleExportCsv} variant="secondary">
                <RiDownloadLine />
                Export CSV ({groups.length})
              </Button>
              <Button onClick={handlePushToJoiner}>
                <RiUserAddLine />
                Push to Auto Group Joiner
              </Button>
            </div>
          </Card>

          {/* Table */}
          <DataTable
            columns={[
              {
                id: "title",
                label: "Discovered Group Title",
                render: (r) => <span className="font-semibold text-slate-100">{r.title}</span>,
              },
              {
                id: "link",
                label: "Invite Link",
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
                id: "snippet",
                label: "Context / Description",
                render: (r) => (
                  <span className="text-xs text-slate-400 line-clamp-2" title={r.snippet}>
                    {r.snippet || "—"}
                  </span>
                ),
              },
            ]}
            data={groups}
            emptyLabel="No groups match."
          />
        </div>
      ) : (
        <EmptyState
          icon={RiCompass3Line}
          title="Find targeted WhatsApp groups"
          description="Enter an industry or topic above (e.g. 'SaaS founders', 'Marketing') to discover public group invite links."
        />
      )}
    </div>
  );
}
