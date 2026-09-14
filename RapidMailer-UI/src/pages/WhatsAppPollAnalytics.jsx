import { useState, useEffect } from "react";
import axios from "axios";
import {
  RiBarChartGroupedLine,
  RiRefreshLine,
  RiCheckLine,
  RiFilterLine,
  RiDownloadLine,
  RiTimeLine,
  RiUserVoiceLine,
  RiUserFollowLine,
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

export default function WhatsAppPollAnalytics() {
  const [accountId, setAccountId] = useState("");
  const [polls, setPolls] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedOptionFilter, setSelectedOptionFilter] = useState("all");
  const [error, setError] = useState(null);

  const fetchPolls = async () => {
    setLoadingPolls(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/whatsapp/polls`, {
        params: accountId ? { accountId } : {},
      });
      const list = res.data.polls || [];
      setPolls(list);
      if (list.length > 0 && !selectedPollId) {
        setSelectedPollId(list[0].id);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load polls.");
    } finally {
      setLoadingPolls(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [accountId]);

  useEffect(() => {
    if (!selectedPollId) {
      setAnalytics(null);
      return;
    }

    const fetchDetails = async () => {
      setLoadingAnalytics(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/whatsapp/polls/${selectedPollId}`);
        setAnalytics(res.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to fetch poll details.");
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchDetails();
  }, [selectedPollId]);

  const voters = analytics?.voters || [];
  const filteredVoters = voters.filter((v) => {
    if (selectedOptionFilter === "all") return true;
    return (v.selectedOptions || []).includes(selectedOptionFilter);
  });

  const handleExportVoters = () => {
    if (!filteredVoters.length || !analytics) return;
    const rows = filteredVoters.map((v) => ({
      phone: v.phone,
      name: v.name,
      pollQuestion: analytics.question,
      selectedOptions: (v.selectedOptions || []).join("; "),
      votedAt: v.timestamp,
    }));
    const suffix = selectedOptionFilter === "all" ? "all_responders" : "filtered_responders";
    downloadLeadsCsv(rows, `poll_${analytics.id.slice(0, 8)}_${suffix}.csv`);
  };

  const contactRows = filteredVoters.map((v) => ({
    phone: v.phone,
    name: v.name || `Poll Lead (+${v.phone.slice(-4)})`,
    organization: analytics?.question ? `Poll: ${analytics.question.slice(0, 20)}` : "Poll Responder",
    notes: `Voted [${(v.selectedOptions || []).join(", ")}] on "${analytics?.question || ""}" at ${v.timestamp || ""}`,
  }));

  const pollOptionsDropdown = [
    { value: "all", label: "All Responders (No Filter)" },
    ...(analytics?.options || []).map((opt) => ({
      value: opt,
      label: `Voted for: "${opt}"`,
    })),
  ];

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Campaign Analytics"
        title="Interactive Poll Results"
        description="Track lead votes and real-time responses to interactive WhatsApp polls sent in your campaigns. Isolate positive responders for immediate 1-click follow-up."
      />

      {/* Account filter and refresh */}
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
          <div className="w-full md:w-80">
            <WhatsAppAccountSelect value={accountId} onChange={setAccountId} />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchPolls} disabled={loadingPolls} variant="secondary">
              <RiRefreshLine className={loadingPolls ? "animate-spin" : ""} />
              {loadingPolls ? "Refreshing..." : "Refresh Polls"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}
      </Card>

      {/* Main Poll Explorer */}
      {polls.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Poll List */}
          <Card className="flex flex-col gap-3 p-5 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Campaign Polls ({polls.length})</h3>
              <span className="text-xs text-slate-500">Pick to inspect</span>
            </div>

            <div className="flex max-h-[500px] flex-col gap-2.5 overflow-y-auto pr-1">
              {polls.map((p) => {
                const isSelected = selectedPollId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedPollId(p.id);
                      setSelectedOptionFilter("all");
                    }}
                    className={`flex flex-col gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-violet-500/60 bg-violet-500/15 text-white shadow-lg shadow-violet-900/20"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.05] text-slate-300"
                    }`}
                  >
                    <span className="font-medium text-sm line-clamp-2">{p.question}</span>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{p.totalVotes} response{p.totalVotes !== 1 ? "s" : ""}</span>
                      {p.createdAt && <span>{new Date(p.createdAt).toLocaleDateString()}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right Column: Vote Breakdown & Responder Table */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            {loadingAnalytics ? (
              <SectionLoader label="Calculating poll vote distribution..." />
            ) : analytics ? (
              <div className="flex flex-col gap-5">
                {/* Poll Headline & Vote Bar Summary */}
                <Card className="flex flex-col gap-5 p-6">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge tone="brand">Active Campaign Poll</Badge>
                      <span className="text-xs text-slate-500 font-mono">ID: {analytics.id}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{analytics.question}</h3>
                    <p className="text-xs text-slate-400">
                      {analytics.totalRespondents} Total Respondent{analytics.totalRespondents !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Visual Option Percentage Breakdown */}
                  <div className="flex flex-col gap-3">
                    {(analytics.optionCounts || []).map((opt, i) => (
                      <div key={opt.name} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-200">
                            {i + 1}. {opt.name}
                          </span>
                          <span className="font-semibold text-violet-300">
                            {opt.count} vote{opt.count !== 1 ? "s" : ""} ({opt.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-all duration-500"
                            style={{ width: `${opt.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Filter and Export Toolbar */}
                <Card className="flex flex-col gap-4 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="w-full sm:w-72">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Filter by Choice
                      </label>
                      <Select
                        value={selectedOptionFilter}
                        onChange={setSelectedOptionFilter}
                        options={pollOptionsDropdown}
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-4 sm:pt-0">
                      <Button onClick={handleExportVoters} disabled={filteredVoters.length === 0} variant="secondary">
                        <RiDownloadLine />
                        Export Responders CSV ({filteredVoters.length})
                      </Button>
                      <ExportContactsMenu
                        rows={contactRows}
                        filenamePrefix="poll_leads"
                        disabled={filteredVoters.length === 0}
                      />
                    </div>
                  </div>
                </Card>

                {/* Respondents Table */}
                <DataTable
                  columns={[
                    {
                      id: "phone",
                      label: "Respondent Phone",
                      render: (r) => (
                        <span className="font-mono font-medium text-slate-100">+{r.phone}</span>
                      ),
                    },
                    {
                      id: "name",
                      label: "Name",
                      render: (r) => r.name || "WhatsApp User",
                    },
                    {
                      id: "choice",
                      label: "Selected Option(s)",
                      render: (r) => (
                        <div className="flex flex-wrap gap-1">
                          {(r.selectedOptions || []).map((choice) => (
                            <Badge key={choice} tone="good">
                              <RiCheckLine />
                              {choice}
                            </Badge>
                          ))}
                        </div>
                      ),
                    },
                    {
                      id: "time",
                      label: "Voted At",
                      render: (r) => (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <RiTimeLine className="text-slate-500" />
                          {r.timestamp ? new Date(r.timestamp).toLocaleString() : "—"}
                        </span>
                      ),
                    },
                  ]}
                  data={filteredVoters}
                  emptyLabel="No votes match the selected option filter."
                />
              </div>
            ) : (
              <EmptyState
                icon={RiBarChartGroupedLine}
                title="Select a Poll"
                description="Pick any campaign poll from the left list to see live vote metrics."
              />
            )}
          </div>
        </div>
      ) : (
        !loadingPolls && (
          <EmptyState
            icon={RiBarChartGroupedLine}
            title="No campaign polls found"
            description="Send a message with a WhatsApp poll in Bulk Sender to start collecting real-time responses."
          />
        )
      )}
    </div>
  );
}
