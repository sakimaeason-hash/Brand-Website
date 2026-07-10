"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="inline-flex items-center justify-center rounded-lg border border-[#C95959]/30 px-5 py-3 text-sm font-medium text-[#C95959] transition-colors hover:bg-[#C95959]/10"
    >
      Sign Out
    </button>
  );
}
