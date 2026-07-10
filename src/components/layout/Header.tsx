"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/new-arrivals", label: "New Arrivals", badge: "NEW" },
  { href: "/guides", label: "Home Guides" },
  { href: "/stories", label: "Stories" },
  { href: "/support", label: "Support" },
];

const searchData = [
  { type: "Product", title: "Explorer Pro", desc: "All-terrain mobility wheelchair" },
  { type: "Product", title: "City Glide", desc: "Urban mobility redefined" },
  { type: "Product", title: "Traveler", desc: "Your perfect travel companion" },
  { type: "Page", title: "Home Guides", desc: "Kitchen, Bedroom & Outdoor accessibility" },
  { type: "Page", title: "Support", desc: "Warranty, repairs & FAQ" },
  { type: "Page", title: "About Us", desc: "Our story and values" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof searchData>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { totalItems } = useCart();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchData.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F4]/95 backdrop-blur-sm border-b border-[#D4CCC5]">
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
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-[#5C534E] hover:text-[#3D3330] transition-colors text-sm font-medium"
              >
                {link.label}
                {link.badge && (
                  <span className="absolute -top-2 -right-6 bg-[#C8956C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-[#5C534E] hover:text-[#3D3330] transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <a
              href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-sm text-[#5C534E] hover:text-[#3D3330] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Stores</span>
            </a>
            <Link
              href="/cart"
              className="p-2 text-[#5C534E] hover:text-[#3D3330] transition-colors relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8956C] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-[#D4CCC5] animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 text-[#5C534E] hover:text-[#3D3330] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8956C] to-[#8B7355] flex items-center justify-center text-white text-sm font-bold">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#D4CCC5] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#D4CCC5]">
                      <p className="font-medium text-[#3D3330] text-sm">{session.user?.name}</p>
                      <p className="text-xs text-[#5C534E]">{session.user?.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-[#5C534E] hover:bg-[#FAF7F4] hover:text-[#3D3330]"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-[#5C534E] hover:bg-[#FAF7F4] hover:text-[#3D3330]"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Order History
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#C4756A] hover:bg-[#FAF7F4]"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="p-2 text-[#5C534E] hover:text-[#3D3330] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-[#5C534E] hover:text-[#3D3330] transition-colors"
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
          <div className="lg:hidden py-4 border-t border-[#D4CCC5]">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-3 text-[#3D3330] hover:bg-[#E8D5C4] rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                  {link.badge && (
                    <span className="bg-[#C8956C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
              <a
                href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 text-[#3D3330] hover:bg-[#E8D5C4] rounded-lg transition-colors sm:hidden"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find a Store
              </a>
            </nav>
          </div>
        )}
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 bg-black/50"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 p-4 border-b border-[#D4CCC5]">
                <svg className="w-5 h-5 text-[#5C534E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, pages, guides..."
                  className="flex-1 text-lg outline-none placeholder:text-[#9E948A]"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-[#5C534E] hover:text-[#3D3330] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((item, index) => (
                      <Link
                        key={index}
                        href={item.type === "Product" ? "/products" : `/${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#FAF7F4] transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#E8D5C4] flex items-center justify-center shrink-0">
                          <span className="text-lg">
                            {item.type === "Product" ? "🪑" : "📄"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-[#3D3330]">{item.title}</p>
                          <p className="text-sm text-[#5C534E]">{item.desc}</p>
                          <p className="text-xs text-[#8B7355] mt-1">{item.type}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="p-8 text-center text-[#5C534E]">
                    <p className="text-lg mb-2">No results found</p>
                    <p className="text-sm">Try searching for &quot;Explorer Pro&quot;, &quot;support&quot;, or &quot;guides&quot;</p>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-sm text-[#5C534E] mb-3">Popular searches</p>
                    <div className="flex flex-wrap gap-2">
                      {["Explorer Pro", "City Glide", "support", "guides", "about"].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-3 py-1.5 bg-[#E8D5C4] text-[#5C534E] text-sm rounded-full hover:bg-[#C8956C] hover:text-white transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
