/** Semantic section with consistent vertical padding. */
export default function Section({
  children,
  className = "",
  pt = "lg:pt-20 pt-16",
  pb = "lg:pb-24 pb-20",
  ...props
}) {
  return (
    <section className={`${pt} ${pb} ${className}`} {...props}>
      {children}
    </section>
  );
}