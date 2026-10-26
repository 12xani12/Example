"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";

/**
 * GET form that works without JavaScript and, when JS is available,
 * applies select/radio/checkbox changes immediately. Empty fields are omitted.
 */
export function AutoSubmitForm({ action, className, children }: { action: string; className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const go = () => {
    const form = ref.current;
    if (!form) return;
    const params = new URLSearchParams();
    new FormData(form).forEach((v, k) => {
      if (typeof v === "string" && v.trim() !== "") params.set(k, v.trim());
    });
    const qs = params.toString();
    router.push(qs ? `${action}?${qs}` : action, { scroll: false });
  };
  return (
    <form
      ref={ref}
      action={action}
      method="get"
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
      onChange={(e) => {
        if ((e.target as HTMLElement).hasAttribute("data-autosubmit")) go();
      }}
    >
      {children}
    </form>
  );
}
