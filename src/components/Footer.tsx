import Link from "next/link";
import { LogoMark } from "./Logo";
import { FacebookIcon, InstagramIcon, PinterestIcon } from "./Icons";
import { getBusinessSettings } from "@/lib/settings";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "Shop all" },
      { href: "/categories", label: "Categories" },
      { href: "/personalised-cards", label: "Personalised cards" },
      { href: "/virtual-cards", label: "Virtual cards" },
      { href: "/shop?new=1", label: "New arrivals" },
    ],
  },
  {
    title: "Help",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/printing-instructions", label: "Printing instructions" },
      { href: "/faqs", label: "FAQs" },
      { href: "/orders/lookup", label: "Find my downloads" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Cardly",
    links: [
      { href: "/about", label: "About Cardly" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/refunds", label: "Refund Policy" },
      { href: "/licence", label: "Personal Use Licence" },
      { href: "/cookies", label: "Cookie Policy" },
    ],
  },
];

export async function Footer() {
  const business = await getBusinessSettings();
  const socials = [
    { href: business.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { href: business.pinterestUrl, label: "Pinterest", Icon: PinterestIcon },
    { href: business.facebookUrl, label: "Facebook", Icon: FacebookIcon },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-charcoal/5 bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <LogoMark className="text-5xl" />
          <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-charcoal-soft">
            Small Cards. Big Moments. An Australian online shop for printable and virtual cards, ready to download instantly.
          </p>
          {socials.length > 0 && (
            <ul className="mt-5 flex gap-2" aria-label="Social media">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex rounded-full bg-blush p-2.5 transition hover:bg-rose hover:text-white" aria-label={`Cardly on ${label}`}>
                    <Icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h2 className="eyebrow mb-4 font-sans">{col.title}</h2>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] text-charcoal-soft transition hover:text-rose-deep">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-charcoal/5">
        <div className="container-page flex flex-col gap-2 py-6 text-[13px] text-charcoal-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {business.businessName}{business.abn ? ` · ABN ${business.abn}` : ""}. All prices in AUD.</p>
          <p>Digital products only — nothing is shipped.</p>
        </div>
      </div>
    </footer>
  );
}
