// Sample catalogue for a fresh Cardly install. Every product is flagged as a demo.
import type { DesignId, DownloadDesign } from "../src/lib/art/designs";
import type { MockupTone } from "../src/lib/art/mockups";

type Group = "GREETING_CARDS" | "VIRTUAL_CARDS" | "OTHER_DOWNLOADS";

export type SeedCategory = { name: string; slug: string; group: Group; home?: boolean; description: string; tile?: { design: DesignId | DownloadDesign; tone: MockupTone } };

const occasion = (name: string, slug: string, description: string, tile?: SeedCategory["tile"], home = false): SeedCategory => ({ name, slug, group: "GREETING_CARDS", description, tile, home });

export const CATEGORIES: SeedCategory[] = [
  occasion("Birthday Cards", "birthday-cards", "Printable and personalised birthday cards for everyone on your list — download instantly and print at home.", { design: "birthday-blooms", tone: "blush" }, true),
  occasion("Celebration Cards", "celebration-cards", "Cards for every reason to celebrate, from milestones to little wins.", { design: "confetti-celebration", tone: "peach" }, true),
  occasion("Thank You Cards", "thank-you-cards", "Say thank you beautifully with printable thank-you cards you can personalise.", { design: "thank-you", tone: "cream" }, true),
  occasion("Holiday Cards", "holiday-cards", "Printable cards for Christmas, Easter and the holidays in between.", { design: "merry-christmas", tone: "sage" }, true),
  occasion("Just Because", "just-because", "No occasion needed — thoughtful cards for brightening someone's day.", { design: "virtual-thanks", tone: "blush" }, true),
  occasion("Anniversary Cards", "anniversary-cards", "Romantic printable anniversary cards to celebrate love and the years together.", { design: "anniversary", tone: "peach" }, true),
  occasion("Wedding Cards", "wedding-cards", "Elegant printable wedding cards for the happy couple.", { design: "wedding", tone: "cream" }, true),
  occasion("Baby & New Arrival Cards", "new-baby", "Sweet printable cards to welcome a new little one.", { design: "new-baby", tone: "sage" }, true),
  occasion("Congratulations", "congratulations", "Printable congratulations cards for achievements big and small.", { design: "congratulations", tone: "sage" }),
  occasion("Engagement", "engagement", "Celebrate a new engagement with a heartfelt printable card."),
  occasion("Graduation", "graduation", "Printable graduation cards to mark the end of an era and the start of the next."),
  occasion("Get Well Soon", "get-well-soon", "Gentle, uplifting printable get-well cards."),
  occasion("Sympathy & Thinking of You", "sympathy-thinking-of-you", "Soft, considered cards for when words are hard to find.", { design: "thinking-of-you", tone: "sage" }),
  occasion("Mother's Day", "mothers-day", "Printable Mother's Day cards she'll love."),
  occasion("Father's Day", "fathers-day", "Printable Father's Day cards, ready in minutes."),
  occasion("Christmas", "christmas", "Printable and personalised Christmas cards for family and friends.", { design: "merry-christmas", tone: "cream" }),
  occasion("Easter", "easter", "Printable Easter cards for spring celebrations."),
  occasion("Valentine's Day", "valentines-day", "Printable Valentine's Day cards for the people you love."),
  occasion("Other Celebrations", "other-celebrations", "Cards for retirements, new homes, farewells and more."),

  { name: "Virtual Birthday Cards", slug: "virtual-birthday-cards", group: "VIRTUAL_CARDS", description: "Personalised digital birthday cards to share by message, email or social media.", tile: { design: "virtual-bouquet", tone: "peach" } },
  { name: "Virtual Congratulations Cards", slug: "virtual-congratulations-cards", group: "VIRTUAL_CARDS", description: "Digital congratulations cards you can send in seconds.", tile: { design: "virtual-congrats", tone: "sage" } },
  { name: "Virtual Thank You Cards", slug: "virtual-thank-you-cards", group: "VIRTUAL_CARDS", description: "Say thanks instantly with a beautiful digital card.", tile: { design: "virtual-thanks", tone: "blush" } },
  { name: "Virtual Holiday Cards", slug: "virtual-holiday-cards", group: "VIRTUAL_CARDS", description: "Digital holiday greetings, ready to share." },
  { name: "Personalised Digital Greetings", slug: "personalised-digital-greetings", group: "VIRTUAL_CARDS", description: "Digital cards personalised with your own message." },

  { name: "Invitations", slug: "invitations", group: "OTHER_DOWNLOADS", home: true, description: "Printable invitations for parties, showers and celebrations.", tile: { design: "invitation", tone: "peach" } },
  { name: "Planners & Organisers", slug: "planners", group: "OTHER_DOWNLOADS", home: true, description: "Printable planners and organisers to keep everyday life running smoothly.", tile: { design: "planner", tone: "sage" } },
  { name: "Calendars", slug: "calendars", group: "OTHER_DOWNLOADS", description: "Printable calendars for home, work and school." },
  { name: "To-Do Lists", slug: "to-do-lists", group: "OTHER_DOWNLOADS", description: "Pretty printable to-do lists." },
  { name: "Checklists", slug: "checklists", group: "OTHER_DOWNLOADS", home: true, description: "Printable checklists for parties, moving house, travel and more.", tile: { design: "checklist", tone: "blush" } },
  { name: "Habit Trackers", slug: "habit-trackers", group: "OTHER_DOWNLOADS", description: "Printable habit trackers to build routines you love." },
  { name: "Printable Wall Art", slug: "wall-art", group: "OTHER_DOWNLOADS", home: true, description: "Botanical printable wall art — print, frame and enjoy.", tile: { design: "wallArt", tone: "cream" } },
  { name: "Gift Tags", slug: "gift-tags", group: "OTHER_DOWNLOADS", home: true, description: "Printable gift tags to finish every present beautifully.", tile: { design: "giftTags", tone: "blush" } },
  { name: "Party Decorations", slug: "party-decorations", group: "OTHER_DOWNLOADS", description: "Printable banners, toppers and party decorations." },
  { name: "Printable Games", slug: "printable-games", group: "OTHER_DOWNLOADS", description: "Printable games for parties and showers." },
  { name: "Templates", slug: "templates", group: "OTHER_DOWNLOADS", home: true, description: "Editable and printable digital templates.", tile: { design: "invitation", tone: "sage" } },
  { name: "Other Downloads", slug: "other-downloads", group: "OTHER_DOWNLOADS", home: true, description: "Everything else in the Cardly printable collection.", tile: { design: "checklist", tone: "peach" } },
];

