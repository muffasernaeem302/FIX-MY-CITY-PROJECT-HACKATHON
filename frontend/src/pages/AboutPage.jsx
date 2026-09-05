/**
 * About / How It Works page.
 * Explains the MVP pipeline without fake testimonials.
 */

const pipeline = [
  {
    step: "01",
    title: "Citizen reports",
    text: "Upload a photo, add a short description, and pin the exact location using browser geolocation or a manual address search.",
  },
  {
    step: "02",
    title: "AI analysis",
    text: "A vision-capable model classifies the issue into one of four categories and returns a confidence score plus a severity hint.",
  },
  {
    step: "03",
    title: "Duplicate detection",
    text: "Geo proximity, text similarity, time window, and optional image hashing cluster similar reports without deleting any citizen submission.",
  },
  {
    step: "04",
    title: "Risk engine",
    text: "A transparent 0-100 civic risk score is computed from severity, exposure, nearby critical locations, report count, and time unresolved.",
  },
  {
    step: "05",
    title: "Department routing",
    text: "The incident is routed by default to the right department (Roads, Lighting, Waste, or Water & Sanitation), with admin override.",
  },
  {
    step: "06",
    title: "Repair verification",
    text: "After-repair evidence is compared against the original report by AI. The result is labeled Likely Resolved or Needs Human Review.",
  },
];

const categories = [
  { name: "Pothole / Road Damage", dept: "Road Maintenance" },
  { name: "Broken Streetlight", dept: "Street Lighting" },
  { name: "Garbage Accumulation", dept: "Waste Management" },
  { name: "Water Leakage", dept: "Water & Sanitation" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
      {/* Header */}
      <div className="mb-16 text-center">
        <span className="inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
          How it works
        </span>
        <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight text-white lg:text-5xl">
          From citizen photo to verified repair.
        </h1>
        <p className="mt-6 text-lg text-slate-300">
          FixMyCity runs a six-step pipeline that surfaces the right incident to the right department, at the right urgency.
        </p>
      </div>

      {/* Pipeline */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pipeline.map((item) => (
          <div
            key={item.step}
            className="rounded-3xl border border-slate-800 bg-slate-950/70 p-8 transition hover:border-cyan-500/30"
          >
            <span className="text-sm font-mono text-cyan-400">{item.step}</span>
            <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="mt-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">
          Four categories, four departments.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center"
            >
              <div className="text-lg font-semibold text-white">{cat.name}</div>
              <div className="mt-2 text-sm text-slate-400">{cat.dept}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk threshold note */}
      <div className="mt-20 rounded-3xl border border-slate-800 bg-slate-950/70 p-8">
        <h2 className="text-2xl font-bold text-white">Risk thresholds (documented MVP)</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {[
            { range: "0-24", label: "LOW", tone: "emerald" },
            { range: "25-49", label: "MEDIUM", tone: "cyan" },
            { range: "50-74", label: "HIGH", tone: "amber" },
            { range: "75-100", label: "CRITICAL", tone: "red" },
          ].map((r) => (
            <div key={r.label} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="text-2xl font-black text-white">{r.range}</div>
              <div className="mt-1 text-sm text-slate-400">{r.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-500">
          These thresholds are documented implementation choices. The UI shows a factor breakdown so the score is fully transparent.
        </p>
      </div>
    </div>
  );
}