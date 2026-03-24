"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="w-8 h-8 rounded-full bg-warm-200 animate-pulse" />
    );
  }

  if (session?.user) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 text-sm text-warm-400 hover:text-ink-950 transition-colors"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-warm-300 flex items-center justify-center text-xs text-white font-medium">
            {session.user.name?.[0] || "?"}
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm text-warm-500 hover:text-ink-950 transition-colors border border-warm-300 rounded-full px-4 py-2 hover:border-ink-950"
    >
      Sign in
    </button>
  );
}
