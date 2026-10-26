export function SectionHeading({ eyebrow, title, intro, align = "center", id }: { eyebrow?: string; title: string; intro?: string; align?: "center" | "left"; id?: string }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <p className={`eyebrow ${align === "center" ? "flourish" : ""}`}>{eyebrow}</p>}
      <h2 id={id} className="mt-3 text-4xl leading-tight sm:text-[2.75rem]">{title}</h2>
      {intro && <p className="mt-4 text-[17px] leading-relaxed text-charcoal-soft">{intro}</p>}
    </div>
  );
}
