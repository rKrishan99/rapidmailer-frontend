import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiUserAddLine,
  RiPlayFill,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
  RiShieldCheckLine,
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

export default function WhatsAppGroupJoiner() {
  const [accountId, setAccountId] = useState("");
  const [linksText, setLinksText] = useState("");
  const [minDelay, setMinDelay] = useState(15);
  const [maxDelay, setMaxDelay] = useState(40);
  const [joining, setJoining] = useState(false);
  const [joinOutcomes, setJoinOutcomes] = useState(null);
  const [error, setError] = useState(null);

  // Auto-populate links if pushed from Group Finder or Web Links Grabber
  useEffect(() => {
    const saved = localStorage.getItem("rapidmailer:auto-join-links");
    if (saved) {
      setLinksText(saved);
      localStorage.removeItem("rapidmailer:auto-join-links");
    }
  }, []);

  const handleJoin = async () => {
    const links = linksText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (links.length === 0) {
      setError("Please provide at least one WhatsApp group invite link or code.");
      return;
    }
    if (!accountId) {
      setError("Please pick a linked WhatsApp account to join groups with.");
      return;
    }

    setError(null);
    setJoining(true);
    setJoinOutcomes(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/whatsapp/group-joiner/join`, {
        accountId,
        inviteLinks: links,
        minDelay: Number(minDelay) || 15,
        maxDelay: Number(maxDelay) || 40,
      });
      setJoinOutcomes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to join groups.");
    } finally {
      setJoining(false);
    }
  };

  const results = joinOutcomes?.results || [];
  const stats = joinOutcomes?.stats || {};

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Automated Community Outreach"
        title="Auto Group Joiner"
        description="Batch join multiple targeted WhatsApp groups automatically. Built-in human delay pacing (15s–40s) prevents rate limits and account restrictions."
      />

      {/* Safety Notice */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-emerald-500/20 bg-emerald-500/[0.03]">
        <div className="flex items-start gap-3">
          <div className="grad-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <RiShieldCheckLine className="text-xl text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Anti-Ban Pacing Guard Active</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Joins groups sequentially with randomized pauses. Skips groups you already belong to and handles expired invite codes gracefully.
            </p>
          </div>
        </div>
      </Card>

      {/* Configuration Form */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">
            Group Invite Links (one per line)
          </label>
          <textarea
            rows={5}
            placeholder={"https://chat.whatsapp.com/AbCdEfGhIjKlMnOpQrStUv\nhttps://chat.whatsapp.com/ZyXwVuTsRqPoNmLkJiHgFe"}
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
            disabled={joining}
            className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-violet-500/60 focus:bg-white/[0.06] disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-end pt-2 border-t border-white/10">
          <div>
            <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Min Delay (s)"
              type="number"
              min={5}
              value={minDelay}
              onChange={(e) => setMinDelay(e.target.value)}
              disabled={joining}
            />
            <Input
              label="Max Delay (s)"
              type="number"
              min={10}
              value={maxDelay}
              onChange={(e) => setMaxDelay(e.target.value)}
              disabled={joining}
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleJoin} disabled={joining || !accountId || !linksText.trim()}>
              <RiPlayFill />
              {joining ? "Joining Groups..." : "Start Auto Joiner"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </Card>

      {/* Results View */}
      {joining ? (
        <SectionLoader label="Sequentially joining groups with randomized safety delays to prevent spam flags..." />
      ) : joinOutcomes ? (
        <div className="flex flex-col gap-6">
          {/* Summary Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="good" className="px-3 py-1.5 text-sm">
              <RiCheckLine /> {stats.joined ?? 0} Successfully Joined
            </Badge>
            <Badge tone="brand" className="px-3 py-1.5 text-sm">
              {stats.alreadyMember ?? 0} Already a Member
            </Badge>
            {stats.failed > 0 && (
              <Badge tone="bad" className="px-3 py-1.5 text-sm">
                <RiCloseLine /> {stats.failed} Revoked / Failed
              </Badge>
            )}
          </div>

          {/* Log Table */}
          <DataTable
            columns={[
              {
                id: "subject",
                label: "Group Subject",
                render: (r) => <span className="font-semibold text-slate-100">{r.subject}</span>,
              },
              {
                id: "status",
                label: "Outcome",
                render: (r) => {
                  if (r.status === "joined") return <Badge tone="good"><RiCheckLine /> Joined</Badge>;
                  if (r.status === "already_member") return <Badge tone="brand">Already Member</Badge>;
                  if (r.status === "revoked") return <Badge tone="warn"><RiAlertLine /> Revoked/Expired</Badge>;
                  return <Badge tone="bad"><RiCloseLine /> {r.status}</Badge>;
                },
              },
              {
                id: "link",
                label: "Invite Code",
                render: (r) => <span className="font-mono text-xs text-violet-300">{r.code}</span>,
              },
              {
                id: "message",
                label: "Details",
                render: (r) => <span className="text-xs text-slate-400">{r.message}</span>,
              },
            ]}
            data={results}
            emptyLabel="No results."
          />
        </div>
      ) : (
        <EmptyState
          icon={RiUserAddLine}
          title="Auto joiner is idle"
          description="Paste group invite links above, select an account, and click 'Start Auto Joiner'."
        />
      )}
    </div>
  );
}
