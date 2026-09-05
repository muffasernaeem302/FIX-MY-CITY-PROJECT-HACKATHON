/**
 * Card container with consistent dark surface styling.
 */

export default function Card({ children, className = "", as: Tag = "div", ...props }) {
  return (
    <Tag
      className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-6 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}