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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export const metadata: Metadata = {
  title: "legends.guide | Talk to History's Greatest Minds",
  description:
    "Get personal advice from Rockefeller, Benjamin Franklin, Elon Musk, Alexander the Great, and more. AI mentors grounded in real biographies and primary sources. Voice-enabled. Free to try.",
  metadataBase: new URL("https://legends.guide"),
  keywords: [
    "AI mentorship",
    "talk to historical figures",
    "Rockefeller advice",
    "Benjamin Franklin wisdom",
    "AI life coach",
    "historical mentors",
    "biography-based AI",
    "legends guide",
    "chat with history",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "legends.guide | Talk to History's Greatest Minds",
    description:
      "Get personal advice from Rockefeller, Franklin, Musk, and more. AI mentors grounded in real biographies. Free to try.",
    url: "https://legends.guide",
    siteName: "legends.guide",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "legends.guide | Talk to History's Greatest Minds",
    description:
      "Get personal advice from Rockefeller, Franklin, Musk, and more. AI mentors grounded in real biographies. Free to try.",
  },
  alternates: {
    canonical: "https://legends.guide",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "legends.guide",
              url: "https://legends.guide",
              description:
                "Get personal advice from history's greatest minds. AI mentors grounded in real biographies and primary sources.",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "25 free messages, then $10 for 100 messages",
              },
            }),
          }}
        />
        <PostHogProvider>
          {children}
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
