import Link from "next/link";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email/send";
import { newsletterWelcomeEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";
export const metadata = { title: "Subscription confirmed", robots: { index: false } };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const sub = token ? await prisma.newsletterSubscriber.findUnique({ where: { token } }) : null;
  let ok = false;
  if (sub && sub.status !== "UNSUBSCRIBED") {
    ok = true;
    if (sub.status === "PENDING") {
      await prisma.newsletterSubscriber.update({ where: { id: sub.id }, data: { status: "SUBSCRIBED", confirmedAt: new Date() } });
      await sendEmail({ to: sub.email, ...newsletterWelcomeEmail(`${env.appUrl}/newsletter/unsubscribe?token=${sub.token}`), template: "newsletter-welcome" });
    }
  }
  return (
    <div className="container-page max-w-xl py-20 text-center">
      <h1 className="text-5xl">{ok ? "You're subscribed" : "That link isn't valid"}</h1>
      <p className="mt-4 text-charcoal-soft">
        {ok ? "Thank you for joining the Cardly list. Watch your inbox for new designs and special offers." : "The confirmation link may be incomplete or already used to unsubscribe. You can sign up again from the homepage."}
      </p>
      <Link href="/shop" className="btn-primary mt-8">Browse the shop</Link>
    </div>
  );
}
