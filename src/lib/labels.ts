import type { ProductFormat, ProductType } from "@prisma/client";

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  GREETING_CARD: "Printable Greeting Card",
  VIRTUAL_CARD: "Virtual Card",
  INVITATION: "Printable Invitation",
  PLANNER: "Printable Planner",
  WALL_ART: "Printable Wall Art",
  GIFT_TAG: "Printable Gift Tags",
  CHECKLIST: "Printable Checklist",
  TEMPLATE: "Digital Template",
  PARTY_DECORATION: "Party Decoration",
  PRINTABLE_GAME: "Printable Game",
  OTHER: "Digital Download",
};

export const PRODUCT_TYPE_FILTERS: { value: ProductType; label: string }[] = [
  { value: "GREETING_CARD", label: "Greeting cards" },
  { value: "VIRTUAL_CARD", label: "Virtual cards" },
  { value: "INVITATION", label: "Invitations" },
  { value: "PLANNER", label: "Planners" },
  { value: "WALL_ART", label: "Wall art" },
  { value: "GIFT_TAG", label: "Gift tags" },
  { value: "CHECKLIST", label: "Checklists" },
  { value: "TEMPLATE", label: "Templates" },
  { value: "PARTY_DECORATION", label: "Party decorations" },
  { value: "PRINTABLE_GAME", label: "Printable games" },
  { value: "OTHER", label: "Other downloads" },
];

export const FORMAT_LABELS: Record<ProductFormat, string> = {
  PRINTABLE: "Printable",
  VIRTUAL: "Virtual (share digitally)",
};

export function isCardType(type: ProductType) {
  return type === "GREETING_CARD" || type === "VIRTUAL_CARD";
}
