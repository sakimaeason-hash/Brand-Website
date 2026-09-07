"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, initialTab = "register" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [isOpen, initialTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeTab === "register") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setLoading(true);
    // Simulate Firebase Auth call
    setTimeout(() => {
      setLoading(false);
      alert(`${activeTab === "register" ? "Account created" : "Signed in"} successfully! (Firebase integration pending)`);
      onClose();
    }, 1500);
  };

  const switchTab = (tab: "login" | "register") => {
    setActiveTab(tab);
    setError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-[#F5A623] to-[#E09520] px-8 py-6 text-center">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {activeTab === "register" ? "Join GoldSeason" : "Welcome Back"}
                </h2>
                <p className="text-white/80 text-sm">
                  {activeTab === "register"
                    ? "Create an account and get 10% off your first order"
                    : "Sign in to continue shopping"}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="flex border-b border-[#E8E8E8]">
                <button
                  onClick={() => switchTab("login")}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === "login"
                      ? "text-[#2D2D2D] border-b-2 border-[#F5A623]"
                      : "text-[#6B6B6B] hover:text-[#2D2D2D]"
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => switchTab("register")}
                  className={`flex-1 py-4 text-sm font-medium transition-colors ${
                    activeTab === "register"
                      ? "text-[#2D2D2D] border-b-2 border-[#F5A623]"
                      : "text-[#6B6B6B] hover:text-[#2D2D2D]"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E8E8] rounded-xl text-[#2D2D2D] placeholder-[#B0B0B0] focus:outline-none focus:border-[#2AAAA0] focus:ring-2 focus:ring-[#2AAAA0]/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={activeTab === "register" ? "At least 8 characters" : "Enter your password"}
                    required
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E8E8] rounded-xl text-[#2D2D2D] placeholder-[#B0B0B0] focus:outline-none focus:border-[#2AAAA0] focus:ring-2 focus:ring-[#2AAAA0]/10 transition-all"
                  />
                </div>

                {activeTab === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#E8E8E8] rounded-xl text-[#2D2D2D] placeholder-[#B0B0B0] focus:outline-none focus:border-[#2AAAA0] focus:ring-2 focus:ring-[#2AAAA0]/10 transition-all"
                    />
                  </motion.div>
                )}

                {activeTab === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => alert("Password reset feature - coming soon")}
                      className="text-sm text-[#2AAAA0] hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#F5A623] hover:bg-[#E09520] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#F5A623]/25 hover:shadow-xl hover:shadow-[#F5A623]/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {activeTab === "register" ? "Creating Account..." : "Signing In..."}
                    </>
                  ) : (
                    activeTab === "register" ? "Create Account" : "Sign In"
                  )}
                </button>

                <p className="text-center text-sm text-[#6B6B6B]">
                  {activeTab === "register" ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchTab("login")}
                        className="text-[#2AAAA0] font-medium hover:underline"
                      >
                        Sign In
                      </button>
                    </>
                  ) : (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => switchTab("register")}
                        className="text-[#2AAAA0] font-medium hover:underline"
                      >
                        Create one
                      </button>
                    </>
                  )}
                </p>
              </form>

              {/* Promo Banner */}
              {activeTab === "register" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#2AAAA0]/10 px-8 py-4 text-center"
                >
                  <p className="text-sm text-[#2AAAA0] font-medium">
                    🎫 New members get 10% off their first order!
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}