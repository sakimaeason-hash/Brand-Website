"use client";

import Header from "./Header";
import Footer from "./Footer";
import { CartProvider } from "@/context/CartContext";
import AuthModal from "@/components/auth/AuthModal";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user is logged in ( Firebase integration pending )
    const isLoggedIn = localStorage.getItem("user");
    if (!isLoggedIn && !dismissed) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowAuthModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  const handleClose = () => {
    setShowAuthModal(false);
    setDismissed(true);
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <AuthModal
          isOpen={showAuthModal}
          onClose={handleClose}
          initialTab="register"
        />
      </div>
    </CartProvider>
  );
}
