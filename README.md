# Cardly — Small Cards. Big Moments.

An Australian online shop for printable greeting cards, personalised cards, virtual cards and other
digital downloads. Customers browse, personalise the inside of eligible cards with a live preview,
pay with Stripe (guest checkout, AUD) and download their files instantly. The owner runs everything —
products, prices, categories, card templates, discounts, homepage, pages and orders — from a private
admin dashboard, without touching code.

> **Status:** feature-complete for a first launch, tested locally with the simulated payment provider
> and Stripe-signed test webhooks. It has **not yet been run against live Stripe, a real SMTP provider
> or S3 storage** — see [Before accepting real payments](#before-accepting-real-payments).

---

## Contents

1. [What's included](#whats-included)
2. [Technology & why](#technology--why)
3. [Run it locally](#run-it-locally)
4. [External accounts & keys you need](#external-accounts--keys-you-need)
5. [Deploying](#deploying)
6. [Running the store (admin guide)](#running-the-store-admin-guide)
7. [How personalised cards & PDFs work](#how-personalised-cards--pdfs-work)
8. [Security model](#security-model)
9. [Testing](#testing)
10. [Before accepting real payments](#before-accepting-real-payments)

---

## What's included

**Storefront** — homepage (hero, benefits, Shop by Occasion, best-loved designs, seasonal collection,
More Than Just Cards, How It Works, promo banner, newsletter), shop with search / filters (occasion,
type, price, personalised vs ready-made, printable vs virtual, new arrivals) / sorting / pagination,
category pages, Personalised Cards and Virtual Cards landing pages, product pages with gallery,
purchase options and structured data, cart with discount codes, guest checkout, order pages with
secure downloads, optional customer accounts with a download library, contact form, FAQs, printing
instructions and draft legal pages. Sticky navigation, mobile hamburger menu, keyboard-accessible
controls and visible focus states throughout.

**Card personalisation editor** — recipient / message / sign-off, four fonts, size, alignment and
approved colours, live preview of front / inside left / inside right / back, overflow and unsupported
character warnings (never silently cut off), reset with confirmation, full preview before purchase,
draft auto-save, editing from the cart.

**Files** — print-ready A4 PDFs that fold to A5, virtual card PNG + PDF bundles, uploaded downloads
for planners/invitations/etc., all generated or copied into private storage after payment.

**Admin** — dashboard with real sales/revenue/download charts, products (images, files, prices,
categories, template & personalisation settings), categories, orders (resend links, regenerate files,
refund sync, revoke/restore downloads), discounts, homepage content, editable pages, contact messages,
newsletter subscribers (CSV export), business/GST/download settings and integration status.

**Emails** — order confirmation (receipt or tax invoice depending on GST settings), "your download is
ready", fresh purchase links, password reset, contact notification, newsletter confirm & welcome.

**Sample content** — 27 demonstration products with generated floral artwork and mockups, 36 categories.
Every sample product is flagged **Sample** and **cannot be bought** until you replace its files and
untick “Sample / demonstration product”.

## Technology & why

| Concern | Choice | Notes |
|---|---|---|
| App | Next.js 15 (App Router) + TypeScript + Tailwind CSS | Server components & server actions keep secrets on the server. |
| Database | PostgreSQL via Prisma | Any managed Postgres works (Supabase, Neon, RDS…). |
| Auth | Built-in (bcrypt password hashes, DB sessions in httpOnly cookies) | Simpler than adding a separate auth service; accounts are optional for customers. |
| Payments | Stripe Checkout (hosted) | Cards, Apple Pay, Google Pay; no card data touches Cardly. |
| Files | Pluggable storage: local disk or any S3-compatible bucket | Supabase Storage, Cloudflare R2, AWS S3… |
| Email | SMTP via Nodemailer | Works with Resend, Postmark, SES, Mailgun, etc. |
| PDFs / images | pdf-lib, fontkit, sharp | Text is drawn as vector glyph outlines using the same font metrics as the browser preview. |

Trade-offs: using Supabase only as Postgres + S3 storage (rather than its auth/RLS client SDK)
keeps every database call on the server behind explicit checks, and means you can switch providers
by changing environment variables. Search and sorting are done in the app, which is ideal for a
catalogue of up to a few thousand products.

## Run it locally

Requirements: Node 20+ and PostgreSQL 14+.

```bash
cp .env.example .env          # then fill in DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install
npx prisma migrate deploy     # create tables
npm run db:seed               # admin user, settings, categories, sample products (~1–2 min)
npm run dev                   # http://localhost:3000
```

Sign in to the admin at `/account/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Without `STRIPE_SECRET_KEY`, development uses a **simulated payment page** (it never works in
production) so you can try the full purchase journey. To be able to buy the sample products while
testing, set `ALLOW_DEMO_PURCHASES="true"` (only honoured with Stripe test keys or the simulator).
Without SMTP settings, emails are printed to the terminal instead of being sent.

Useful scripts: `npm test` (unit + integration tests, needs the seeded DB), `npm run lint`,
`npm run typecheck`, `npm run build`, `npx tsx scripts/generate-brand.ts` (regenerate logo/OG images).

## External accounts & keys you need

| Service | What for | Environment variables |
|---|---|---|
| **Stripe** (stripe.com/au) | Payments in AUD, Apple Pay / Google Pay, refunds | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **PostgreSQL** (e.g. Supabase, Neon) | Database | `DATABASE_URL` |
| **S3-compatible storage** (e.g. Supabase Storage, Cloudflare R2) | Private product files, generated PDFs, images | `STORAGE_DRIVER=s3`, `S3_*` |
| **Email provider with SMTP** (e.g. Resend, Postmark) | Receipts, download links, password resets | `SMTP_*`, `EMAIL_FROM` |
| **Hosting** (e.g. Vercel, Render, Railway, a VPS) | Running the site | `APP_URL`, `AUTH_SECRET` |
| Email marketing tool (optional, e.g. Mailchimp, Klaviyo) | Sending newsletters | — import the CSV from Admin → Newsletter |

All secrets live in environment variables; none are sent to the browser.

## Deploying

The simplest setup is **Vercel + Supabase**, but any Node host works.

1. **Database** — create a Postgres database and set `DATABASE_URL`. On serverless hosts use your
   provider's pooled connection string (check its Prisma guide for the recommended parameters).
2. **Storage** — create a **private** bucket and S3 access keys. For Supabase Storage:
   `S3_ENDPOINT=https://<project>.supabase.co/storage/v1/s3`, `S3_REGION=<project region>`,
   `S3_FORCE_PATH_STYLE=true` (verify the endpoint shown in Supabase → Storage → S3 settings).
   Serverless hosts **must** use `STORAGE_DRIVER=s3`.
3. **Email** — verify your sending domain with your provider (SPF/DKIM) and set the `SMTP_*` values
   and `EMAIL_FROM`.
4. **Environment** — set every variable from `.env.example` in your host. Generate `AUTH_SECRET` with
   `openssl rand -base64 48`. Set `APP_URL` to your real domain.
5. **Build & migrate** — build command `npm run build`; run `npx prisma migrate deploy` against the
   production database (once per release) and `npm run db:seed` once to create your admin account,
   settings and categories. (Seeding also creates the sample products; delete or replace them in the admin.)
6. **Stripe** —
   - Dashboard → Developers → Webhooks → add endpoint `https://YOUR-DOMAIN/api/webhooks/stripe` with
     events `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`. Copy the
     signing secret into `STRIPE_WEBHOOK_SECRET`.
   - Settings → Payment methods: enable cards, Apple Pay, Google Pay (Stripe Checkout shows wallets
     automatically where supported).
   - Settings → Branding: add the logo (`public/brand/cardly-logo.png`) and colours.
   - Settings → Emails: optionally enable Stripe's own receipts.
7. Change the admin password (Account → details) and review Admin → Settings → Integration status.

## Running the store (admin guide)

All of this is at `/admin`.

### Adding a new greeting card (personalisable)

1. **Products → Add product.** Enter the title, choose *Printable Greeting Card* (or *Virtual Card*),
   write the descriptions, set the ready-made and personalised prices (AUD), tick
   *Offer personalisation*, choose categories, set status *Published* and save.
2. On the product page that opens, scroll to **Card template & personalisation** and upload:
   - **Front cover** — PNG or JPG, A5 portrait, ideally **1748 × 2480 px** (300 dpi).
   - **Inside right background** (optional) — same size; leave space for the message.
   - **Back cover** (optional) — otherwise a small Cardly logo is printed.
3. Adjust the **editable text area** (points on the A5 panel, measured from the top-left) while watching
   the live preview with a sample message, pick the allowed fonts, default/min/max size, allowed text
   colours (hex) and alignment, and an optional pre-printed message for the ready-made version. Save.
4. Add gallery **images** (front, inside, lifestyle mockups) with alt text. The front artwork is added
   automatically if there is no front image.
5. Open the product in the shop, try the personaliser, and buy it once in Stripe test mode to check the PDF.

### Adding other downloads (planners, wall art, invitations…)

Create the product with the matching type and a ready-made price, then upload the deliverable under
**Downloadable files** (PDF, PNG, JPG or ZIP, up to 50 MB each) and add preview images.

### Replacing a sample product

Open it, upload your real artwork/files, then untick **Sample / demonstration product**. Sample
products are visible but can't be bought in live mode.

### Everything else

- **Prices** — on each product (ready-made and personalised separately).
- **Categories** — create, rename, reorder, hide, delete, choose homepage tiles and tile images.
- **Homepage** — hero text/image, announcement bar, promo banner, featured heading, seasonal
  collection. Featured products are chosen with the *Featured* checkbox on each product.
- **Discounts** — percentage or fixed amount, minimum spend, start/expiry dates, usage limits and
  category restrictions.
- **Orders** — status, items, personalisation, download counts; email a fresh download link,
  regenerate files, sync refunds (issue refunds in Stripe), revoke/restore access.
- **Pages** — edit About, FAQs, printing instructions and the legal drafts (simple Markdown).
- **Settings** — business name, ABN, support email, **GST mode** (not registered / prices include
  GST / GST added at checkout), social links, download link lifetime and optional download limits.

## How personalised cards & PDFs work

- The editor lays out text with the actual font files (via fontkit) using exactly the same code that
  generates the PDF, so line breaks in the preview match the printed file. Messages that overflow the
  text area, or contain characters the font can't print (such as emoji), must be fixed before adding
  to the cart; the server re-validates everything.
- Printable card PDF: **A4 landscape, 2 pages** — page 1 outside (back left, front right), page 2
  inside (blank left, message right). Print at *Actual size*, double-sided, **flip on short edge**,
  fold to A5. Text is embedded as vector outlines (crisp at any resolution, no font issues).
- Virtual cards: front PNG (1080 × 1528 px), message PNG and a two-page digital PDF. Customers share
  them themselves — Cardly does not send cards. The file structure leaves room to add animated cards
  or scheduled delivery later.
- Files are generated only after Stripe confirms payment, stored privately under `private/orders/…`,
  and named like `Cardly-Happy-Birthday-Blooms-Personalised.pdf`.

## Security model

- Orders are marked paid only from a **verified** Stripe webhook (signature checked) or a server-side
  retrieval of the Checkout Session; the amount and currency must match the order. Processing is
  **idempotent** (event log + conditional status updates), so duplicate webhooks never create duplicate
  payments, files or emails.
- Paid files are never public. Download URLs are **short-lived HMAC-signed links** minted only after a
  server-side access check (account owner, signed guest link from the email, or the browser that
  placed the order). Refunded orders and revoked files can't be downloaded; optional per-file limits.
- Guest links expire (default 30 days); customers can request fresh links at `/orders/lookup` without
  revealing whether an email has orders.
- Passwords are bcrypt-hashed; sessions are random tokens stored hashed; login, contact, newsletter and
  lookup forms are rate-limited. Admin pages and every admin action check the admin role on the server.
- Accounts only show orders explicitly linked to them (guest orders can be claimed from the emailed link),
  so registering with someone else's email reveals nothing.

## Testing

`npm test` runs 33 automated tests:

- pricing, discounts (percentage/fixed/category/minimum spend) and all three GST modes;
- personalisation validation, text cleaning, wrapping, paragraphs, long words, overflow detection,
  emoji/unsupported characters, accents, alignment and blank cards;
- PDF/PNG generation (page size, two pages, overflow refusal, virtual card images);
- Stripe webhook signature rejection, payment → files → entitlements, **duplicate event idempotency**,
  amount mismatch, refunds, expired checkouts;
- download security: valid links, expired and tampered signatures, download limits, refunded orders,
  guest link expiry.

The full customer journey (browse → personalise → preview → cart → checkout → pay → download) for a
personalised printable card, a ready-made download and a personalised virtual card was exercised in a
real browser against the simulated payment provider, including downloading every file, and the PDFs
were rendered and inspected in all four fonts.

**Not yet tested** (needs your accounts): live Stripe test-mode checkout end to end (hosted page,
Apple Pay/Google Pay, real webhooks via `stripe listen`), real email delivery, S3 storage, and printing
on a physical printer.

## Before accepting real payments

- [ ] Run one full purchase in **Stripe test mode** (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`),
      including a failed card (`4000 0000 0000 0002`) and a refund.
- [ ] Configure SMTP and confirm order, download and password-reset emails arrive (check spam).
- [ ] Switch to S3-compatible storage for any serverless deployment and confirm uploads/downloads work.
- [ ] Print a card on your printer and confirm orientation, double-sided alignment and fold.
- [ ] Set business name, ABN (if any), support email and the correct **GST mode** in Admin → Settings
      (get advice if unsure whether you must register for GST).
- [ ] Have the draft Privacy Policy, Terms, Refund Policy, Licence and Cookie Policy reviewed by a
      qualified professional, fill in the [placeholders], and untick *draft* in Admin → Pages.
- [ ] Replace or delete every sample product; make sure `ALLOW_DEMO_PURCHASES` is not set.
- [ ] Use live Stripe keys and a live webhook secret; change the admin password.
