import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiUserVoiceLine,
  RiGroupLine,
  RiDownloadLine,
  RiTimeLine,
  RiShieldUserLine,
  RiUserLine,
  RiRefreshLine,
} from "react-icons/ri";
import { API_BASE_URL } from "../constants/api";
import WhatsAppAccountSelect from "../components/WhatsAppAccountSelect";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";
import ExportContactsMenu from "../components/ui/ExportContactsMenu";
import { downloadLeadsCsv } from "../utils/leadCsv";

const TIMEFRAMES = [
  { value: "1", label: "Active in Last 24 Hours" },
  { value: "7", label: "Active in Last 7 Days (Recommended)" },
  { value: "30", label: "Active in Last 30 Days" },
];

export default function WhatsAppActiveMembers() {
  const [accountId, setAccountId] = useState("");
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [timeframeDays, setTimeframeDays] = useState("7");
  const [activeData, setActiveData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    if (!accountId) return;
    setLoadingGroups(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/groups`, {
        params: { accountId },
      });
      const list = res.data.groups || [];
      setGroups(list);
      if (list.length > 0 && !selectedGroupId) {
        setSelectedGroupId(list[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load groups.");
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [accountId]);

  const handleScan = async () => {
    if (!accountId || !selectedGroupId) {
      setError("Please select a linked WhatsApp account and a target group.");
      return;
    }

    setScanning(true);
    setError(null);

    try {
      const res = await axios.get(
        `${API_BASE_URL}/whatsapp/groups/${selectedGroupId}/active-members`,
        {
          params: { accountId, days: timeframeDays },
        }
      );
      setActiveData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to scan active members.");
    } finally {
      setScanning(false);
    }
  };

  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: `${g.subject} (${g.size} members)`,
  }));

  const activeMembers = activeData?.activeMembers || [];
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handleExportCsv = () => {
    if (!activeMembers.length) return;
    const rows = activeMembers.map((m) => ({
      phone: m.phone,
      name: m.isAdmin ? `${m.phone} (Admin)` : m.phone,
      groupSubject: activeData.subject,
      role: m.admin || "member",
      lastActive: m.lastSeen || "Active",
      messageCount: m.messageCount,
    }));
    downloadLeadsCsv(rows, `active_members_${activeData.subject.slice(0, 15)}.csv`);
  };

  const contactRows = activeMembers.map((m) => ({
    phone: m.phone,
    name: m.isAdmin ? `${activeData?.subject || "Group"} Admin` : `${activeData?.subject || "Group"} Active`,
    organization: activeData?.subject || "Active WhatsApp Member",
    notes: `Active in ${activeData?.subject || "group"}. Last active: ${m.lastSeen || "Recently"}`,
  }));

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="WhatsApp Filtering"
        title="Grab Active Group Members Only"
        description="Filter out ghost accounts and inactive participants by scanning recent group conversation history. Export only leads who actively participated within your chosen timeframe."
      />

      {/* Configuration Card */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-end">
          <div>
            <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Select Group
            </label>
            <Select
              value={selectedGroupId}
              onChange={setSelectedGroupId}
              options={groupOptions}
              disabled={loadingGroups || groups.length === 0}
              placeholder={loadingGroups ? "Loading groups..." : "Choose group"}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Activity Timeframe
            </label>
            <Select
              value={timeframeDays}
              onChange={setTimeframeDays}
              options={TIMEFRAMES}
            />
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end pt-2 border-t border-white/10">
          <Button onClick={handleScan} disabled={scanning || !selectedGroupId || !accountId}>
            <RiRefreshLine className={scanning ? "animate-spin" : ""} />
            {scanning ? "Scanning Activity History..." : "Scan Active Members"}
          </Button>
        </div>
      </Card>

      {/* Results View */}
      {scanning ? (
        <SectionLoader label="Analyzing group message logs to isolate active participants..." />
      ) : activeData ? (
        <div className="flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Card className="flex flex-col gap-1 p-4">
              <span className="text-xs text-slate-500">Active Participants</span>
              <span className="text-2xl font-bold text-emerald-400">{activeData.activeCount}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-4">
              <span className="text-xs text-slate-500">Inactive / Ghost Accounts</span>
              <span className="text-2xl font-bold text-slate-400">{activeData.inactiveCount}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-4 col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500">Total Group Size</span>
              <span className="text-2xl font-bold text-white">{activeData.totalMembers}</span>
            </Card>
          </div>

          {/* Action Toolbar */}
          <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-2">
              <Badge tone="good">
                {activeData.activeCount} active in last {activeData.timeframeDays} day{activeData.timeframeDays !== 1 ? "s" : ""}
              </Badge>
              <span className="text-xs text-slate-400">in "{activeData.subject}"</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleExportCsv} disabled={activeMembers.length === 0} variant="secondary">
                <RiDownloadLine />
                Export Active CSV ({activeMembers.length})
              </Button>
              <ExportContactsMenu
                rows={contactRows}
                filenamePrefix="active_members"
                disabled={activeMembers.length === 0}
              />
            </div>
          </Card>

          {/* Active Members Table */}
          <DataTable
            columns={[
              {
                id: "phone",
                label: "Participant Phone",
                render: (r) => (
                  <span className="font-mono font-medium text-slate-100">+{r.phone}</span>
                ),
              },
              {
                id: "role",
                label: "Role",
                render: (r) =>
                  r.isAdmin ? (
                    <Badge tone="brand" className="inline-flex items-center gap-1">
                      <RiShieldUserLine className="text-xs" />
                      {r.admin === "superadmin" ? "Creator" : "Admin"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400 inline-flex items-center gap-1">
                      <RiUserLine /> Member
                    </span>
                  ),
              },
              {
                id: "lastSeen",
                label: "Last Seen Active",
                render: (r) => (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RiTimeLine className="text-slate-500" />
                    {r.lastSeen ? new Date(r.lastSeen).toLocaleString() : "Recently active"}
                  </span>
                ),
              },
              {
                id: "count",
                label: "Messages Recorded",
                render: (r) => (
                  <span className="font-mono text-xs text-violet-300 font-semibold">
                    {r.messageCount} msg{r.messageCount !== 1 ? "s" : ""}
                  </span>
                ),
              },
            ]}
            data={activeMembers}
            emptyLabel={`No members sent messages within the last ${activeData.timeframeDays} days.`}
          />
        </div>
      ) : (
        <EmptyState
          icon={RiUserVoiceLine}
          title="No active members scanned yet"
          description="Select a connected account and target group above, then click 'Scan Active Members'."
        />
      )}
    </div>
  );
}
