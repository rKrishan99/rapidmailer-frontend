import { useState } from "react";
import axios from "axios";
import {
  RiGroupLine,
  RiDownloadLine,
  RiSearchLine,
  RiShieldUserLine,
  RiUserLine,
  RiRefreshLine,
  RiCheckLine,
  RiInformationLine,
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
import ExportContactsMenu from "../components/ui/ExportContactsMenu";
import { downloadLeadsCsv } from "../utils/leadCsv";

export default function WhatsAppGroupGrabber() {
  const [accountId, setAccountId] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);
  const [error, setError] = useState(null);

  const [groupSearch, setGroupSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  const handleFetchGroups = async () => {
    if (!accountId) {
      setError("Please select a linked WhatsApp account.");
      return;
    }
    setError(null);
    setLoadingGroups(true);
    setSelectedGroup(null);
    setGroupDetails(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/groups`, {
        params: { accountId },
      });
      setGroups(res.data.groups || []);
      if ((res.data.groups || []).length === 0) {
        setError("No participating groups found for this WhatsApp account.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to fetch groups.");
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    setLoadingMembers(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/groups/${group.id}/participants`, {
        params: { accountId },
      });
      setGroupDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load group members.");
    } finally {
      setLoadingMembers(false);
    }
  };

  const filteredGroups = groups.filter((g) =>
    (g.subject || "").toLowerCase().includes(groupSearch.toLowerCase())
  );

  const participants = groupDetails?.participants || [];
  const filteredParticipants = participants.filter((p) =>
    (p.phone || "").includes(memberSearch) || (p.admin || "").toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleExportCsv = () => {
    if (!participants.length || !selectedGroup) return;
    const rows = participants.map((p) => ({
      phone: p.phone,
      name: p.isAdmin ? `${p.phone} (${p.admin})` : p.phone,
      groupName: selectedGroup.subject,
      groupId: selectedGroup.id,
      role: p.admin || "member",
    }));
    const safeName = (selectedGroup.subject || "group").replace(/[^a-z0-9_-]/gi, "_");
    downloadLeadsCsv(rows, `${safeName}_members.csv`);
  };

  // Prepare contact rows for ExportContactsMenu
  const contactRows = participants.map((p) => ({
    phone: p.phone,
    name: p.isAdmin ? `${selectedGroup?.subject || "Group"} Admin (${p.phone.slice(-4)})` : `${selectedGroup?.subject || "Group"} Member (${p.phone.slice(-4)})`,
    organization: selectedGroup?.subject || "WhatsApp Group",
    notes: `Group: ${selectedGroup?.subject || ""} (${selectedGroup?.id || ""}) | Role: ${p.admin || "Member"}`,
  }));

  const adminCount = participants.filter((p) => p.isAdmin).length;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="WhatsApp Automation"
        title="Group Members Grabber"
        description="Extract contact numbers and admin roles from any WhatsApp group your linked account participates in. Export to CSV or sync directly to phone contacts with 1 click."
      />

      {/* Account selection & controls */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
          <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
          <div>
            <Button onClick={handleFetchGroups} disabled={loadingGroups || !accountId}>
              <RiRefreshLine className={loadingGroups ? "animate-spin" : ""} />
              {loadingGroups ? "Scanning Groups..." : "Fetch Participating Groups"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </Card>

      {/* Groups and Members Split Layout */}
      {groups.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Groups List */}
          <Card className="flex flex-col gap-4 p-5 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Groups ({groups.length})</h3>
              <span className="text-xs text-slate-500">Pick a group</span>
            </div>

            <Input
              placeholder="Search groups..."
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
            />

            <div className="flex max-h-[500px] flex-col gap-2 overflow-y-auto pr-1">
              {filteredGroups.map((g) => {
                const isSelected = selectedGroup?.id === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => handleSelectGroup(g)}
                    className={`flex flex-col gap-1 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-violet-500/60 bg-violet-500/15 text-white shadow-lg shadow-violet-900/20"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate text-sm">{g.subject}</span>
                      <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                        {g.size}
                      </span>
                    </div>
                    {g.creation && (
                      <span className="text-[11px] text-slate-500">
                        Created {new Date(g.creation).toLocaleDateString()}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Column: Selected Group Details & Members */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {loadingMembers ? (
              <SectionLoader label="Extracting group participants and verifying admin status..." />
            ) : selectedGroup && groupDetails ? (
              <div className="flex flex-col gap-5">
                <Card className="flex flex-col gap-4 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="grad-ring flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                        <RiGroupLine className="text-2xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{selectedGroup.subject}</h3>
                        <p className="text-xs text-slate-400">
                          {participants.length} Total Members · {adminCount} Admin{adminCount !== 1 ? "s" : ""}
                        </p>
                        {selectedGroup.desc && (
                          <p className="mt-2 text-xs text-slate-500 italic max-h-16 overflow-y-auto">
                            "{selectedGroup.desc}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button onClick={handleExportCsv} variant="secondary">
                        <RiDownloadLine />
                        Export Members CSV ({participants.length})
                      </Button>
                      <ExportContactsMenu
                        rows={contactRows}
                        filenamePrefix={`group_${selectedGroup.subject.slice(0, 15)}`}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <Input
                      placeholder="Search participants by phone or role..."
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                    />
                  </div>
                </Card>

                {/* Table of Members */}
                <DataTable
                  columns={[
                    {
                      id: "phone",
                      label: "Phone Number",
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
                            {r.admin === "superadmin" ? "Creator / Superadmin" : "Group Admin"}
                          </Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <RiUserLine className="text-xs" /> Member
                          </span>
                        ),
                    },
                    {
                      id: "jid",
                      label: "WhatsApp JID",
                      render: (r) => <span className="font-mono text-xs text-slate-500">{r.id}</span>,
                    },
                  ]}
                  data={filteredParticipants}
                  emptyLabel="No participants match your search."
                />
              </div>
            ) : (
              <EmptyState
                icon={RiGroupLine}
                title="Select a Group"
                description="Click any group in the left list to inspect and grab its members."
              />
            )}
          </div>
        </div>
      )}

      {groups.length === 0 && !loadingGroups && (
        <EmptyState
          icon={RiGroupLine}
          title="No groups loaded"
          description="Select a connected WhatsApp account above and click 'Fetch Participating Groups'."
        />
      )}
    </div>
  );
}
