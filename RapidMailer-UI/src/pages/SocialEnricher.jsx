import { useContext, useState } from "react";
import { RiUpload2Line, RiDownloadLine, RiShareForwardLine } from "react-icons/ri";
import { SocialEnricherContext } from "../context/SocialEnricherContext";
import { parseLeadsCsv, downloadLeadsCsv } from "../utils/leadCsv";
import ShowSocialEnricherTable from "../components/ShowSocialEnricherTable";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import SectionLoader from "../components/ui/SectionLoader";
import EmptyState from "../components/ui/EmptyState";

// Mirrors the backend's own per-request cap — this endpoint searches a
// search engine twice per lead, which is far more rate-limit sensitive than
// a normal website fetch.
const MAX_BATCH = 100;

const SocialEnricher = () => {
  const { leads, loading, error, enrichSocial } = useContext(SocialEnricherContext);
  const [showAlert, setShowAlert] = useState(false);
  const [fileName, setFileName] = useState("");
  const [pendingRows, setPendingRows] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setFileName(file.name);

    const rows = await parseLeadsCsv(file);
    if (rows.length === 0) {
      setShowAlert(true);
      setPendingRows([]);
      return;
    }
    setShowAlert(false);
    setPendingRows(rows);
    enrichSocial(rows.slice(0, MAX_BATCH));
    event.target.value = "";
  };

  const handleExport = () => {
    downloadLeadsCsv(leads, "leads_with_social.csv");
  };

  const foundCount = leads.filter((l) => l.facebookUrl || l.instagramUrl).length;

  return (
    <div className="flex flex-col gap-8 p-6 md:p-10">
      <PageHeader
        eyebrow="Lead Generation"
        title="Social Enricher"
        description={
          'For leads with no website — export the "No Website" CSV from the Google Maps tool and ' +
          "upload it here. Most local businesses still run a Facebook Page for customer engagement, " +
          "so this finds it (free, no API key), gives you a one-click Messenger link, and makes a " +
          "best-effort attempt at a public email/phone from the page."
        }
      />

      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="social-csv-input"
            className="grad-bg inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 hover:brightness-110"
          >
            <RiUpload2Line />
            Choose CSV File
          </label>
          <input
            id="social-csv-input"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          {fileName && <span className="text-sm text-slate-400">{fileName}</span>}
        </div>
        <p className="text-xs text-slate-500">
          Needs a <code className="text-slate-400">name</code> column, plus{" "}
          <code className="text-slate-400">address</code> (or <code className="text-slate-400">city</code>)
          to narrow the search — the Google Maps export already has both. Facebook blocks a lot of
          automated access, so expect this to fill in for some leads, not all — the Facebook/Messenger
          link is the reliable part; the extracted email/phone is a bonus when it works.
        </p>
        {pendingRows.length > MAX_BATCH && (
          <p className="text-xs text-amber-400">
            That CSV has {pendingRows.length} leads — only the first {MAX_BATCH} were sent (the search
            endpoint caps a single run there). Split the rest into a second file and run it separately.
          </p>
        )}
        {showAlert && (
          <span className="text-sm text-rose-400">That CSV looks empty — please check the file.</span>
        )}
      </Card>

      {loading ? (
        <SectionLoader label="Searching for Facebook/Instagram pages. This can take a moment per lead..." />
      ) : error ? (
        <p className="text-rose-400">{error}</p>
      ) : leads.length > 0 ? (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-slate-400">
            Found a social profile for {foundCount} of {leads.length} leads.
          </p>
          <ShowSocialEnricherTable data={leads} />
          <div className="flex justify-end">
            <Button onClick={handleExport}>
              <RiDownloadLine />
              Export CSV with Social Profiles
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={RiShareForwardLine}
          title="No leads loaded"
          description='Upload a "No Website" CSV above to start finding social profiles.'
        />
      )}
    </div>
  );
};

export default SocialEnricher;
