import { getFigure } from "@/lib/figures";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ figure: string }>;
}): Promise<Metadata> {
  const { figure: figureSlug } = await params;
  const figure = getFigure(figureSlug);

  if (!figure) {
    return { title: "Legend Not Found | legends.guide" };
  }

  const ogImageUrl = `https://legends.guide/api/og/${figure.slug}`;

  return {
    title: `Talk to ${figure.name} | legends.guide`,
    description: `Have a real conversation with ${figure.name}. AI-powered wisdom from history's greatest minds.`,
    openGraph: {
      title: `Talk to ${figure.name} — legends.guide`,
      description: `Have a real conversation with ${figure.name}. AI-powered wisdom from history's greatest minds.`,
      url: `https://legends.guide/chat/${figure.slug}`,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Talk to ${figure.name} — legends.guide`,
      description: `Have a real conversation with ${figure.name}. AI-powered wisdom from history's greatest minds.`,
      images: [ogImageUrl],
    },
  };
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
