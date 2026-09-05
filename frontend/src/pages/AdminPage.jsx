/** Admin dashboard overview. */

import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";

const queue = [
  { title: "Large pothole near downtown bus stop", department: "Roads", risk: 92, status: "Priority dispatch" },
  { title: "Broken streetlight on 8th Avenue", department: "Lighting", risk: 82, status: "Awaiting crew" },
  { title: "Water leak at Riverside Square", department: "Water", risk: 76, status: "Assigned" },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Admin command center</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white">City operations overview</h1>
        </div>
        <Badge tone="emerald">LIVE DEMO</Badge>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Open incidents", value: 84, tone: "cyan" },
          { label: "Critical risk", value: 12, tone: "red" },
          { label: "Resolved today", value: 29, tone: "emerald" },
        ].map((stat) => (
          <Card key={stat.label}>
            <div className="text-3xl font-black text-white">{stat.value}</div>
            <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-6 text-lg font-semibold text-white">Priority queue</h2>
        <div className="space-y-4">
          {queue.map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{item.department}</span>
                    <span>•</span>
                    <span>{item.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{item.risk}</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Risk</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
