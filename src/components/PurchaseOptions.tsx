"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";
import { formatAudShort } from "@/lib/money";
import { BagIcon, EditIcon } from "./Icons";

type Option = { kind: "READY_MADE" | "PERSONALISED"; priceCents: number; available: boolean };

export function PurchaseOptions({ productId, slug, options, isVirtual, unavailableReason }: { productId: string; slug: string; options: Option[]; isVirtual: boolean; unavailableReason: string | null }) {
  const firstAvailable = options.find((o) => o.available)?.kind ?? options[0]?.kind;
  const [selected, setSelected] = useState(firstAvailable);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const current = options.find((o) => o.kind === selected);

  const describe = (kind: Option["kind"]) =>
    kind === "READY_MADE"
      ? { title: "Ready-Made", text: isVirtual ? "The finished design with a blank or pre-designed message page." : "The original design. Inside is blank or pre-designed — write your own note by hand." }
      : { title: "Personalised", text: isVirtual ? "Add your own message to the card before you buy." : "Type your message and we'll print it inside, beautifully set. Front artwork stays the same." };

  return (
    <div>
      {options.length > 1 && (
        <fieldset>
          <legend className="label mb-3">Choose an option</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {options.map((o) => {
              const d = describe(o.kind);
              const active = selected === o.kind;
              return (
                <label key={o.kind} className={`relative flex cursor-pointer flex-col rounded-2xl border-2 bg-white p-4 transition ${active ? "border-rose-deep shadow-soft" : "border-charcoal/10 hover:border-rose/60"} ${!o.available ? "opacity-60" : ""}`}>
                  <input type="radio" name="option" value={o.kind} checked={active} onChange={() => setSelected(o.kind)} className="sr-only" />
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-serif text-xl">{d.title}</span>
                    <span className="font-medium">{formatAudShort(o.priceCents)}</span>
                  </span>
                  <span className="mt-1 text-[13px] leading-snug text-charcoal-soft">{d.text}</span>
                  {active && <span className="absolute -top-2.5 right-3 rounded-full bg-rose-deep px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">Selected</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-5">
        {unavailableReason || !current?.available ? (
          <div className="rounded-2xl bg-peach px-5 py-4 text-[15px]" role="note">
            <p className="font-medium">Not available to purchase yet</p>
            <p className="mt-1 text-charcoal-soft">{unavailableReason ?? "This option isn't available right now."}</p>
          </div>
        ) : selected === "PERSONALISED" ? (
          <Link href={`/products/${slug}/personalise`} className="btn-primary w-full py-4 text-[15px]">
            <EditIcon size={18} /> Personalise this card — {formatAudShort(current.priceCents)}
          </Link>
        ) : (
          <button
            type="button"
            className="btn-primary w-full py-4 text-[15px]"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setError(null);
                const res = await addToCart({ productId, kind: "READY_MADE" });
                if (res.ok) router.push(res.redirect ?? "/cart");
                else setError(res.error);
              })
            }
          >
            <BagIcon size={18} /> {pending ? "Adding…" : `Add to cart — ${formatAudShort(current.priceCents)}`}
          </button>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-rose-deeper">{error}</p>}
      </div>
    </div>
  );
}
