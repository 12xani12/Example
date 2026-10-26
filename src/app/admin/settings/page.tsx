import { requireAdmin } from "@/lib/auth";
import { env, stripeIsTestMode } from "@/lib/env";
import { getBusinessSettings, getDownloadSettings } from "@/lib/settings";
import { AdminHeader, Badge, Field, Notice, Panel } from "../ui";
import { saveBusinessSettings, saveDownloadSettings } from "../actions/settings";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

const GST_OPTIONS = [
  { value: "NOT_REGISTERED", label: "Not registered for GST — no GST charged, customers get a receipt" },
  { value: "INCLUSIVE", label: "Registered — listed prices include GST; tax invoices show the GST component" },
  { value: "EXCLUSIVE", label: "Registered — GST is added at checkout" },
] as const;

function Status({ ok, children }: { ok: boolean; children?: React.ReactNode }) {
  return <span className="flex flex-wrap items-center justify-end gap-1.5"><Badge tone={ok ? "good" : "warn"}>{ok ? "Configured" : "Not configured"}</Badge>{children}</span>;
}

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdmin();
  const sp = await searchParams;
  const [business, downloads] = await Promise.all([getBusinessSettings(), getDownloadSettings()]);
  // Only ever show whether secrets are set, never their values.
  const integrations = [
    { name: "Stripe secret key", envName: "STRIPE_SECRET_KEY", status: <Status ok={!!env.stripeSecretKey}>{env.stripeSecretKey && <Badge tone={stripeIsTestMode() ? "warn" : "good"}>{stripeIsTestMode() ? "Test mode" : "Live mode"}</Badge>}</Status> },
    { name: "Stripe webhook secret", envName: "STRIPE_WEBHOOK_SECRET", status: <Status ok={!!env.stripeWebhookSecret} /> },
    { name: "Email (SMTP)", envName: "SMTP_HOST", status: <Status ok={!!env.smtp.host} /> },
    { name: "File storage", envName: "STORAGE_DRIVER", status: <Badge>{env.storageDriver}</Badge> },
    { name: "Site address", envName: "APP_URL", status: <span className="break-all text-sm">{env.appUrl}</span> },
    { name: "Demo purchases", envName: "ALLOW_DEMO_PURCHASES", status: <Badge tone={env.allowDemoPurchases ? "warn" : "neutral"}>{env.allowDemoPurchases ? "Allowed" : "Off"}</Badge> },
  ];

  return (
    <>
      <AdminHeader title="Settings" intro="Business details, tax and download rules." />
      {sp.saved && <Notice>Saved.</Notice>}
      {sp.error && <Notice tone="blush">{sp.error}</Notice>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div id="business">
            <Panel title="Business & tax">
              <form action={saveBusinessSettings} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Business name" name="businessName" required maxLength={120} defaultValue={business.businessName} hint="Shown on receipts and tax invoices." />
                  <Field label="ABN (optional)" name="abn" inputMode="numeric" pattern="[0-9 ]*" defaultValue={business.abn} hint="11 digits; spaces are fine." />
                </div>
                <Field label="Support email" name="supportEmail" type="email" required defaultValue={business.supportEmail} hint="Contact form messages are sent to this address." />
                <div>
                  <label htmlFor="gstMode" className="label">GST</label>
                  <select id="gstMode" name="gstMode" defaultValue={business.gstMode} className="input py-2.5">
                    {GST_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <p className="mt-1 text-xs text-charcoal-muted">Changes apply to new orders only; past receipts keep the settings they were placed with. Check with your accountant if you&apos;re unsure.</p>
                </div>
                <Field label="GST rate (%)" name="gstRatePercent" type="number" min={0} max={50} step="0.1" required defaultValue={business.gstRatePercent} hint="Ignored when not registered for GST." />
                <fieldset className="grid gap-4 sm:grid-cols-3">
                  <legend className="label">Social media links (optional)</legend>
                  <Field label="Instagram" name="instagramUrl" type="url" placeholder="https://" defaultValue={business.instagramUrl} />
                  <Field label="Pinterest" name="pinterestUrl" type="url" placeholder="https://" defaultValue={business.pinterestUrl} />
                  <Field label="Facebook" name="facebookUrl" type="url" placeholder="https://" defaultValue={business.facebookUrl} />
                </fieldset>
                <div><button type="submit" className="btn-primary btn-sm">Save business settings</button></div>
              </form>
            </Panel>
          </div>

          <div id="downloads">
            <Panel title="Downloads">
              <form action={saveDownloadSettings} className="grid gap-4 sm:grid-cols-2">
                <Field label="Download links valid for (days)" name="accessLinkDays" type="number" min={1} max={365} step={1} required defaultValue={downloads.accessLinkDays} hint="How long the download link emailed to customers keeps working (1–365)." />
                <Field label="Maximum downloads per file" name="maxDownloadsPerFile" type="number" min={0} max={1000} step={1} required defaultValue={downloads.maxDownloadsPerFile} hint="0 = unlimited. Applies to new orders only." />
                <div className="sm:col-span-2"><button type="submit" className="btn-primary btn-sm">Save download settings</button></div>
              </form>
            </Panel>
          </div>
        </div>

        <Panel title="Integrations status" className="self-start">
          <p className="mb-4 text-sm text-charcoal-soft">These are set as environment variables on the server, not here. Secret values are never shown.</p>
          <dl className="divide-y divide-charcoal/5 text-sm">
            {integrations.map((i) => (
              <div key={i.envName} className="flex items-center justify-between gap-3 py-2.5">
                <dt>{i.name}<span className="block font-mono text-xs text-charcoal-muted">{i.envName}</span></dt>
                <dd className="text-right">{i.status}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}
