import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PostHogProvider } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "legends.guide | Guidance from History's Legends",
  description:
    "Guidance from history's legends. Deeply researched AI mentors grounded in real biographies — Rockefeller, Musk, Franklin, and more. Voice-enabled. Free to try.",
  metadataBase: new URL("https://legends.guide"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "legends.guide — Guidance from History's Legends",
    description:
      "Guidance from history's legends. Deeply researched AI mentors. Free to try.",
    url: "https://legends.guide",
    siteName: "legends.guide",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "legends.guide — Guidance from History's Legends",
    description:
      "Guidance from history's legends. Deeply researched AI mentors. Free to try.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
