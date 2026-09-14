import { useState } from "react";
import axios from "axios";
import {
  RiAddCircleLine,
  RiDownloadLine,
  RiExternalLinkLine,
  RiFileCopyLine,
  RiCheckLine,
  RiShieldCheckLine,
  RiGroupLine,
} from "react-icons/ri";
import { API_BASE_URL } from "../constants/api";
import WhatsAppAccountSelect from "../components/WhatsAppAccountSelect";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import { downloadLeadsCsv } from "../utils/leadCsv";

export default function WhatsAppGroupCreator() {
  const [accountId, setAccountId] = useState("");
  const [titleTemplate, setTitleTemplate] = useState("VIP Community #{{n}}");
  const [count, setCount] = useState(3);
  const [delaySeconds, setDelaySeconds] = useState(5);

  const [creating, setCreating] = useState(false);
  const [creationResult, setCreationResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState("");
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!accountId) {
      setError("Please select a connected WhatsApp account to create groups.");
      return;
    }
    if (!titleTemplate.trim()) {
      setError("Please provide a group title pattern.");
      return;
    }

    setError(null);
    setCreating(true);
    setCreationResult(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/whatsapp/group-creator/create`, {
        accountId,
        titleTemplate: titleTemplate.trim(),
        count: Number(count) || 3,
        delaySeconds: Number(delaySeconds) || 5,
      });
      setCreationResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to create groups.");
    } finally {
      setCreating(false);
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(""), 2000);
  };

  const groups = creationResult?.groups || [];
  const stats = creationResult?.stats || {};

  const handleExportCsv = () => {
    if (!groups.length) return;
    const rows = groups.map((g) => ({
      title: g.title,
      inviteLink: g.inviteLink,
      groupJid: g.id,
      status: g.creationStatus,
      createdAt: g.createdAt,
    }));
    downloadLeadsCsv(rows, `created_groups_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Community Infrastructure"
        title="Bulk Group Generator"
        description="Batch generate multiple WhatsApp groups programmatically with custom naming patterns (e.g. 'Deals #{{n}}') and automatically retrieve shareable public invite links for immediate distribution."
      />

      {/* Info card */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-emerald-500/20 bg-emerald-500/[0.03]">
        <div className="flex items-start gap-3">
          <div className="grad-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <RiShieldCheckLine className="text-xl text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Automated Group Provisioning &amp; Link Extraction</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Creates each group cleanly under your linked account and immediately queries WhatsApp for the permanent public invite link so you can distribute them to your audience.
            </p>
          </div>
        </div>
      </Card>

      {/* Configuration Form */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
          </div>

          <div>
            <Input
              label="Group Title Template (use {{n}} for numbers)"
              placeholder="e.g. VIP Club #{{n}}"
              value={titleTemplate}
              onChange={(e) => setTitleTemplate(e.target.value)}
              disabled={creating}
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Max 25 characters per WhatsApp title specification.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md pt-2 border-t border-white/10">
          <Input
            label="Groups to Create"
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            disabled={creating}
          />
          <Input
            label="Pause Delay (seconds)"
            type="number"
            min={3}
            max={30}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(e.target.value)}
            disabled={creating}
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end pt-2 border-t border-white/10">
          <Button onClick={handleCreate} disabled={creating || !accountId}>
            <RiAddCircleLine />
            {creating ? "Generating Groups..." : `Create ${count} WhatsApp Groups`}
          </Button>
        </div>
      </Card>

      {/* Results View */}
      {creating ? (
        <SectionLoader label="Creating groups and requesting shareable invite codes from WhatsApp..." />
      ) : creationResult ? (
        <div className="flex flex-col gap-5">
          {/* Action Toolbar */}
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-2">
              <Badge tone="good">{stats.created ?? 0} Groups Created</Badge>
              {stats.failed > 0 && <Badge tone="bad">{stats.failed} Failed</Badge>}
            </div>

            <Button onClick={handleExportCsv} variant="secondary">
              <RiDownloadLine />
              Export Group Links CSV ({groups.length})
            </Button>
          </Card>

          {/* Table */}
          <DataTable
            columns={[
              {
                id: "title",
                label: "Group Title",
                render: (r) => (
                  <span className="font-semibold text-slate-100 flex items-center gap-2">
                    <RiGroupLine className="text-violet-400" />
                    {r.title}
                  </span>
                ),
              },
              {
                id: "link",
                label: "Shareable Invite Link",
                render: (r) =>
                  r.inviteLink ? (
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
                        onClick={() => copyLink(r.inviteLink)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10"
                        title="Copy invite link"
                      >
                        {copiedLink === r.inviteLink ? <RiCheckLine className="text-emerald-400" /> : <RiFileCopyLine />}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">No link generated</span>
                  ),
              },
              {
                id: "jid",
                label: "Group ID",
                render: (r) => <span className="font-mono text-xs text-slate-500">{r.id || "—"}</span>,
              },
              {
                id: "status",
                label: "Status",
                render: (r) => (
                  <Badge tone={r.creationStatus === "created" ? "good" : "bad"}>
                    {r.creationStatus === "created" ? "Created" : "Failed"}
                  </Badge>
                ),
              },
            ]}
            data={groups}
            emptyLabel="No groups created."
          />
        </div>
      ) : (
        <EmptyState
          icon={RiAddCircleLine}
          title="Ready to generate groups"
          description="Enter a title template, select count, and click 'Create WhatsApp Groups'."
        />
      )}
    </div>
  );
}
