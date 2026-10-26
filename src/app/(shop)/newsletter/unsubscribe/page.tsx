import { prisma } from "@/lib/db";
import { unsubscribeNewsletter } from "@/app/actions/newsletter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Unsubscribe", robots: { index: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const { token, done } = await searchParams;
  const sub = token ? await prisma.newsletterSubscriber.findUnique({ where: { token } }) : null;
  return (
    <div className="container-page max-w-xl py-20 text-center">
      {done ? (
        <>
          <h1 className="text-5xl">You&apos;ve been unsubscribed</h1>
          <p className="mt-4 text-charcoal-soft">You won&apos;t receive any more marketing emails from Cardly. Order emails will still be sent when you make a purchase.</p>
        </>
      ) : sub ? (
        <>
          <h1 className="text-5xl">Unsubscribe?</h1>
          <p className="mt-4 text-charcoal-soft">Stop receiving Cardly newsletters at <strong>{sub.email}</strong>.</p>
          <form action={unsubscribeNewsletter} className="mt-8">
            <input type="hidden" name="token" value={sub.token} />
            <button type="submit" className="btn-primary">Unsubscribe me</button>
          </form>
        </>
      ) : (
        <>
          <h1 className="text-5xl">Link not recognised</h1>
          <p className="mt-4 text-charcoal-soft">Please use the unsubscribe link from one of our emails, or contact us and we&apos;ll remove you.</p>
        </>
      )}
    </div>
  );
}
