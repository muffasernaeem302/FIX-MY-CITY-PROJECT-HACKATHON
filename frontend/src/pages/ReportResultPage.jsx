/** Report result detail page. */
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";

const categoryLabels = { POTHOLE_ROAD_DAMAGE: "Pothole / Road Damage", BROKEN_STREETLIGHT: "Broken Streetlight", GARBAGE_ACCUMULATION: "Garbage", WATER_LEAKAGE: "Water Leakage" };
const DEMO = { id: 0, title: "Large pothole at Oak St & 5th Ave", category: "POTHOLE_ROAD_DAMAGE", status: "AI_ANALYZING", severity: "HIGH", risk_score: 88, priority: "High", description: "A large road defect near the bus stop is creating a hazard for pedestrians and cyclists.", address: "Oak St & 5th Ave, Downtown", created_at: new Date().toISOString() };

export default function ReportResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(location.state?.report || null);
  const [loading, setLoading] = useState(!location.state?.report);

  useEffect(() => {
    if (report) return;
    async function fetchReport() {
      try {
        const { default: api } = await import("../services/api");
        const resp = await api.getIncident(id);
        setReport(resp.data);
      } catch {
        try {
          const stored = JSON.parse(localStorage.getItem(`fmc_inc_${id}`) || "null");
          if (stored) { setReport(stored); return; }
        } catch {}
        try {
          const list = JSON.parse(localStorage.getItem("fixmycity_reports") || "[]");
          const found = list.find((r) => String(r.id) === String(id));
          if (found) { setReport(found); return; }
        } catch {}
        setReport({ ...DEMO, id });
      } finally { setLoading(false); }
    }
    fetchReport();
  }, [id, report]);

  const r = report || DEMO;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Report result</p><h1 className="mt-3 text-3xl font-black tracking-tight text-white">#{r.id}</h1></div>
        <Link to="/dashboard" className="text-sm text-cyan-400 underline hover:text-cyan-300">Back to dashboard</Link>
      </div>
      {loading && <div className="py-12 text-center text-slate-400">Loading...</div>}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <Badge tone="cyan">{(r.status || "SUBMITTED").replace(/_/g, " ")}</Badge>
              <Badge tone="amber">{r.severity || "LOW"}</Badge>
            </div>
            <h2 className="text-2xl font-bold text-white">{r.title}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Category</div><div className="mt-2 text-sm font-medium text-white">{categoryLabels[r.category] || r.category}</div></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Risk score</div><div className="mt-2 text-sm font-medium text-white">{(r.risk_score || 0)}/100</div></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Priority</div><div className="mt-2 text-sm font-medium text-white">{r.priority || "High"}</div></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 sm:col-span-2"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</div><div className="mt-2 text-sm font-medium text-white">{r.address || "Unknown"}</div></div>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><div className="text-xs uppercase tracking-[0.2em] text-slate-500">Description</div><p className="mt-2 text-sm leading-6 text-slate-300">{r.description || "No description provided."}</p></div>
          </Card>
          <Card className="bg-slate-950/80">
            <h2 className="text-xl font-bold text-white">AI analysis</h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="font-medium text-white">Department</div><div className="mt-1">{r.assigned_dept?.name || r.department_name || "Road Maintenance"}</div></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="font-medium text-white">Confidence</div><div className="mt-1">{Math.round((r.ai_confidence || 0.87) * 100)}%</div></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="font-medium text-white">Dispatch lane</div><div className="mt-1">Priority dispatch</div></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4"><div className="font-medium text-white">Duplicate checks</div><div className="mt-1">{r.is_duplicate ? "Matched similar reports" : "No duplicates found"}</div></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
