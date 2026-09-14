import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiUserSharedLine,
  RiUpload2Line,
  RiGroupLine,
  RiCheckLine,
  RiCloseLine,
  RiShieldCheckLine,
  RiAlertLine,
} from "react-icons/ri";
import { API_BASE_URL } from "../constants/api";
import { parseLeadsCsv } from "../utils/leadCsv";
import WhatsAppAccountSelect from "../components/WhatsAppAccountSelect";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import Select from "../components/ui/Select";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import DataTable from "../components/ui/DataTable";

export default function WhatsAppGroupAdder() {
  const [accountId, setAccountId] = useState("");
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Contacts
  const [rawRows, setRawRows] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [phoneColumn, setPhoneColumn] = useState("");
  const [fileName, setFileName] = useState("");
  const [batchSize, setBatchSize] = useState(5);
  const [delaySeconds, setDelaySeconds] = useState(8);

  const [adding, setAdding] = useState(false);
  const [addOutcomes, setAddOutcomes] = useState(null);
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const parsed = await parseLeadsCsv(file);
    if (parsed.length === 0) {
      setError("The uploaded CSV contains no data rows.");
      return;
    }

    setRawRows(parsed);
    const cols = Object.keys(parsed[0] || {});
    setCsvColumns(cols);

    // Auto-detect phone column
    const detected = cols.find((c) =>
      ["phone", "mobile", "tel", "whatsapp", "contact"].some((k) =>
        c.toLowerCase().includes(k)
      )
    );
    setPhoneColumn(detected || cols[0] || "");
  };

  const handleAdd = async () => {
    if (!accountId || !selectedGroupId) {
      setError("Please select a connected WhatsApp account and an administered target group.");
      return;
    }
    if (!rawRows.length || !phoneColumn) {
      setError("Please upload a CSV and pick a phone number column.");
      return;
    }

    const recipients = rawRows.map((r) => ({
      ...r,
      phone: String(r[phoneColumn] || "").trim(),
    })).filter((r) => r.phone);

    if (recipients.length === 0) {
      setError("No valid phone numbers found in the selected column.");
      return;
    }

    setError(null);
    setAdding(true);
    setAddOutcomes(null);

    try {
      const res = await axios.post(`${API_BASE_URL}/whatsapp/group-adder/add`, {
        accountId,
        groupId: selectedGroupId,
        recipients,
        batchSize: Number(batchSize) || 5,
        delaySeconds: Number(delaySeconds) || 8,
      });
      setAddOutcomes(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to add members.");
    } finally {
      setAdding(false);
    }
  };

  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: `${g.subject} (${g.size} members)`,
  }));

  const results = addOutcomes?.results || [];
  const stats = addOutcomes?.stats || {};

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Community Growth"
        title="Bulk Add Group Members"
        description="Add contacts from a CSV directly into your administered WhatsApp groups. Features safety rate limiting (batches of 5–10) and handles privacy restriction checks automatically."
      />

      {/* Safety info */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-emerald-500/20 bg-emerald-500/[0.03]">
        <div className="flex items-start gap-3">
          <div className="grad-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <RiShieldCheckLine className="text-xl text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Admin Privileges &amp; Privacy Protection</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Requires Admin status in the destination group. If a contact's privacy settings require an invite link instead of direct add, the engine flags it without failing your batch.
            </p>
          </div>
        </div>
      </Card>

      {/* Configuration Card */}
      <Card className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Destination Group (You Must Be Admin)
            </label>
            <Select
              value={selectedGroupId}
              onChange={setSelectedGroupId}
              options={groupOptions}
              disabled={loadingGroups || groups.length === 0}
              placeholder={loadingGroups ? "Loading groups..." : "Choose target group"}
            />
          </div>
        </div>

        {/* CSV Upload */}
        <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-200">
              {fileName ? `Uploaded: ${fileName} (${rawRows.length} rows)` : "Upload Contact CSV"}
            </span>
            <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors">
              <RiUpload2Line />
              Choose File
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {csvColumns.length > 0 && (
            <div className="w-full sm:w-72 mt-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Phone Number Column
              </label>
              <Select
                value={phoneColumn}
                onChange={setPhoneColumn}
                options={csvColumns}
                placeholder="Select phone column"
              />
            </div>
          )}
        </div>

        {/* Safety Pacing */}
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <Input
            label="Batch Size (contacts per step)"
            type="number"
            min={1}
            max={10}
            value={batchSize}
            onChange={(e) => setBatchSize(e.target.value)}
            disabled={adding}
          />
          <Input
            label="Pause Delay (seconds)"
            type="number"
            min={3}
            max={30}
            value={delaySeconds}
            onChange={(e) => setDelaySeconds(e.target.value)}
            disabled={adding}
          />
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex justify-end pt-2 border-t border-white/10">
          <Button onClick={handleAdd} disabled={adding || !selectedGroupId || !rawRows.length}>
            <RiUserSharedLine />
            {adding ? "Adding Members..." : `Add ${rawRows.length || 0} Members to Group`}
          </Button>
        </div>
      </Card>

      {/* Results View */}
      {adding ? (
        <SectionLoader label="Adding participants to group in safe paced batches..." />
      ) : addOutcomes ? (
        <div className="flex flex-col gap-6">
          {/* Summary Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="good" className="px-3 py-1.5 text-sm">
              <RiCheckLine /> {stats.added ?? 0} Successfully Added
            </Badge>
            {stats.privacyRestricted > 0 && (
              <Badge tone="warn" className="px-3 py-1.5 text-sm">
                <RiAlertLine /> {stats.privacyRestricted} Blocked by Privacy (Invite Needed)
              </Badge>
            )}
            {stats.alreadyMember > 0 && (
              <Badge tone="brand" className="px-3 py-1.5 text-sm">
                {stats.alreadyMember} Already Members
              </Badge>
            )}
            {stats.failed > 0 && (
              <Badge tone="bad" className="px-3 py-1.5 text-sm">
                <RiCloseLine /> {stats.failed} Failed
              </Badge>
            )}
          </div>

          {/* Results Table */}
          <DataTable
            columns={[
              {
                id: "phone",
                label: "Phone Number",
                render: (r) => <span className="font-mono font-medium text-slate-100">+{r.phone}</span>,
              },
              {
                id: "status",
                label: "Outcome",
                render: (r) => {
                  if (r.status === "added") return <Badge tone="good"><RiCheckLine /> Added</Badge>;
                  if (r.status === "privacy_restricted") return <Badge tone="warn">Privacy Restricted</Badge>;
                  if (r.status === "already_member") return <Badge tone="brand">Already in Group</Badge>;
                  return <Badge tone="bad">{r.status}</Badge>;
                },
              },
              {
                id: "msg",
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
          icon={RiUserSharedLine}
          title="Ready to add members"
          description="Select an administered group, upload a contacts CSV, and click 'Add Members'."
        />
      )}
    </div>
  );
}
