// Server-rendered single-series charts. One hue per chart (identity comes from the title),
// hover tooltips per mark, and a data table for screen readers and exact values.

type Point = { label: string; value: number; display: string };

export function ColumnChart({ title, points, emptyText = "No data yet" }: { title: string; points: Point[]; emptyText?: string }) {
  const max = Math.max(0, ...points.map((p) => p.value));
  const W = 600, H = 180, pad = 4;
  const bw = (W - pad * 2) / Math.max(points.length, 1);
  const ticks = points.length > 10 ? [0, Math.floor(points.length / 2), points.length - 1] : points.map((_, i) => i);
  return (
    <figure>
      <figcaption className="mb-3 text-sm font-medium text-charcoal-soft">{title}</figcaption>
      {max === 0 ? (
        <p className="flex h-[180px] items-center justify-center rounded-xl bg-cream text-sm text-charcoal-muted">{emptyText}</p>
      ) : (
        <div className="relative">
          <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full" role="img" aria-label={title}>
            <line x1={0} x2={W} y1={H} y2={H} stroke="#302C2B" strokeOpacity={0.15} />
            <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="#302C2B" strokeOpacity={0.06} />
            {points.map((p, i) => {
              const h = max ? (p.value / max) * (H - 14) : 0;
              const x = pad + i * bw;
              return (
                <g key={i} className="group">
                  <rect x={x} y={0} width={bw} height={H} fill="transparent" />
                  {h > 0 && <rect x={x + bw * 0.18} y={H - h} width={bw * 0.64} height={h} rx={Math.min(4, bw * 0.3)} fill="#B4596B" className="transition group-hover:fill-[#9A4657]" />}
                  <title>{`${p.label}: ${p.display}`}</title>
                </g>
              );
            })}
            {ticks.map((i) => (
              <text key={i} x={pad + i * bw + bw / 2} y={H + 16} fontSize={11} textAnchor="middle" fill="#6F6766">{points[i].label}</text>
            ))}
          </svg>
          <p className="absolute right-0 top-0 text-xs text-charcoal-muted">max {points.find((p) => p.value === max)?.display}</p>
        </div>
      )}
      <details className="mt-2 text-xs text-charcoal-muted">
        <summary className="cursor-pointer">View as table</summary>
        <table className="mt-2 w-full"><tbody>{points.map((p) => <tr key={p.label}><td className="py-0.5">{p.label}</td><td className="text-right">{p.display}</td></tr>)}</tbody></table>
      </details>
    </figure>
  );
}

export function BarList({ title, rows, emptyText = "No sales yet" }: { title: string; rows: { label: string; value: number; display: string }[]; emptyText?: string }) {
  const max = Math.max(0, ...rows.map((r) => r.value));
  return (
    <figure>
      <figcaption className="mb-3 text-sm font-medium text-charcoal-soft">{title}</figcaption>
      {rows.length === 0 ? (
        <p className="rounded-xl bg-cream p-6 text-center text-sm text-charcoal-muted">{emptyText}</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.label} title={`${r.label}: ${r.display}`}>
              <div className="flex justify-between gap-3 text-sm"><span className="truncate">{r.label}</span><span className="whitespace-nowrap text-charcoal-soft">{r.display}</span></div>
              <div className="mt-1 h-2 rounded-full bg-cream" aria-hidden="true"><div className="h-2 rounded-full bg-rose-deep" style={{ width: `${max ? Math.max(2, (r.value / max) * 100) : 0}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
