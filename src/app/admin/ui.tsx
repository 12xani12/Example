// Small shared building blocks for admin pages (server-safe).
export function AdminHeader({ title, intro, actions }: { title: string; intro?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl">{title}</h1>
        {intro && <p className="mt-1 max-w-2xl text-[15px] text-charcoal-soft">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 shadow-soft sm:p-6 ${className}`}>
      {title && <h2 className="mb-4 text-2xl">{title}</h2>}
      {children}
    </section>
  );
}

export function Notice({ tone = "sage", children }: { tone?: "sage" | "blush" | "peach"; children: React.ReactNode }) {
  const bg = { sage: "bg-sage", blush: "bg-blush-light text-rose-deeper", peach: "bg-peach" }[tone];
  return <p role="status" className={`mb-6 rounded-2xl px-4 py-3 text-sm ${bg}`}>{children}</p>;
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "bad" }) {
  const cls = { neutral: "bg-charcoal/10", good: "bg-sage text-sage-deep", warn: "bg-peach", bad: "bg-blush text-rose-deeper" }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function Field({ label, name, hint, ...props }: { label: string; name: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className="input py-2.5" {...props} />
      {hint && <p className="mt-1 text-xs text-charcoal-muted">{hint}</p>}
    </div>
  );
}

export function Checkbox({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5 text-[15px]">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-rose-deep" />
      <span>{label}{hint && <span className="block text-xs text-charcoal-muted">{hint}</span>}</span>
    </label>
  );
}

export const ORDER_STATUS_TONE: Record<string, "neutral" | "good" | "warn" | "bad"> = {
  PENDING: "warn", PAID: "good", FAILED: "bad", CANCELLED: "neutral", REFUNDED: "bad", PARTIALLY_REFUNDED: "warn",
};