const CARD_INCLUDED = [
  "1 × high-resolution printable PDF (2 pages, A4 landscape)",
  "Page 1: front and back cover · Page 2: inside pages",
  "Folds to an A5 card (148 × 210 mm)",
  "Personalised version: your message printed inside",
].join("\n");

const VIRTUAL_INCLUDED = [
  "Card front as a PNG image (1080 × 1528 px)",
  "Message page as a PNG image — personalised with your words, or blank",
  "Two-page digital PDF",
  "Ready to share by text, WhatsApp, email or social media",
].join("\n");

export type SeedProduct = {
  title: string;
  slug: string;
  type: "GREETING_CARD" | "VIRTUAL_CARD" | "INVITATION" | "PLANNER" | "GIFT_TAG" | "WALL_ART" | "CHECKLIST";
  categories: string[];
  short: string;
  description: string;
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
  ready: number;
  personalised?: number;
  art: { kind: "card"; design: DesignId; inside: "rose" | "sage" | "peach" | "holly"; tone: MockupTone; readyMadeMessage?: string; defaultFont?: string }
    | { kind: "download"; design: DownloadDesign; tone: MockupTone; card?: boolean };
  whatsIncluded?: string;
  sizeInfo?: string;
};

const card = (p: Omit<SeedProduct, "type" | "ready" | "personalised" | "whatsIncluded" | "sizeInfo"> & Partial<SeedProduct>): SeedProduct => ({
  type: "GREETING_CARD",
  ready: 250,
  personalised: 400,
  whatsIncluded: CARD_INCLUDED,
  sizeInfo: "A5 folded card (148 × 210 mm), printed on A4 paper",
  ...p,
});

