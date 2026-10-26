import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const serif = localFont({
  src: [
    { path: "../../public/fonts/CormorantGaramond-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/CormorantGaramond-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/CormorantGaramond-MediumItalic.ttf", weight: "500", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});
const sans = localFont({
  src: [
    { path: "../../public/fonts/Jost-Light.ttf", weight: "300" },
    { path: "../../public/fonts/Jost-Regular.ttf", weight: "400" },
    { path: "../../public/fonts/Jost-Medium.ttf", weight: "500" },
  ],
  variable: "--font-sans",
  display: "swap",
});
const script = localFont({ src: "../../public/fonts/GreatVibes-Regular.ttf", variable: "--font-script", display: "swap" });

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Cardly — Printable & Virtual Greeting Cards | Small Cards. Big Moments.", template: "%s | Cardly" },
  description:
    "Beautiful, affordable printable greeting cards, personalised cards, virtual cards and digital downloads. Instant download, print at home. Prices in AUD.",
  applicationName: "Cardly",
  openGraph: { type: "website", siteName: "Cardly", locale: "en_AU", images: ["/brand/og-default.png"] },
  twitter: { card: "summary_large_image" },
  icons: { apple: "/brand/icon.png" },
};

export const viewport: Viewport = { themeColor: "#F5D9D8", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={`${serif.variable} ${sans.variable} ${script.variable}`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
