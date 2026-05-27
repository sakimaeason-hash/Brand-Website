"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpForm = z.infer<typeof signUpSchema>;

function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setAuthError(result.error || "Failed to create account");
        return
      }

      // Auto sign in after successful registration
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 2000);
      }
    } catch {
      setAuthError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-white">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#2AAAA0]/10 text-[#2AAAA0] p-6 rounded-lg"
          >
            <svg
              className="w-12 h-12 mx-auto mb-4 text-[#2AAAA0]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h3 className="text-xl font-bold mb-2">Account Created!</h3>
            <p className="text-sm">Redirecting you to home page...</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardContent className="p-8">
        {authError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-[#C95959]/10 text-[#C95959] p-3 rounded-lg mb-6 text-sm"
          >
            {authError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#2D2D2D] mb-2 block">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="John Doe"
              {...register("name")}
              className={errors.name ? "border-[#C95959]" : ""}
            />
            {errors.name && (
              <p className="text-[#C95959] text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#2D2D2D] mb-2 block">
              Email
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              className={errors.email ? "border-[#C95959]" : ""}
            />
            {errors.email && (
              <p className="text-[#C95959] text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#2D2D2D] mb-2 block">
              Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={errors.password ? "border-[#C95959]" : ""}
            />
            {errors.password && (
              <p className="text-[#C95959] text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-[#2D2D2D] mb-2 block">
              Confirm Password
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              className={errors.confirmPassword ? "border-[#C95959]" : ""}
            />
            {errors.confirmPassword && (
              <p className="text-[#C95959] text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="text-sm text-[#6B6B6B]">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" className="mt-1 rounded border-[#E8E8E8]" required />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="text-[#2AAAA0] hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#2AAAA0] hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520]"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#6B6B6B]">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-[#2AAAA0] hover:underline">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#FAF8F5]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-2xl font-bold text-[#F5A623]">GoldSeason</span>
          </Link>
          <h1 className="text-3xl font-bold text-[#2D2D2D] mb-2">Create Account</h1>
          <p className="text-[#6B6B6B]">Join GoldSeason today</p>
        </div>

        <Suspense fallback={<div className="animate-pulse bg-[#FAF8F5] h-96 rounded-lg" />}>
          <SignUpForm />
        </Suspense>
      </motion.div>
    </div>
  );
}