"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, CloseIcon, MenuIcon, SearchIcon } from "./Icons";
import { LogoMark } from "./Logo";

type NavLink = { href: string; label: string; dropdown?: boolean };
export type NavCategoryGroup = { label: string; items: { href: string; label: string }[] };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/** Mobile hamburger menu (rendered at the left of the header below lg). */
export function MobileMenu({ links, groups }: { links: NavLink[]; groups: NavCategoryGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button type="button" className="rounded-full p-2.5 hover:bg-blush" aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen(true)}>
        <MenuIcon size={24} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-menu">
          <div className="absolute inset-0 bg-charcoal/30 animate-fade-in" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-cream shadow-lift animate-fade-in">
            <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
              <LogoMark className="text-4xl" />
              <button type="button" className="rounded-full p-2 hover:bg-blush" aria-label="Close menu" onClick={() => setOpen(false)}>
                <CloseIcon size={24} />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex-1 px-5 py-4">
              <ul className="space-y-1">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={`block rounded-xl px-3 py-3 font-serif text-2xl ${isActive(pathname, l.href) ? "bg-blush" : "hover:bg-blush/60"}`}>
                      {l.label}
                    </Link>
                    {l.dropdown && (
                      <div className="mb-2 ml-3 grid grid-cols-1 gap-x-4 border-l border-rose/30 pl-4">
                        {groups.map((g) => (
                          <div key={g.label} className="py-2">
                            <p className="eyebrow mb-1">{g.label}</p>
                            {g.items.slice(0, 8).map((i) => (
                              <Link key={i.href} href={i.href} className="block py-1.5 text-[15px] text-charcoal-soft hover:text-rose-deep">
                                {i.label}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
                <li>
                  <Link href="/account" className="block rounded-xl px-3 py-3 font-serif text-2xl hover:bg-blush/60">Account</Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export function DesktopNav({ links, groups }: { links: NavLink[]; groups: NavCategoryGroup[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <ul className="flex items-center gap-1 xl:gap-2">
      {links.map((l) =>
        l.dropdown ? (
          <li key={l.href} className="relative" ref={ref} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
            <button
              type="button"
              className={`flex items-center gap-1 rounded-full px-3 py-2 text-[15px] transition hover:text-rose-deep ${isActive(pathname, "/categor") ? "text-rose-deep" : ""}`}
              aria-expanded={open}
              aria-haspopup="true"
              onClick={() => setOpen((o) => !o)}
            >
              {l.label} <ChevronDown size={14} />
            </button>
            {open && (
              <div className="absolute left-1/2 top-full z-50 w-[640px] -translate-x-1/2 pt-2">
                <div className="grid grid-cols-3 gap-6 rounded-2xl border border-charcoal/5 bg-white p-6 shadow-lift animate-fade-in">
                  {groups.map((g) => (
                    <div key={g.label}>
                      <p className="eyebrow mb-3">{g.label}</p>
                      <ul className="space-y-1.5">
                        {g.items.slice(0, 10).map((i) => (
                          <li key={i.href}>
                            <Link href={i.href} className="text-[14px] text-charcoal-soft hover:text-rose-deep">{i.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <Link href="/categories" className="link col-span-3 text-sm">View all categories</Link>
                </div>
              </div>
            )}
          </li>
        ) : (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={isActive(pathname, l.href) ? "page" : undefined}
              className={`rounded-full px-3 py-2 text-[15px] transition hover:text-rose-deep ${isActive(pathname, l.href) ? "text-rose-deep" : ""}`}
            >
              {l.label}
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);
  return (
    <>
      <button type="button" className="rounded-full p-2.5 transition hover:bg-blush" aria-label="Search" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <SearchIcon size={22} />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-charcoal/5 bg-cream/95 shadow-soft backdrop-blur animate-fade-in">
          <form
            role="search"
            className="container-page flex items-center gap-3 py-4"
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <label htmlFor="site-search" className="sr-only">Search Cardly</label>
            <SearchIcon size={20} className="text-charcoal-muted" />
            <input
              ref={input}
              id="site-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              placeholder="Search birthday, thank you, planner…"
              className="w-full bg-transparent py-2 font-serif text-2xl placeholder:text-charcoal-muted/60 focus:outline-none"
            />
            <button type="submit" className="btn-primary btn-sm">Search</button>
          </form>
        </div>
      )}
    </>
  );
}

