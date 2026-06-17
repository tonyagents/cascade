import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

// Display/heading face — geometric, futuristic, but friendly. Body + UI use the
// native San Francisco system stack (wired up in globals.css) for an Apple feel.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Cascade — AI-first GTM engine",
  description:
    "One product idea in, a full launch stack out: GTM plan, creative brief, BRD, and content ideas — each grounded in the one before it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} dark h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
