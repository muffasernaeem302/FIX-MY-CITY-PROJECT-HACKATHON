/**
 * Form input with consistent dark styling.
 */

export default function Input({
  label,
  error,
  hint,
  required,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="ml-1 text-red-400">*</span>}
        </label>
      )}
      <input
        className={`mt-1 block w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 transition focus:outline-none focus:ring-1 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-slate-700 focus:border-cyan-400 focus:ring-cyan-400"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}