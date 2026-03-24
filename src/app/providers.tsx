"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        capture_pageview: true,
        capture_pageleave: true,
      });
    }
  }, []);

  const inner = <SessionProvider>{children}</SessionProvider>;

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return inner;
  }

  return <PHProvider client={posthog}>{inner}</PHProvider>;
}

// Keep backward compat export
export { Providers as PostHogProvider };
