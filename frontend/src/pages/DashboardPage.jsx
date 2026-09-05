/** Citizen dashboard — overview of user's reports. */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

const DEMO_REPORTS = [
  { id: 1001, title: "Large pothole at Oak St & 5th Ave", category: "POTHOLE_ROAD_DAMAGE", status: "RESOLVED", severity: "HIGH", risk_score: 88, created_at: "2026-08-20T14:30:00Z" },
  { id: 1002, title: "Flickering streetlight near park entrance", category: "BROKEN_STREETLIGHT", status: "IN_PROGRESS", severity: "MEDIUM", risk_score: 42, created_at: "2026-08-25T09:15:00Z" },
  { id: 1003, title: "Overflowing bin at Riverside Market", category: "GARBAGE_ACCUMULATION", status: "ASSIGNED", severity: "LOW", risk_score: 18, created_at: "2026-08-28T11:00:00Z" },
];

const STATUS_TONE = { SUBMITTED: "cyan", AI_ANALYZING: "violet", UNDER_REVIEW: "violet", ASSIGNED: "amber", IN_PROGRESS: "amber", REPAIR_SUBMITTED: "violet", VERIFICATION: "violet", RESOLVED: "emerald", NEEDS_REVIEW: "red", REJECTED: "red" };
const CATEGORY_LABEL = { POTHOLE_ROAD_DAMAGE: "Pothole / Road Damage", BROKEN_STREETLIGHT: "Broken Streetlight", GARBAGE_ACCUMULATION: "Garbage", WATER_LEAKAGE: "Water Leakage" };

function timeAgo(dateStr) {
  if (!dateStr) return "recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const { default: api } = await import("../services/api");
        const resp = await api.getIncidents();
        setReports(resp.data.incidents || []);
      } catch (err) {
        // Fallback to localStorage for demo mode
        try {
          const stored = JSON.parse(localStorage.getItem("fixmycity_reports") || "[]");
          setReports([...stored, ...DEMO_REPORTS]);
        } catch {
          setReports(DEMO_REPORTS);
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const localReports = (() => {
    try { return JSON.parse(localStorage.getItem("fixmycity_reports") || "[]"); } catch { return []; }
  })();
  const displayReports = reports.length > 0 ? reports : [...localReports, ...DEMO_REPORTS];

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">My Dashboard</h1>
          <p className="mt-1 text-slate-400">
            {user?.full_name || user?.email || "Citizen"} — {displayReports.length} report{displayReports.length !== 1 ? "s" : ""} submitted
          </p>
          {error && reports.length === 0 && <p className="mt-1 text-xs text-amber-400">Showing demo data (API unavailable)</p>}
        </div>
        <div className="flex gap-3">
          <Link to="/map">
            <Button variant="secondary"><span className="mr-2">🗺</span> Open City Map</Button>
          </Link>
          <Link to="/report">
            <Button><span className="mr-2">+</span> Report new issue</Button>
          </Link>
        </div>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total reports", value: displayReports.length, tone: "cyan" },
          { label: "Resolved", value: displayReports.filter((r) => r.status === "RESOLVED").length, tone: "emerald" },
          { label: "In progress", value: displayReports.filter((r) => r.status !== "RESOLVED").length, tone: "amber" },
        ].map((s) => (
          <Card key={s.label}>
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="mt-1 text-sm text-slate-400">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-6 text-lg font-semibold text-white">My reports</h2>
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading reports...</div>
        ) : displayReports.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            No reports yet.{" "}
            <Link to="/report" className="text-cyan-400 underline hover:text-cyan-300">
              Submit your first report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayReports.map((report) => (
              <div key={report.id} className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{report.title}</span>
                    <Badge tone={STATUS_TONE[report.status] || "slate"} size="sm">
                      {(report.status || "SUBMITTED").replace(/_/g, " ")}
                    </Badge>
                    <Badge tone="slate" size="sm">
                      {CATEGORY_LABEL[report.category] || report.category}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>Risk: {(report.risk_score || 0)}/100</span>
                    <span>Severity: {report.severity || "LOW"}</span>
                    <span>{timeAgo(report.created_at)}</span>
                  </div>
                </div>
                <Link to={`/report/result/${report.id}`}>
                  <Button variant="secondary" size="sm">View</Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
