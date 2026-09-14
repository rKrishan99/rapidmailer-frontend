import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiRobot2Line,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiCheckLine,
  RiCloseLine,
  RiChatSmile2Line,
} from "react-icons/ri";
import { API_BASE_URL } from "../constants/api";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { Input } from "../components/ui/Field";
import Select from "../components/ui/Select";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Toggle from "../components/ui/Toggle";

const MATCH_TYPES = [
  { value: "contains", label: "Contains Keyword (Recommended)" },
  { value: "exact", label: "Exact Match Only" },
  { value: "regex", label: "Regular Expression (Regex)" },
];

export default function WhatsAppAutoResponder() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [formKeyword, setFormKeyword] = useState("");
  const [formMatchType, setFormMatchType] = useState("contains");
  const [formReplyText, setFormReplyText] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/auto-responder/rules`);
      setRules(res.data.rules || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load rules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openAddModal = () => {
    setEditingRuleId(null);
    setFormKeyword("");
    setFormMatchType("contains");
    setFormReplyText("");
    setFormEnabled(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setEditingRuleId(rule.id);
    setFormKeyword(rule.keyword);
    setFormMatchType(rule.matchType || "contains");
    setFormReplyText(rule.replyText);
    setFormEnabled(rule.enabled);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    if (!formKeyword.trim()) {
      setFormError("Please enter a keyword or trigger phrase.");
      return;
    }
    if (!formReplyText.trim()) {
      setFormError("Please enter the response message to send.");
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editingRuleId) {
        await axios.put(`${API_BASE_URL}/whatsapp/auto-responder/rules/${editingRuleId}`, {
          keyword: formKeyword.trim(),
          matchType: formMatchType,
          replyText: formReplyText.trim(),
          enabled: formEnabled,
        });
      } else {
        await axios.post(`${API_BASE_URL}/whatsapp/auto-responder/rules`, {
          keyword: formKeyword.trim(),
          matchType: formMatchType,
          replyText: formReplyText.trim(),
          enabled: formEnabled,
        });
      }
      setIsModalOpen(false);
      fetchRules();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || "Failed to save rule.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!confirm("Are you sure you want to delete this auto-responder rule?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/whatsapp/auto-responder/rules/${id}`);
      fetchRules();
    } catch (err) {
      alert("Failed to delete rule: " + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleRule = async (id, currentStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/whatsapp/auto-responder/rules/${id}/toggle`, {
        enabled: !currentStatus,
      });
      fetchRules();
    } catch (err) {
      alert("Failed to toggle rule: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="WhatsApp Automation"
        title="Rule-Based Auto-Responder Bot"
        description="Set up automatic keyword-triggered replies for incoming customer messages. Includes built-in 24-hour anti-loop throttling and natural typing simulation to protect your account."
      />

      {/* Safety & Anti-loop notice banner */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-emerald-500/20 bg-emerald-500/[0.03]">
        <div className="flex items-start gap-3">
          <div className="grad-ring flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <RiShieldCheckLine className="text-xl text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Anti-Loop &amp; Anti-Ban Safeguards Active</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulates 2–4s typing presence before answering. Never auto-replies to the same contact more than once in 24 hours to prevent bot conversation loops.
            </p>
          </div>
        </div>

        <Button onClick={openAddModal}>
          <RiAddLine />
          Add Auto-Reply Rule
        </Button>
      </Card>

      {/* Rule List */}
      {loading ? (
        <SectionLoader label="Loading auto-responder rules..." />
      ) : rules.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Rules ({rules.filter((r) => r.enabled).length} of {rules.length} enabled)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rules.map((rule) => (
              <Card key={rule.id} className="flex flex-col gap-4 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-white rounded-lg bg-violet-500/15 border border-violet-500/30 px-3 py-1">
                      {rule.keyword}
                    </span>
                    <Badge tone={rule.matchType === "exact" ? "neutral" : "brand"}>
                      {rule.matchType === "exact"
                        ? "Exact Match"
                        : rule.matchType === "regex"
                        ? "Regex Pattern"
                        : "Contains"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <Toggle
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id, rule.enabled)}
                      label={rule.enabled ? "Active" : "Disabled"}
                    />
                    <div className="h-4 w-px bg-white/10" />
                    <button
                      type="button"
                      onClick={() => openEditModal(rule)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                      title="Edit Rule"
                    >
                      <RiEditLine className="text-lg" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      title="Delete Rule"
                    >
                      <RiDeleteBinLine className="text-lg" />
                    </button>
                  </div>
                </div>

                {/* Target Automated Response */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex flex-col gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <RiChatSmile2Line className="text-violet-400" />
                    Automated Reply
                  </span>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap font-sans">
                    {rule.replyText}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={RiRobot2Line}
          title="No auto-reply rules yet"
          description="Create your first rule above to automatically reply when customers message keywords like 'price', 'demo', or 'help'."
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg flex flex-col gap-5 p-6 border-white/15 bg-[#13151f] shadow-2xl shadow-black/80">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-semibold text-white text-base">
                {editingRuleId ? "Edit Auto-Reply Rule" : "Create Auto-Reply Rule"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                <RiCloseLine />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="flex flex-col gap-4">
              <Input
                label="Trigger Keyword / Phrase"
                placeholder="e.g. price, demo, discount"
                value={formKeyword}
                onChange={(e) => setFormKeyword(e.target.value)}
                autoFocus
              />

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Match Condition
                </label>
                <Select
                  value={formMatchType}
                  onChange={setFormMatchType}
                  options={MATCH_TYPES}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">
                  Target Automated Response
                </label>
                <textarea
                  rows={4}
                  placeholder="Type the message to send back automatically..."
                  value={formReplyText}
                  onChange={(e) => setFormReplyText(e.target.value)}
                  className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition focus:border-violet-500/60 focus:bg-white/[0.06]"
                />
              </div>

              <Toggle
                checked={formEnabled}
                onChange={setFormEnabled}
                label="Enable rule immediately"
              />

              {formError && <p className="text-sm text-rose-400">{formError}</p>}

              <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingRuleId ? "Update Rule" : "Save Rule"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
