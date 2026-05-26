"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/new-arrivals", label: "New Arrivals", badge: "NEW" },
  { href: "/guides", label: "Home Guides" },
  { href: "/stories", label: "Stories" },
  { href: "/support", label: "Support" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E8E8E8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="GoldSeason"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
              >
                {link.label}
                {link.badge && (
                  <span className="absolute -top-2 -right-6 bg-[#F5A623] text-[#2D2D2D] text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <a
              href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80?lp_asin=B0FB7YWS4C&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-sm text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Stores</span>
            </a>
            <Link
              href="/cart"
              className="p-2 text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F5A623] text-[#2D2D2D] text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#E8E8E8]">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-3 text-[#2D2D2D] hover:bg-[#FAF8F5] rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                  {link.badge && (
                    <span className="bg-[#F5A623] text-[#2D2D2D] text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              <a
                href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80?lp_asin=B0FB7YWS4C&ref_=ast_bln&store_ref=bl_ast_dp_brandlogo_sto"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 text-[#2D2D2D] hover:bg-[#FAF8F5] rounded-lg transition-colors sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find a Store
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
