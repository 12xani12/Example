import Link from "next/link";

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-start font-script leading-none text-charcoal ${className}`}>
      Cardly
      <svg viewBox="0 0 10 10" className="ml-0.5 mt-[0.15em] h-[0.32em] w-[0.32em]" aria-hidden="true">
        <path d="M5 9.2C2 7 0 5.2 0 3.1 0 1.4 1.3 0 3 0c1 0 1.6.5 2 1.2C5.4.5 6 0 7 0c1.7 0 3 1.4 3 3.1 0 2.1-2 3.9-5 6.1Z" fill="#D98291" />
      </svg>
    </span>
  );
}

export function Logo({ className = "text-[2.4rem]" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Cardly home" className="inline-flex rounded-md">
      <LogoMark className={className} />
    </Link>
  );
}
