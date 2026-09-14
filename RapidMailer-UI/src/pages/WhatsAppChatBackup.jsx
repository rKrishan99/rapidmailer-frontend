import { useState } from "react";
import axios from "axios";
import {
  RiArchiveLine,
  RiDownloadLine,
  RiRefreshLine,
  RiContactsBook2Line,
  RiChat3Line,
  RiGroupLine,
  RiUserLine,
  RiSmartphoneLine,
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
import { exportVcf, exportGoogleContactsCsv } from "../utils/contactsExport";
import { downloadLeadsCsv } from "../utils/leadCsv";

export default function WhatsAppChatBackup() {
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(false);
  const [backupData, setBackupData] = useState(null);
  const [activeTab, setActiveTab] = useState("contacts"); // "contacts" | "chats"
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  const fetchBackup = async () => {
    if (!accountId) {
      setError("Please select a linked WhatsApp account.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/backup/chats-contacts`, {
        params: { accountId },
      });
      setBackupData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load backup data.");
    } finally {
      setLoading(false);
    }
  };

  const contacts = backupData?.contacts || [];
  const chats = backupData?.chats || [];
  const stats = backupData?.stats || {};

  const filteredContacts = contacts.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (c.phone || "").includes(search)
  );

  const filteredChats = chats.filter((ch) =>
    (ch.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleExportContactsCsv = () => {
    if (!contacts.length) return;
    const rows = contacts.map((c) => ({
      name: c.name,
      phone: c.phone,
      whatsappJid: c.id,
      verifiedName: c.verifiedName,
      lastSynced: c.updatedAt,
    }));
    downloadLeadsCsv(rows, `whatsapp_contacts_backup_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportChatsCsv = () => {
    if (!chats.length) return;
    const rows = chats.map((ch) => ({
      chatName: ch.name,
      type: ch.isGroup ? "Group" : "Direct",
      unreadMessages: ch.unreadCount,
      lastActivity: ch.timestamp,
      whatsappJid: ch.id,
    }));
    downloadLeadsCsv(rows, `whatsapp_chats_backup_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="WhatsApp Tools"
        title="Active Chats & Contacts Backup"
        description="Extract and export all active conversations and cached address book contacts from your linked WhatsApp account directly into CSV and vCard (.vcf) formats."
      />

      {/* Account Selector Card */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-end">
          <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
          <div>
            <Button onClick={fetchBackup} disabled={loading || !accountId}>
              <RiRefreshLine className={loading ? "animate-spin" : ""} />
              {loading ? "Reading WhatsApp Cache..." : "Extract Chats & Contacts"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </Card>

      {/* Results View */}
      {loading ? (
        <SectionLoader label="Extracting cached conversation history and address book..." />
      ) : backupData ? (
        <div className="flex flex-col gap-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="flex flex-col gap-1 p-4">
              <span className="text-xs text-slate-500">Cached Contacts</span>
              <span className="text-2xl font-bold text-violet-300">{stats.totalContacts ?? 0}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-4">
              <span className="text-xs text-slate-500">Active Conversations</span>
              <span className="text-2xl font-bold text-white">{stats.totalChats ?? 0}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-4">
              <span className="text-xs text-slate-500">Direct (1-on-1)</span>
              <span className="text-2xl font-bold text-emerald-400">{stats.directChats ?? 0}</span>
            </Card>
            <Card className="flex flex-col gap-1 p-4">
              <span className="text-xs text-slate-500">Group Chats</span>
              <span className="text-2xl font-bold text-sky-400">{stats.groupChats ?? 0}</span>
            </Card>
          </div>

          {/* Tab & Filter Controls */}
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("contacts")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === "contacts"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-900/30"
                      : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <RiContactsBook2Line />
                  Contacts ({contacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chats")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                    activeTab === "chats"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-900/30"
                      : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <RiChat3Line />
                  Active Chats ({chats.length})
                </button>
              </div>

              {/* Export Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                {activeTab === "contacts" ? (
                  <>
                    <Button onClick={handleExportContactsCsv} disabled={contacts.length === 0} variant="secondary">
                      <RiDownloadLine />
                      Export Contacts CSV
                    </Button>
                    <ExportContactsMenu rows={contacts} filenamePrefix="wa_contacts_backup" disabled={contacts.length === 0} />
                  </>
                ) : (
                  <Button onClick={handleExportChatsCsv} disabled={chats.length === 0} variant="secondary">
                    <RiDownloadLine />
                    Export Chats CSV
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-2">
              <Input
                placeholder={activeTab === "contacts" ? "Search contacts by name or phone..." : "Search chats..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </Card>

          {/* Tab Content */}
          {activeTab === "contacts" ? (
            <DataTable
              columns={[
                {
                  id: "phone",
                  label: "Phone Number",
                  render: (r) => <span className="font-mono font-medium text-slate-100">+{r.phone}</span>,
                },
                {
                  id: "name",
                  label: "Contact Name",
                  render: (r) => r.name || "—",
                },
                {
                  id: "notify",
                  label: "WhatsApp Push Name",
                  render: (r) => r.notify || "—",
                },
                {
                  id: "jid",
                  label: "JID",
                  render: (r) => <span className="font-mono text-xs text-slate-500">{r.id}</span>,
                },
              ]}
              data={filteredContacts}
              emptyLabel="No contacts cached for this account."
            />
          ) : (
            <DataTable
              columns={[
                {
                  id: "name",
                  label: "Chat Name",
                  render: (r) => (
                    <span className="font-medium text-slate-100 flex items-center gap-2">
                      {r.isGroup ? <RiGroupLine className="text-sky-400" /> : <RiUserLine className="text-emerald-400" />}
                      {r.name}
                    </span>
                  ),
                },
                {
                  id: "type",
                  label: "Type",
                  render: (r) => (
                    <Badge tone={r.isGroup ? "neutral" : "good"}>
                      {r.isGroup ? "Group Chat" : "Direct 1-on-1"}
                    </Badge>
                  ),
                },
                {
                  id: "unread",
                  label: "Unread Messages",
                  render: (r) =>
                    r.unreadCount > 0 ? (
                      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-violet-300">
                        {r.unreadCount} unread
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">0</span>
                    ),
                },
                {
                  id: "time",
                  label: "Last Activity",
                  render: (r) => (
                    <span className="text-xs text-slate-400">
                      {r.timestamp ? new Date(r.timestamp).toLocaleString() : "—"}
                    </span>
                  ),
                },
              ]}
              data={filteredChats}
              emptyLabel="No active chats recorded for this account."
            />
          )}
        </div>
      ) : (
        <EmptyState
          icon={RiArchiveLine}
          title="No backup loaded"
          description="Select a connected WhatsApp account above and click 'Extract Chats & Contacts'."
        />
      )}
    </div>
  );
}
