"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto sign out on error page
    signOut({ redirect: false });
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAF8F5]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md text-center"
      >
        <div className="w-16 h-16 bg-[#C95959]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[#C95959]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-[#2D2D2D] mb-4">
          Authentication Error
        </h1>
        <p className="text-[#6B6B6B] mb-8">
          There was a problem signing you in. Please try again or contact support
          if this issue persists.
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520]"
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full"
          >
            Go Home
          </Button>
        </div>

        <p className="text-sm text-[#B0B0B0] mt-6">
          Need help?{" "}
          <Link href="/support" className="text-[#2AAAA0] hover:underline">
            Contact Support
          </Link>
        </p>
      </motion.div>
    </div>
  );
}