const virtual = (p: Omit<SeedProduct, "type" | "ready" | "personalised" | "whatsIncluded" | "sizeInfo"> & Partial<SeedProduct>): SeedProduct => ({
  type: "VIRTUAL_CARD",
  ready: 300,
  personalised: 450,
  whatsIncluded: VIRTUAL_INCLUDED,
  sizeInfo: "Portrait digital card, phone-friendly (1080 × 1528 px)",
  ...p,
});

export const PRODUCTS: SeedProduct[] = [
  card({
    title: "Happy Birthday Blooms", slug: "happy-birthday-blooms", featured: true, isNew: true,
    categories: ["birthday-cards"],
    short: "A beautifully illustrated floral birthday card, perfect for making someone's day extra special.",
    description: "Soft blush peonies, garden roses and trailing greenery frame a hand-lettered “Happy Birthday” on this elegant printable card.\n\nChoose the ready-made version with a clean, blank inside for writing your own note by hand, or personalise the inside with your message before you buy — we'll set it beautifully and deliver a print-ready PDF instantly.",
    tags: ["birthday", "floral", "flowers", "peony", "for her", "printable birthday card"],
    art: { kind: "card", design: "birthday-blooms", inside: "rose", tone: "blush" },
  }),
  card({
    title: "Confetti Celebration", slug: "confetti-celebration", featured: true,
    categories: ["celebration-cards", "congratulations", "other-celebrations"],
    short: "A joyful scattering of confetti for any occasion worth celebrating.",
    description: "Pastel confetti and an elegant “Let's Celebrate” make this a versatile card for birthdays, promotions, engagements and every happy moment in between.",
    tags: ["celebrate", "confetti", "party", "congratulations", "birthday"],
    art: { kind: "card", design: "confetti-celebration", inside: "peach", tone: "peach" },
  }),
  card({
    title: "Make a Wish", slug: "make-a-wish", featured: true,
    categories: ["birthday-cards"],
    short: "A sweet layered cake with glowing candles and fresh flowers.",
    description: "A charming illustrated birthday cake, finished with candles and a scattering of blooms. Lovely for kids and grown-ups alike.",
    tags: ["birthday", "cake", "candles", "kids", "wish"],
    art: { kind: "card", design: "make-a-wish", inside: "peach", tone: "peach", readyMadeMessage: "Wishing you a wonderful birthday!" },
  }),
  card({
    title: "Another Amazing Year", slug: "another-amazing-year", featured: true,
    categories: ["birthday-cards"],
    short: "A garland of garden flowers raising a toast to another amazing year.",
    description: "Delicate floral garlands and elegant lettering — a timeless birthday card for friends, family and colleagues.",
    tags: ["birthday", "floral", "garland", "milestone"],
    art: { kind: "card", design: "amazing-year", inside: "rose", tone: "cream" },
  }),
  card({
    title: "Age Is Just a Number", slug: "age-is-just-a-number",
    categories: ["birthday-cards"],
    short: "Pastel balloons and a gentle reminder that age is just a number.",
    description: "Playful pastel balloons with a cheeky, kind-hearted message. Perfect for milestone birthdays.",
    tags: ["birthday", "balloons", "funny", "milestone", "30th", "40th", "50th"],
    art: { kind: "card", design: "age-number", inside: "rose", tone: "blush" },
  }),
  card({
    title: "Sending Birthday Smiles", slug: "sending-birthday-smiles", isNew: true,
    categories: ["birthday-cards", "just-because"],
    short: "A meadow of cheerful daisies sending birthday smiles.",
    description: "Fresh white daisies on soft sage — bright, happy and perfect for anyone who loves the garden.",
    tags: ["birthday", "daisies", "flowers", "cheerful"],
    art: { kind: "card", design: "birthday-smiles", inside: "sage", tone: "sage" },
  }),
  card({
    title: "Congratulations!", slug: "congratulations-sprigs", featured: true,
    categories: ["congratulations", "celebration-cards", "graduation", "engagement"],
    short: "Gold stars, sprigs of greenery and a big “Congratulations!”.",
    description: "A versatile congratulations card for graduations, new jobs, engagements and big achievements.",
    tags: ["congratulations", "graduation", "new job", "engagement", "well done"],
    art: { kind: "card", design: "congratulations", inside: "sage", tone: "cream", readyMadeMessage: "So proud of you!" },
  }),
  card({
    title: "Thank You So Much", slug: "thank-you-so-much", featured: true,
    categories: ["thank-you-cards"],
    short: "Generous floral bouquets framing a heartfelt thank you.",
    description: "Say thank you beautifully. Ideal for teachers, hosts, helpers and anyone who made a difference.",
    tags: ["thank you", "teacher", "floral", "gratitude"],
    art: { kind: "card", design: "thank-you", inside: "rose", tone: "blush" },
  }),
  card({
    title: "Thinking of You", slug: "thinking-of-you",
    categories: ["sympathy-thinking-of-you", "get-well-soon", "just-because"],
    short: "Soft eucalyptus and tiny white blossoms for gentle moments.",
    description: "A calm, considered design for sympathy, get well wishes or simply letting someone know they're in your thoughts. The ready-made version has a clean, blank inside.",
    tags: ["sympathy", "thinking of you", "get well", "condolence", "eucalyptus"],
    art: { kind: "card", design: "thinking-of-you", inside: "sage", tone: "sage" },
  }),
  card({
    title: "Merry Christmas", slug: "merry-christmas", isNew: true,
    categories: ["christmas", "holiday-cards"],
    short: "A classic holly wreath with festive red berries.",
    description: "Traditional holly and berries with elegant script lettering — a timeless printable Christmas card for family, friends and clients.",
    tags: ["christmas", "holiday", "holly", "festive", "xmas"],
    art: { kind: "card", design: "merry-christmas", inside: "holly", tone: "cream", readyMadeMessage: "Wishing you joy, peace and love this Christmas." },
  }),
  card({
    title: "Happy Anniversary", slug: "happy-anniversary",
    categories: ["anniversary-cards", "valentines-day"],
    short: "A romantic wreath of lavender and blush blooms with scattered hearts.",
    description: "Celebrate love with a soft, romantic anniversary card.",
    tags: ["anniversary", "love", "romantic", "hearts"],
    art: { kind: "card", design: "anniversary", inside: "rose", tone: "blush", defaultFont: "script" },
  }),
  card({
    title: "On Your Wedding Day", slug: "on-your-wedding-day",
    categories: ["wedding-cards", "engagement"],
    short: "Ivory blooms and eucalyptus for the happy couple.",
    description: "An elegant wedding card with ivory florals and trailing eucalyptus.",
    tags: ["wedding", "bride", "groom", "marriage", "elegant"],
    art: { kind: "card", design: "wedding", inside: "sage", tone: "cream", defaultFont: "script" },
  }),
  card({
    title: "Welcome Little One", slug: "welcome-little-one",
    categories: ["new-baby"],
    short: "A dreamy cloud, tiny stars and a gentle welcome for a new arrival.",
    description: "A sweet, gender-neutral new baby card in soft sage and peach.",
    tags: ["new baby", "baby", "newborn", "baby shower"],
    art: { kind: "card", design: "new-baby", inside: "sage", tone: "sage" },
  }),
  virtual({
    title: "Birthday Bouquet — Virtual Card", slug: "birthday-bouquet-virtual-card", featured: true, isNew: true,
    categories: ["virtual-birthday-cards", "personalised-digital-greetings"],
    short: "Send a bouquet in seconds — a personalised digital birthday card to share from your phone.",
    description: "A lush bouquet of blush and apricot blooms. Add your message, download the finished images and share them however you like — by text, WhatsApp, email or social media.",
    tags: ["virtual", "digital", "birthday", "e-card", "send online"],
    art: { kind: "card", design: "virtual-bouquet", inside: "rose", tone: "peach" },
  }),
  virtual({
    title: "Congrats! — Virtual Card", slug: "congrats-virtual-card",
    categories: ["virtual-congratulations-cards", "personalised-digital-greetings"],
    short: "A confetti-filled digital congratulations card.",
    description: "Celebrate good news instantly with a cheerful digital card you can personalise and share.",
    tags: ["virtual", "digital", "congratulations", "e-card"],
    art: { kind: "card", design: "virtual-congrats", inside: "sage", tone: "sage" },
  }),
  virtual({
    title: "Thanks a Bunch — Virtual Card", slug: "thanks-a-bunch-virtual-card",
    categories: ["virtual-thank-you-cards", "personalised-digital-greetings", "just-because"],
    short: "A ring of daisies saying thanks a bunch.",
    description: "A sweet digital thank-you card for sending gratitude straight away.",
    tags: ["virtual", "digital", "thank you", "daisies", "e-card"],
    art: { kind: "card", design: "virtual-thanks", inside: "rose", tone: "blush" },
  }),
  {
    title: "Weekly Planner", slug: "weekly-planner", type: "PLANNER", featured: true,
    categories: ["planners", "to-do-lists"],
    short: "A pretty floral weekly planner to bring calm to busy weeks.",
    description: "Plan your week at a glance with roomy daily boxes and a space for notes and priorities. Print as many copies as you need for personal use.",
    tags: ["planner", "weekly", "organiser", "printable planner"],
    ready: 500,
    whatsIncluded: "1 × printable PDF (A4 portrait)\nPrint as many copies as you like for personal use",
    sizeInfo: "A4 (210 × 297 mm). Also prints on US Letter with “Fit to page”.",
    art: { kind: "download", design: "planner", tone: "sage" },
  },
  {
    title: "Floral Invitation", slug: "floral-invitation", type: "INVITATION", isNew: true,
    categories: ["invitations", "templates"],
    short: "A romantic floral invitation with space to write in your details.",
    description: "Peach and blush blooms frame a “You're Invited” headline, with lines for the guest of honour, date, time, place and RSVP. Print and fill in by hand.",
    tags: ["invitation", "party", "birthday party", "bridal shower", "baby shower"],
    ready: 400,
    whatsIncluded: "1 × printable PDF (A5 invitation)\nFill-in lines for your event details",
    sizeInfo: "A5 (148 × 210 mm)",
    art: { kind: "download", design: "invitation", tone: "peach", card: true },
  },
  {
    title: "Printable Gift Tags", slug: "printable-gift-tags", type: "GIFT_TAG", featured: true,
    categories: ["gift-tags", "christmas"],
    short: "Six floral gift tags on one A4 sheet — print, cut and tie.",
    description: "Six illustrated gift tags with sweet sentiments: For You, With Love, Merry & Bright, Thank You, Happy Birthday and Just Because.",
    tags: ["gift tags", "presents", "christmas", "birthday", "wrapping"],
    ready: 350,
    whatsIncluded: "1 × printable PDF (A4) with 6 gift tags",
    sizeInfo: "A4 sheet; each tag approx. 8 × 8.5 cm",
    art: { kind: "download", design: "giftTags", tone: "blush" },
  },
  {
    title: "Bloom Where You Are Planted — Wall Art", slug: "bloom-where-you-are-planted-wall-art", type: "WALL_ART",
    categories: ["wall-art"],
    short: "A floral wreath and gentle words to frame for your home.",
    description: "Botanical wall art with a peach and blush wreath and the reminder to bloom where you are planted.",
    tags: ["wall art", "print", "botanical", "quote", "home decor"],
    ready: 600,
    whatsIncluded: "1 × high-resolution printable PDF (A4 portrait)",
    sizeInfo: "A4 (210 × 297 mm); frame in a standard A4 frame",
    art: { kind: "download", design: "wallArt", tone: "cream" },
  },
  {
    title: "Party Planning Checklist", slug: "party-planning-checklist", type: "CHECKLIST",
    categories: ["checklists", "other-downloads", "to-do-lists"],
    short: "Everything to remember for your next celebration, in one pretty checklist.",
    description: "Ten essential party-planning steps with tick boxes, from the guest list to the thank-you cards.",
    tags: ["checklist", "party", "planning", "organiser"],
    ready: 300,
    whatsIncluded: "1 × printable PDF (A4 portrait)",
    sizeInfo: "A4 (210 × 297 mm)",
    art: { kind: "download", design: "checklist", tone: "peach" },
  },
];
