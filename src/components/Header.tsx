import Link from "next/link";
import { Logo } from "./Logo";
import { BagIcon, UserIcon } from "./Icons";
import { DesktopNav, MobileMenu, SearchButton, type NavCategoryGroup } from "./HeaderClient";
import { cartCount } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { getVisibleCategories } from "@/lib/catalog";
import { getHomepageSettings } from "@/lib/settings";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories", dropdown: true },
  { href: "/personalised-cards", label: "Personalised Cards" },
  { href: "/virtual-cards", label: "Virtual Cards" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const GROUP_LABELS = { GREETING_CARDS: "Greeting Cards", VIRTUAL_CARDS: "Virtual Cards", OTHER_DOWNLOADS: "Other Downloads" } as const;

export async function Header() {
  const [count, user, categories, home] = await Promise.all([cartCount(), getCurrentUser(), getVisibleCategories(), getHomepageSettings()]);
  const groups: NavCategoryGroup[] = (Object.keys(GROUP_LABELS) as (keyof typeof GROUP_LABELS)[]).map((g) => ({
    label: GROUP_LABELS[g],
    items: categories.filter((c) => c.group === g).map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
  }));

  return (
    <>
      {home.announcement && (
        <div className="bg-charcoal px-4 py-2 text-center text-[12px] tracking-[0.12em] text-cream/90">{home.announcement}</div>
      )}
      <header className="sticky top-0 z-40 border-b border-charcoal/5 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/80">
        <div className="container-page flex h-[72px] items-center gap-4">
          <MobileMenu links={NAV_LINKS} groups={groups} />
          <div className="flex flex-1 justify-center lg:flex-none lg:justify-start">
            <Logo />
          </div>
          <nav aria-label="Main" className="hidden flex-1 justify-center lg:flex">
            <DesktopNav links={NAV_LINKS} groups={groups} />
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <SearchButton />
            <Link href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/account/login"} className="hidden rounded-full p-2.5 transition hover:bg-blush sm:inline-flex" aria-label={user ? "Your account" : "Sign in"}>
              <UserIcon size={22} />
            </Link>
            <Link href="/cart" className="relative rounded-full p-2.5 transition hover:bg-blush" aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}>
              <BagIcon size={22} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-deep px-1 text-[11px] font-medium text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
