export type PageSlug =
  | "about"
  | "how-it-works"
  | "printing-instructions"
  | "faqs"
  | "privacy"
  | "terms"
  | "refunds"
  | "licence"
  | "cookies";

export type PageContent = {
  title: string;
  description: string;
  body: string;
  draft: boolean;
};

export const DEFAULT_PAGES: Record<PageSlug, PageContent> = {
  about: {
    title: "About Cardly",
    description:
      "Cardly is an Australian digital shop for printable greeting cards, personalised printable cards and virtual cards. Small Cards. Big Moments.",
    draft: false,
    body: `## Small Cards. Big Moments.

Cardly is an Australian creative digital shop with a simple idea: a thoughtful, beautiful card should be easy to find, easy to make your own and kind on your budget.

A card is often a small thing, but the moment it marks rarely is. A birthday, a thank you, a new baby, a wedding, a quiet "thinking of you". We design cards that help you say what matters, without a trip to the shops or a last-minute scramble.

## What we offer

Everything at Cardly is a digital download, so there is nothing to wait for in the post.

- **Printable greeting cards** – ready-made designs you download as a PDF and print at home or at a local print shop.
- **Personalised printable cards** – add a name, your own message and a sign-off inside the card, choose a font and colour, and see a live preview before you buy.
- **Virtual cards** – digital cards you download and share yourself by text message, WhatsApp, email or social media.
- **Other printables** – invitations, planners, wall art, gift tags and checklists to help you plan, organise and celebrate.

## What we believe

We believe a card doesn't need to be expensive to feel special. Good design, a warm message and a little care go a long way.

We believe in keeping things simple. You can check out as a guest, download straight away and print as many copies as you need for your own personal use.

We believe you should know exactly what you're getting. Personalised cards show a live preview of your words, and we flag anything that won't fit or can't be printed before you pay, so there are no surprises.

## Start creating

Browse the [full shop](/shop), make it personal with our [personalised cards](/personalised-cards), or send something special in seconds with a [virtual card](/virtual-cards).

New to printables? Our guide on [how it works](/how-it-works) walks you through every step, and our [printing instructions](/printing-instructions) will help you get a lovely result at home. If you have a question, we'd love to hear from you via our [contact page](/contact).`,
  },

  "how-it-works": {
    title: "How It Works",
    description:
      "How Cardly works: choose a design, personalise it, pay securely and download instantly. Then print your card at home or share a digital greeting card.",
    draft: false,
    body: `Getting the perfect card takes just a few minutes. Here's how it works, from choosing a design to handing it over.

## 1. Choose

Browse the [shop](/shop) or explore by [category](/categories) to find a design for the occasion. Each product page tells you whether the item is a printable card, a personalised card, a virtual card or another printable.

## 2. Personalise

For [personalised cards](/personalised-cards), type the recipient's name, your message and a sign-off for the inside of the card. Choose from four fonts (Elegant Script, Classic Serif, Modern Sans Serif or Handwritten Style), then set the text size, alignment and colour. A live preview shows exactly how it will look. The front artwork stays the same; only the inside is personalised.

If a message is too long to fit, or includes characters the font can't print (such as emoji), we'll let you know before you buy. Nothing is silently cut off.

## 3. Purchase & Download

Check out securely through Stripe using a card, or Apple Pay or Google Pay where available. You can check out as a guest; an [account](/account) is optional.

As soon as your payment is complete, you can download your files from the order confirmation page. We'll also email you a secure, personal download link.

## 4. Print or Send

Print your card at home or at a local print shop using our [printing instructions](/printing-instructions), or share your virtual card by text message, WhatsApp, email or social media.

## Ready-made or personalised?

**Ready-made cards** are designed and ready to go. Download, print and write your own message by hand.

**Personalised cards** are made to order from the text you enter, so please check spelling and names carefully in the preview before you buy.

## Printable or virtual?

**Printable cards** come as an A4 PDF that folds in half into an A5 card. **Virtual cards** are never printed or sent by us: you download image and PDF files and share them yourself, wherever your people are.

## Getting your downloads again

Download links expire after a period (usually 30 days). You can request a fresh link any time from [order lookup](/orders/lookup) using the email address you ordered with. If you have an account, all your past downloads are waiting in your [account](/account).`,
  },

  "printing-instructions": {
    title: "Printing Instructions",
    description:
      "Step-by-step help printing your Cardly printable cards at home or at a print shop, including paper, double-sided settings, folding and envelope sizes.",
    draft: false,
    body: `Printing your card at home is easy once you know a few settings. This guide covers printable greeting cards, personalised cards and our other printables.

## What's in your card PDF

Each printable greeting card is a single **A4 landscape PDF with 2 pages**:

- **Page 1 – Outside:** the back cover is on the left half and the front cover is on the right half.
- **Page 2 – Inside:** the inside left is blank, and your message or inside design is on the right half.

Once printed and folded in half, it becomes an **A5 card (148 × 210 mm)**.

## Choosing your paper

For a card that feels sturdy and special, we recommend **A4 card stock around 200–300 gsm**, in a matte or lightly textured finish.

- Check your printer's maximum paper weight before you start. Many home inkjet printers handle around 200–250 gsm, but this varies by model.
- If your printer can't take heavier card, a local print shop or office supplies store can print onto heavier stock for you.
- Do a quick test on plain paper first to check colours and layout.

## Printer settings

Whatever program you use to open the PDF, check these settings in the print dialogue:

- **Scale:** choose "Actual size" or 100%. Don't use "Fit to page" or "Shrink to fit", as this changes the size and can move the fold.
- **Paper size:** A4.
- **Orientation:** landscape.
- **Double-sided:** on, set to **"Flip on short edge"**.
- **Paper type:** choose card stock or heavy paper if your printer offers it, for better ink results.

## Printing double-sided

If your printer prints double-sided automatically, simply print both pages with the settings above. Page 1 prints on one side and page 2 on the back.

## If your printer can't print double-sided

You can still print a lovely card by feeding the same sheet through twice:

1. Do a test run on plain paper first. Mark the top edge of the sheet with a pencil before you print.
2. Print **page 1 only**.
3. Take the printed sheet and put it back in the paper tray. Which way it goes depends on your printer, so use your marked test sheet to work out the right orientation.
4. Print **page 2 only** on the other side.
5. Check that the inside message sits behind the front cover. Once your test sheet is right, repeat with your card stock.

## Scoring and folding

A clean fold makes all the difference, especially on heavier card.

1. Place the printed sheet outside-up on a flat surface.
2. Line up a ruler along the centre fold line, halfway across the long edge.
3. Run a blunt edge along the ruler to score the line, such as the back of a butter knife or an empty ballpoint pen.
4. Fold along the scored line so the front cover faces out, then press the fold flat with the side of the ruler.

## Trimming white borders

Most home printers can't print right to the edge of the page, so you may see a small white border. That's perfectly fine, but if you'd like a neater finish, trim the edges with a paper trimmer or a ruler and craft knife. Trim the **same amount from every edge** so the fold stays centred.

## Envelopes

A **C5 envelope** fits an A5 card. You'll find them at newsagents, post offices and office supplies stores.

## Printing at a print shop

If you'd rather not print at home, take your PDF to a local print shop or office supplies store. Ask them to print it at **actual size (100%)**, **double-sided, flipping on the short edge**, on your choice of card stock. Many can also trim and score for you.

## Other printables

Planners, wall art, checklists and gift tags come as single **A4 or A5 PDFs**.

- Print at "Actual size" or 100%, on the paper size shown on the product page.
- Wall art looks lovely on heavier matte paper or card.
- Gift tags are printed on a sheet; cut them out along the guides and add a hole and ribbon if you like.

## Virtual cards

Virtual cards aren't designed for printing. You'll download image files and a digital PDF to share by text message, WhatsApp, email or social media. See [how it works](/how-it-works) for more.

## Still need help?

Take a look at our [FAQs](/faqs), or [get in touch](/contact) with your order number and we'll be happy to help.`,
  },

  faqs: {
    title: "Frequently Asked Questions",
    description:
      "Answers about instant download greeting cards, personalised printable cards, printing, virtual cards, payments, download links and help with your order.",
    draft: false,
    body: `Here are answers to the questions we're asked most often. Can't find what you need? [Contact us](/contact) and we'll be glad to help.

## Ordering and downloads

### How do downloads work?

Once your payment is complete, you can download your files straight away from the order confirmation page. We also email you a secure, personal download link. Links expire after a period (usually 30 days), but you can request a fresh one at any time.

### Will anything be physically shipped?

No. Everything at Cardly is a digital download. Nothing is ever posted or shipped, so there are no delivery fees and no waiting.

### Do I need an account?

No, you can check out as a guest. An [account](/account) is optional, but it's handy: you can see all your past downloads in one place.

### Which payment methods are accepted?

Checkout is handled securely by Stripe. You can pay by card, and with Apple Pay or Google Pay where available. Cardly never sees or stores your card number.

### Are prices in AUD?

Yes, all prices are in Australian dollars (AUD).

### What happens if I lose my download?

No problem. Visit [order lookup](/orders/lookup), enter the email address you ordered with and we'll send you a fresh download link. If you have an account, you'll also find all your past downloads in your [account](/account).

## Personalised cards

### Can I personalise my card?

Yes. On our [personalised cards](/personalised-cards), you can add the recipient's name, your message and a sign-off to the inside of the card. Choose from four fonts (Elegant Script, Classic Serif, Modern Sans Serif or Handwritten Style), and set the text size, alignment and colour. A live preview shows how it will look. The front artwork stays the same.

If your message doesn't fit, or includes characters the font can't print (such as emoji), we'll flag it before you buy, so nothing is silently cut off. Because personalised cards are made to order from your text, please check spelling and names carefully in the preview.

### What does the personalised PDF look like?

It's the same format as our other printable cards: an A4 landscape PDF with two pages. Page 1 is the outside (front and back covers) and page 2 is the inside, with your personalised message on the right half. It folds into an A5 card.

## Printing

### What paper should I use?

We recommend A4 card stock around 200–300 gsm, in a matte or lightly textured finish. Check your printer's maximum paper weight first; many home inkjets handle around 200–250 gsm. For heavier stock, a local print shop or office supplies store can help.

### How do I print a folded card?

Print at "Actual size" or 100% (not "Fit to page"), double-sided, with "Flip on short edge" selected. Then score the centre line with a ruler and a blunt edge, and fold in half to make an A5 card. If your printer can't print double-sided, print page 1, put the same sheet back in the tray and print page 2. Our [printing instructions](/printing-instructions) cover every step, including how to test the orientation on plain paper first.

### What size envelope do I need?

A C5 envelope fits our A5 folded cards.

## Virtual cards

### Can I send a virtual card?

Yes, you share it yourself. With a [virtual card](/virtual-cards), you download a PNG of the card front, a PNG message page and a two-page digital PDF. You can then send them by text message, WhatsApp, email or social media. Cardly doesn't send virtual cards on your behalf, so you're in control of when and how it arrives.

## Using our designs

### Can I use the designs commercially?

Our designs are for personal, non-commercial use only. You can print as many copies as you need for your own personal use, but you can't resell, share or redistribute the files, or sell printed cards, without our written permission. See our [Personal Use Licence](/licence) for details.

## Help with your order

### What if I have a problem with my order?

We're here to help. If a file won't download or open, looks wrong, or a personalised card doesn't match the preview you approved, please [contact us](/contact) with your order number and a short description of the problem. Our [Refund Policy](/refunds) explains your options, including your rights under the Australian Consumer Law.`,
  },

  privacy: {
    title: "Privacy Policy",
    description:
      "How Cardly collects, uses and protects your personal information when you buy printable cards, personalised printable cards and digital greeting cards.",
    draft: true,
    body: `*This is a draft for review. Please have it checked by a qualified professional before launch.*

**Effective date:** [Effective date]

This Privacy Policy explains how [Business legal name] (ABN [ABN]), trading as Cardly ("Cardly", "we", "us" or "our"), collects, uses, stores and discloses personal information when you use our website and buy our digital products.

We aim to handle personal information in a fair and transparent way. Depending on our circumstances, the Australian Privacy Principles in the *Privacy Act 1988* (Cth) may apply to us.

## Information we collect

We only collect the information we need to run the shop and look after your orders. This may include:

- **Email address** – so we can process your order, send receipts and email your download links.
- **Account details (optional)** – if you create an account, your name, email address and password. Passwords are stored in hashed form, never as plain text.
- **Order details** – the products you bought, prices, order dates and order numbers.
- **Personalisation text** – the names, messages and sign-offs you enter into personalised cards, along with your chosen font, size, alignment and colour, so we can create your file.
- **Contact form messages** – your name, email address and anything you include in your message.
- **Newsletter subscriptions** – your email address and a record of your consent.
- **Technical information** – essential cookies and basic information needed to keep the website working and secure. See our [Cookie Policy](/cookies).

## Payment information

Payments are processed by Stripe on its secure hosted checkout. We never see or store your full card number. Stripe handles your payment information under its own privacy policy, and we receive only limited details, such as confirmation that payment was successful.

## How we use your information

We use personal information to:

- process your orders and deliver your downloads;
- send receipts, download links and order-related messages;
- create personalised files from the text you enter;
- manage your account, if you choose to create one;
- respond to your questions and requests for help;
- send our newsletter, if you've subscribed;
- keep our website secure and prevent fraud; and
- meet our legal and tax obligations.

## Newsletter

We only send marketing emails if you've asked to receive them. We use a double opt-in, which means you'll confirm your subscription by email, and we keep a record of your consent. Every newsletter includes a way to unsubscribe, and you can unsubscribe at any time. We aim to handle marketing emails in line with the *Spam Act 2003* (Cth).

## Who we share information with

We don't sell your personal information. We share it only with service providers who help us run the shop, and only as needed for them to provide their services. These include:

- our payment processor (Stripe);
- our email delivery provider; and
- our website hosting, database and file storage providers.

Some of these providers may store or process information outside Australia. We take reasonable steps to choose providers that protect personal information appropriately. We may also disclose information if required or authorised by law.

## How we store and protect information

We take reasonable steps to protect personal information from misuse, loss and unauthorised access, modification or disclosure. Download links are secure and personal to your order, and they expire after a period. No method of transmitting or storing data is completely secure, so we can't guarantee absolute security.

We keep personal information only for as long as we need it for the purposes described in this policy, or as required by law, such as for tax records.

## Access and correction

You can ask to access the personal information we hold about you, or ask us to correct it. If you have an account, you can update some details yourself. For anything else, please [contact us](/contact). We may need to confirm your identity before acting on a request.

## Complaints

If you have a concern about how we've handled your personal information, please [contact us](/contact) or email [contact email]. We'll look into it and respond within a reasonable time. If you're not satisfied with our response and the Privacy Act applies, you may be able to contact the Office of the Australian Information Commissioner (OAIC).

## Changes to this policy

We may update this Privacy Policy from time to time. The latest version will always be on this page, with the effective date shown at the top.

## Contact us

- Business name: [Business legal name]
- ABN: [ABN]
- Email: [contact email]

You can also reach us via our [contact page](/contact).`,
  },

  terms: {
    title: "Terms & Conditions",
    description:
      "The terms for buying and using Cardly digital products, including printable birthday cards in Australia, personalised printable cards and virtual cards.",
    draft: true,
    body: `*This is a draft for review. Please have it checked by a qualified professional before launch.*

**Effective date:** [Effective date]

## 1. About us

This website is operated by [Business legal name] (ABN [ABN]), trading as Cardly ("Cardly", "we", "us" or "our"). You can contact us at [contact email] or via our [contact page](/contact).

By using this website or buying from us, you agree to these Terms & Conditions. Please read them carefully.

## 2. Our products

Cardly sells digital products only, including printable greeting cards, personalised printable cards, virtual cards and other printable downloads such as invitations, planners, wall art, gift tags and checklists.

All products are delivered as downloadable files. **Nothing is physically shipped.** Colours may look slightly different on screen and when printed, depending on your device, printer, ink and paper.

## 3. Accounts

You can buy as a guest; an account is optional. If you create an account, you're responsible for keeping your password secure and for activity on your account. Please let us know promptly if you think your account has been used without your permission.

## 4. Prices and GST

All prices are in Australian dollars (AUD). GST is shown according to our GST registration status: [describe GST status, e.g. "prices include GST" or "we are not registered for GST"]. We may change prices at any time, but changes won't affect orders you've already paid for.

## 5. Payment

Payments are processed securely by Stripe on its hosted checkout. You can pay by card, and with Apple Pay or Google Pay where available. We don't see or store your full card number. Your order is confirmed once payment is successful.

## 6. Delivery by download

After payment, you can download your files straight away from the order confirmation page. We'll also email a secure, personal download link to the email address you provide. Download links expire after a period (usually 30 days). You can request a fresh link at any time via [order lookup](/orders/lookup), and account holders can access past downloads in their [account](/account).

Please make sure your email address is correct when you check out.

## 7. Personalised content

When you personalise a card, you're responsible for the text you enter, including names, messages and sign-offs. Please check spelling and details carefully in the live preview before you buy, as personalised files are made to order from your text.

You must not submit content that is unlawful, offensive, defamatory, threatening, discriminatory or that infringes anyone else's rights. We may refuse or cancel an order, and refund you, if we reasonably believe personalised content breaches these terms.

We'll flag messages that don't fit and characters the chosen font can't print before you buy, so nothing is silently cut off.

## 8. Licence to use our designs

When you buy a product, you receive a personal, non-commercial licence to use it, as set out in our [Personal Use Licence](/licence). In short, you can print as many copies as you need for your own personal use, but you can't resell, share, redistribute or upload the files, claim the designs as your own, or use them commercially without our written permission.

## 9. Intellectual property

All designs, artwork, text, graphics and other content on this website are owned by or licensed to Cardly and are protected by intellectual property laws. Apart from the licence described above, buying a product doesn't transfer any ownership or intellectual property rights to you.

## 10. Your rights under the Australian Consumer Law

Our products come with guarantees that cannot be excluded under the Australian Consumer Law. **Nothing in these terms excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law** or any other law that cannot be excluded.

If a product is faulty, not as described, won't download or open, or a personalised file doesn't match the preview you approved, you're entitled to a remedy, such as a replacement file, a fix or a refund, as appropriate. See our [Refund Policy](/refunds) for how to ask for help.

## 11. Limitation of liability

To the extent permitted by law, and subject to section 10, we are not liable for any indirect or consequential loss arising from your use of our website or products. Where our liability can be limited by law, it is limited to supplying the product again or refunding the price you paid for it.

## 12. Website use

Please don't misuse our website, including by attempting to gain unauthorised access, interfering with its operation or using automated tools to copy its content. We may suspend access where we reasonably believe these terms have been breached.

## 13. Privacy

Our [Privacy Policy](/privacy) explains how we handle your personal information, and our [Cookie Policy](/cookies) explains the cookies we use.

## 14. Governing law

These terms are governed by the laws of [State/Territory], Australia. You and we submit to the non-exclusive jurisdiction of the courts of [State/Territory].

## 15. Changes to these terms

We may update these terms from time to time. The version on this page at the time you place an order applies to that order. The effective date at the top shows when they were last updated.`,
  },

  refunds: {
    title: "Refund Policy",
    description:
      "Cardly's refund policy for instant download greeting cards and printables, and how to get help if a file is faulty, won't open or isn't as described.",
    draft: true,
    body: `*This is a draft for review. Please have it checked by a qualified professional before launch.*

**Effective date:** [Effective date]

We want you to love your Cardly download. This policy explains what happens if something isn't right, and how to get help.

## Your rights under the Australian Consumer Law

Our products come with guarantees that cannot be excluded under the Australian Consumer Law. **Nothing in this policy excludes, restricts or modifies any right or remedy you have under the Australian Consumer Law.**

## When you're entitled to a remedy

If there's a problem with your order, you're entitled to a remedy, such as a replacement file, a fix or a refund, as appropriate. This includes when:

- a file is faulty, damaged or incomplete;
- a product is not as described on our website;
- a file won't download or open, and we can't resolve the issue; or
- a personalised file doesn't match the preview you approved before purchase.

Often the quickest fix is a corrected or replacement file, and we'll work with you to find the right remedy.

## Change of mind

Because our products are digital and delivered instantly, we generally don't offer refunds if you simply change your mind, for example if you chose the wrong design or no longer need the card. This doesn't affect your rights under the Australian Consumer Law described above.

## Personalised cards

Personalised cards are made to order from the text you enter, so please check names, spelling and wording carefully in the live preview before you buy. We flag messages that don't fit and characters the font can't print before purchase, so nothing is silently cut off.

If your file doesn't match the preview you approved, please let us know and we'll put it right. If you've made a typo yourself, get in touch anyway and we'll see what we can do.

## Printing results

Colours can look different on screen and in print, and results depend on your printer, ink, paper and settings. Before contacting us, it may help to check our [printing instructions](/printing-instructions), especially the "Actual size" and "Flip on short edge" settings. If you still think there's a problem with the file itself, we're happy to take a look.

## Lost or expired download links

This isn't a reason to worry. You can request a fresh download link any time at [order lookup](/orders/lookup), or find your past downloads in your [account](/account) if you have one.

## How to ask for help

1. [Contact us](/contact) or email [contact email].
2. Include your order number and the email address you used to order.
3. Briefly describe the problem. A screenshot or photo can help.

We'll aim to reply as soon as we can and let you know how we'll fix it.

## How refunds are paid

If a refund is appropriate, we'll refund the amount to your original payment method through Stripe. The time it takes to appear in your account depends on your bank or card provider.`,
  },

  licence: {
    title: "Personal Use Licence",
    description:
      "What you can and can't do with Cardly printable cards and digital downloads: print copies for personal use, with no reselling, sharing or commercial use.",
    draft: true,
    body: `*This is a draft for review. Please have it checked by a qualified professional before launch.*

**Effective date:** [Effective date]

Every Cardly design is created with care. When you buy a product, you receive a licence to use it for your own personal, non-commercial purposes. This page explains what that means.

## What you can do

- Print as many copies as you need for your own personal use.
- Give printed cards, invitations, gift tags and other printables to friends, family and loved ones.
- Share your virtual card files with the people you're sending them to, by text message, WhatsApp, email or social media.
- Display wall art and use planners and checklists in your own home or for your own personal organising.
- Print your files at a local print shop or office supplies store for your own personal use.

## What you can't do

- Resell the files, or sell printed copies of our designs.
- Share, distribute or give away the digital files themselves, for example by forwarding the PDF to others so they can print their own copies.
- Upload the files to other websites, marketplaces, file-sharing services or shared drives.
- Claim our designs as your own, or remove any copyright notices.
- Modify our designs and then share, sell or distribute them.
- Use our designs for any commercial purpose, such as selling printed cards, using them in products for sale or in business marketing, without our written permission.

## Virtual cards

Virtual cards are made to be shared, so sending your virtual card to its recipient is absolutely fine. Please don't post the files in a way that invites others to download and reuse them as their own cards.

## Personalised cards

The text you add to a personalised card is yours. The card design and artwork remain ours, and this licence applies to the finished file in the same way as to our other products.

## Ownership

All designs, artwork and content remain the intellectual property of [Business legal name], trading as Cardly. Buying a product gives you a licence to use it as described on this page; it doesn't transfer ownership or copyright.

## Commercial use

If you'd like to use our designs for a business, event, school, community group or any other purpose not covered here, please [contact us](/contact) to ask first. Commercial use is only allowed with our written permission.

## Questions

Not sure whether something is allowed? Please [get in touch](/contact) or email [contact email], and we'll be happy to help. See also our [Terms & Conditions](/terms).`,
  },

  cookies: {
    title: "Cookie Policy",
    description:
      "Cardly uses only essential cookies for sign-in, your shopping cart and viewing your order. No advertising or tracking cookies are used by default.",
    draft: true,
    body: `*This is a draft for review. Please have it checked by a qualified professional before launch.*

**Effective date:** [Effective date]

This Cookie Policy explains how Cardly uses cookies on our website.

## What are cookies?

Cookies are small text files that a website stores in your browser. They help the website remember information between pages or visits, such as whether you're signed in or what's in your cart.

## The cookies we use

We use only **essential cookies**, which are needed for the website to work properly:

- **Sign-in session cookie** – keeps you signed in to your account as you move around the site, if you choose to create an account.
- **Shopping cart cookie** – remembers the items in your cart.
- **Order access cookie** – a short-lived cookie that lets the browser that placed an order view that order and its downloads.

These cookies don't track you across other websites and aren't used for advertising.

## No advertising or tracking cookies

By default, we don't use advertising cookies or analytics and tracking cookies. If this changes in the future, we'll update this policy and ask for your consent where required.

## Stripe checkout

When you pay, you're taken to Stripe's secure hosted checkout. Stripe may set its own cookies on its checkout pages, for example to help prevent fraud. These cookies are controlled by Stripe and covered by Stripe's own privacy and cookie policies.

## Managing cookies

You can block or delete cookies in your browser settings. Because we only use essential cookies, blocking them may stop parts of the website from working, such as signing in, keeping items in your cart or viewing your order after checkout.

## More information

For more about how we handle personal information, see our [Privacy Policy](/privacy). If you have any questions, please [contact us](/contact) or email [contact email].`,
  },
};
