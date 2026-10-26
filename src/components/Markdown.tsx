import Link from "next/link";
import { Fragment } from "react";

/**
 * Minimal, safe Markdown renderer for admin-editable pages.
 * Supports: ## / ### headings, paragraphs, - and 1. lists, **bold**, *italic*, [links](/path).
 * Raw HTML is never rendered.
 */
function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) out.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    else if (token.startsWith("*")) out.push(<em key={key}>{token.slice(1, -1)}</em>);
    else {
      const [, label, href] = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)!;
      const safe = /^(\/|https?:\/\/|mailto:)/.test(href) ? href : "#";
      out.push(
        safe.startsWith("/") ? <Link key={key} href={safe}>{label}</Link> : <a key={key} href={safe} rel="noopener noreferrer" target={safe.startsWith("http") ? "_blank" : undefined}>{label}</a>,
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);
  return (
    <div className="prose-cardly">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (block.startsWith("### ")) return <h3 key={bi}>{inline(block.slice(4), `h${bi}`)}</h3>;
        if (block.startsWith("## ")) return <h2 key={bi}>{inline(block.slice(3), `h${bi}`)}</h2>;
        if (lines.every((l) => /^[-*] /.test(l))) {
          return <ul key={bi}>{lines.map((l, li) => <li key={li}>{inline(l.slice(2), `${bi}-${li}`)}</li>)}</ul>;
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return <ol key={bi}>{lines.map((l, li) => <li key={li}>{inline(l.replace(/^\d+\. /, ""), `${bi}-${li}`)}</li>)}</ol>;
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, `${bi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
