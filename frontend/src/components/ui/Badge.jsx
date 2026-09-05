/**
 * Status badge — severity, status, or risk.
 * `tone` controls color: cyan | violet | emerald | amber | red | slate
 */
const toneMap = {
  cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  violet: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  amber: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  red: "border-red-500/30 bg-red-500/10 text-red-300",
  slate: "border-slate-500/30 bg-slate-500/10 text-slate-400",
};

export default function Badge({
  children,
  tone = "slate",
  size = "md",
  className = "",
}) {
  const base =
    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium";
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "";
  return (
    <span
      className={`${base} ${toneMap[tone] || toneMap.slate} ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
}