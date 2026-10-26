"use client";

import { CARD_FONTS, PANEL_H, PANEL_W } from "@/lib/card/constants";
import type { CardLayout } from "@/lib/card/layout";
import type { TemplateSettings } from "@/lib/card/personalisation";

export type PanelKind = "front" | "inside-left" | "inside-right" | "back";

type Props = {
  kind: PanelKind;
  frontSrc: string | null;
  insideSrc: string | null;
  layout: CardLayout | null;
  template: TemplateSettings;
  showGuides?: boolean;
  title: string;
  className?: string;
};

/** One A5 panel drawn in PDF point space so it matches the generated file. */
export function CardPanel({ kind, frontSrc, insideSrc, layout, template, showGuides, title, className = "" }: Props) {
  const label = kind === "front" ? `${title} — front cover` : kind === "back" ? "Back cover" : kind === "inside-left" ? "Inside left page" : "Inside right page with your message";
  return (
    <svg viewBox={`0 0 ${PANEL_W} ${PANEL_H}`} className={`block h-auto w-full bg-white ${className}`} role="img" aria-label={label}>
      {kind === "front" && frontSrc && <image href={frontSrc} x={0} y={0} width={PANEL_W} height={PANEL_H} preserveAspectRatio="xMidYMid slice" />}
      {kind === "inside-left" && <rect width={PANEL_W} height={PANEL_H} fill="#FFFFFF" />}
      {kind === "back" && (
        <g>
          <rect width={PANEL_W} height={PANEL_H} fill="#FFFFFF" />
          <text x={PANEL_W / 2 - 6} y={PANEL_H - 70} textAnchor="middle" fontFamily="CardlyScript" fontSize={22} fill="#302C2B">Cardly</text>
          <path transform={`translate(${PANEL_W / 2 + 26} ${PANEL_H - 90}) scale(0.9)`} d="M5 9.2C2 7 0 5.2 0 3.1 0 1.4 1.3 0 3 0c1 0 1.6.5 2 1.2C5.4.5 6 0 7 0c1.7 0 3 1.4 3 3.1 0 2.1-2 3.9-5 6.1Z" fill="#D98291" />
          <text x={PANEL_W / 2} y={PANEL_H - 52} textAnchor="middle" fontFamily="CardlySans" fontSize={7.5} fill="#6E6766">Small Cards. Big Moments.</text>
        </g>
      )}
      {kind === "inside-right" && (
        <g>
          {insideSrc ? <image href={insideSrc} x={0} y={0} width={PANEL_W} height={PANEL_H} preserveAspectRatio="xMidYMid slice" /> : <rect width={PANEL_W} height={PANEL_H} fill="#FFFFFF" />}
          {showGuides && (
            <rect
              x={template.textX}
              y={template.textY}
              width={template.textWidth}
              height={template.textHeight}
              fill="none"
              stroke={layout?.overflow ? "#B4596B" : "#D98291"}
              strokeOpacity={layout?.overflow ? 0.9 : 0.45}
              strokeDasharray="4 4"
              strokeWidth={layout?.overflow ? 1.5 : 1}
            />
          )}
          {layout &&
            layout.lines.map((line, i) => (
              <text
                key={i}
                x={line.x}
                y={line.baseline}
                fontFamily={CARD_FONTS[layout.font].cssFamily}
                fontSize={line.size}
                fill={layout.colour}
                style={{ whiteSpace: "pre", fontKerning: "normal" }}
              >
                {line.text}
              </text>
            ))}
        </g>
      )}
    </svg>
  );
}
