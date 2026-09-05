import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Citizen reporting',
    description: 'Residents can submit infrastructure issues with photos, location, and details in under a minute.',
    accent: 'from-cyan-400 to-sky-500',
  },
  {
    title: 'AI triage',
    description: 'The platform classifies incidents, scores severity, and highlights duplicate reports before dispatch.',
    accent: 'from-violet-500 to-indigo-500',
  },
  {
    title: 'Risk routing',
    description: 'City teams receive a risk-ranked queue, mapped by urgency and department assignment.',
    accent: 'from-emerald-400 to-teal-500',
  },
];

const stats = [
  { value: '4', label: 'issue categories' },
  { value: '0-100', label: 'risk scoring' },
  { value: '24/7', label: 'public visibility' },
  { value: '3x', label: 'faster routing' },
];

const impactCards = [
  {
    title: 'Duplicate catch',
    text: 'Detects clustered incident patterns within a 75m radius and similar text to reduce noisy reports.',
  },
  {
    title: 'Department clarity',
    text: 'Automatically routes potholes, lighting, water, and waste issues to the right city function.',
  },
  {
    title: 'Repair verification',
    text: 'Tracks before/after evidence so the city can validate that work was completed correctly.',
  },
];

const categoryData = [
  { name: 'Pothole', value: 38, tone: 'bg-cyan-400' },
  { name: 'Lighting', value: 21, tone: 'bg-violet-400' },
  { name: 'Waste', value: 24, tone: 'bg-emerald-400' },
  { name: 'Water', value: 17, tone: 'bg-amber-400' },
];

const queue = [
  { title: 'Large pothole near downtown bus stop', severity: 'Critical', risk: 92, status: 'Priority dispatch' },
  { title: 'Broken streetlight on 8th Avenue', severity: 'High', risk: 82, status: 'Awaiting crew' },
  { title: 'Garbage accumulation at riverwalk', severity: 'Medium', risk: 63, status: 'Assigned' },
];

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      <section className="relative mx-auto max-w-7xl px-6 pb-16 pt-12 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(29,78,216,0.18),transparent_28%)]" />

        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
              AI-powered civic intelligence
            </div>

            <h1 className="max-w-xl text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
              Fix city issues before they become public safety risks.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-300">
              FixMyCity helps residents report potholes, streetlights, garbage, and water leaks while city teams track severity, duplicate reports, and repair verification in one command center.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/report" className="rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:brightness-110">
                Report an issue
              </Link>
              <Link to="/dashboard" className="rounded-full border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800">
                View dashboard
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-5 shadow-glow backdrop-blur-xl">
              <div className="rounded-[24px] border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Command center</p>
                    <h2 className="mt-2 text-xl font-bold text-white">Live city risk</h2>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                    DEMO MODE
                  </span>
                </div>

                <div className="space-y-4">
                  {queue.map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{item.status}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.severity === 'Critical'
                            ? 'bg-red-500/15 text-red-300'
                            : item.severity === 'High'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-cyan-500/15 text-cyan-300'
                        }`}>
                          {item.severity}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-400">Risk</span>
                        <span className="text-lg font-bold text-white">{item.risk}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600"
                          style={{ width: `${item.risk}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">How it works</p>
          <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">From resident report to city action.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 backdrop-blur-sm">
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent}`}>
                <span className="text-lg font-black text-slate-950">0{index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="impact" className="border-y border-slate-800 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Impact</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Prioritized by risk, not just volume.</h2>
              <p className="mt-4 max-w-md text-slate-300">
                City operations teams see which issues are urgent, likely duplicated, and already assigned so they can focus on real public-safety risks.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {impactCards.map((card) => (
                <div key={card.title} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
                  <div className="mb-4 h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500" />
                  <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">Operational view</p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">A dashboard built for city teams.</h2>
          </div>
          <a href="#demo" className="text-sm font-medium text-cyan-300 hover:text-cyan-200">See the demo flow →</a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Issue mix</h3>
              <span className="text-sm text-slate-400">Last 30 days</span>
            </div>

            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.name}>
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                    <span>{category.name}</span>
                    <span>{category.value}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-800">
                    <div className={`h-2.5 rounded-full ${category.tone}`} style={{ width: `${category.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Priority queue</h3>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-xs font-medium text-cyan-300">8 active</span>
            </div>

            <div className="space-y-4">
              {[
                ['Roads', '24'],
                ['Lighting', '12'],
                ['Waste', '9'],
                ['Water', '6'],
              ].map(([name, count]) => (
                <div key={name} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <span className="text-slate-200">{name}</span>
                  <span className="text-lg font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
        <div className="rounded-[32px] border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 shadow-glow">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Demo flow</p>
              <h2 className="mt-3 text-3xl font-bold text-white">A fast report flow built for public trust.</h2>
              <ul className="mt-6 space-y-4 text-slate-300">
                <li className="flex gap-3"><span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-cyan-400" />Citizen uploads a photo and location.</li>
                <li className="flex gap-3"><span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-violet-400" />AI classifies it and assigns a severity hint.</li>
                <li className="flex gap-3"><span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />Risk engine detects duplicates and routes to the right department.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-950/90 p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Incident summary</span>
                <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-300">Resolved</span>
              </div>

              <div className="space-y-4 text-sm text-slate-300">
                <div className="rounded-2xl bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <span>Category</span>
                    <span className="font-medium text-white">Pothole</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <span>Risk score</span>
                    <span className="font-medium text-white">92 / 100</span>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-900 p-4">
                  <div className="flex items-center justify-between">
                    <span>Department</span>
                    <span className="font-medium text-white">Roads</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
