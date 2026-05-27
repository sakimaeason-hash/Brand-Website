"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const recommendedProducts = [
  {
    id: "acc-1",
    name: "Premium Travel Bag",
    tagline: "Protect Your Investment",
    price: 79,
    category: "accessories",
    rating: 4.6,
    reviews: 215,
  },
  {
    id: "acc-2",
    name: "Extended Battery Pack",
    tagline: "Double Your Range",
    price: 199,
    originalPrice: 249,
    category: "accessories",
    rating: 4.8,
    reviews: 178,
  },
  {
    id: "acc-3",
    name: "All-Weather Cover",
    tagline: "Protection in Any Season",
    price: 49,
    category: "accessories",
    rating: 4.5,
    reviews: 89,
  },
  {
    id: "acc-4",
    name: "Universal Cup Holder",
    tagline: "Stay Hydrated On The Go",
    price: 29,
    category: "accessories",
    rating: 4.7,
    reviews: 156,
  },
];

const promoCodes = {
  SAVE10: { discount: 0.1, message: "10% off your order", freeShipping: false },
  SAVE20: { discount: 0.2, message: "20% off your order", freeShipping: false },
  FREESHIP: { discount: 0, freeShipping: true, message: "Free shipping applied" },
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart, addItem } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; message: string; discount?: number; freeShipping?: boolean } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const shippingCost = 0;
  const discount = appliedPromo?.discount ? totalPrice * appliedPromo.discount : 0;
  const finalTotal = totalPrice - discount + shippingCost;
  const tax = finalTotal * 0.08; // 8% tax estimate

  const handleApplyPromo = () => {
    setIsApplyingPromo(true);
    setPromoError("");
    setTimeout(() => {
      const code = promoCode.trim().toUpperCase();
      if (promoCodes[code as keyof typeof promoCodes]) {
        setAppliedPromo({
          code,
          ...promoCodes[code as keyof typeof promoCodes],
        });
        setPromoError("");
      } else {
        setPromoError("Invalid promo code");
        setAppliedPromo(null);
      }
      setIsApplyingPromo(false);
    }, 500);
  };

  const handleAddRecommended = (product: (typeof recommendedProducts)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-[#FAF8F5] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-[#B0B0B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">Your Cart is Empty</h1>
          <p className="text-[#6B6B6B] mb-6">Looks like you haven&apos;t added any items yet.</p>
          <Button asChild className="bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520]">
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#2D2D2D] mb-8">Shopping Cart ({totalItems})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] rounded-lg flex items-center justify-center shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="text-[#B0B0B0] text-xs">No Image</span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-[#2D2D2D] text-lg">{item.name}</h3>
                          <p className="text-sm text-[#6B6B6B]">Free shipping included</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#B0B0B0] hover:text-[#C95959] transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg border border-[#E8E8E8] flex items-center justify-center text-[#6B6B6B] hover:border-[#2AAAA0] hover:text-[#2AAAA0] transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium text-[#2D2D2D]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg border border-[#E8E8E8] flex items-center justify-center text-[#6B6B6B] hover:border-[#2AAAA0] hover:text-[#2AAAA0] transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#2D2D2D]">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-[#6B6B6B]">${item.price.toLocaleString()} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="text-[#6B6B6B] hover:text-[#C95959] text-sm underline transition-colors"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Order Summary</h2>

                {/* Promo Code */}
                <div className="mb-6">
                  <label className="text-sm text-[#6B6B6B] mb-2 block">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      disabled={!!appliedPromo}
                      className="flex-1 px-3 py-2 border border-[#E8E8E8] rounded-lg text-sm focus:outline-none focus:border-[#2AAAA0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApplyPromo}
                      disabled={!promoCode || isApplyingPromo}
                      className="bg-[#2D2D2D] text-white hover:bg-[#2AAAA0] border-[#2D2D2D] disabled:opacity-50"
                    >
                      {isApplyingPromo ? "..." : "Apply"}
                    </Button>
                  </div>
                  {promoError && <p className="text-[#C95959] text-xs mt-1">{promoError}</p>}
                  {appliedPromo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="flex items-center gap-2 mt-2 text-[#2AAAA0] text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {appliedPromo.message}
                      <button onClick={() => setAppliedPromo(null)} className="ml-auto text-[#6B6B6B] hover:text-[#C95959]">
                        ×
                      </button>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#2AAAA0]">
                      <span>Discount ({appliedPromo?.code})</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Shipping</span>
                    <span className="text-[#2AAAA0]">Free</span>
                  </div>
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Estimated Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-[#E8E8E8] pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-[#2D2D2D]">
                    <span>Estimated Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520] mb-3"
                  asChild
                >
                  <a
                    href="https://www.amazon.com/stores/Goldseasonelectricwheelchair/page/F424DE88-3CEC-4B90-BCEF-D0BAC8FCEA80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Proceed to Checkout
                  </a>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/products">Continue Shopping</Link>
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-[#E8E8E8]">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <svg className="w-5 h-5 text-[#2AAAA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-xs text-[#6B6B6B]">Secure</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <svg className="w-5 h-5 text-[#2AAAA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-xs text-[#6B6B6B]">30-Day</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <svg className="w-5 h-5 text-[#2AAAA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536-3.536m0 5.656l3.536-3.536M18.364 5.636L12 12m0 0l-6.364-6.364M12 12l6.364 6.364M12 12l-3.536 3.536" />
                      </svg>
                      <span className="text-xs text-[#6B6B6B]">Warranty</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommended Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-6">You May Also Like</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden group bg-white hover:shadow-lg transition-all">
                  <div className="aspect-square bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] flex items-center justify-center">
                    <span className="text-[#6B6B6B]">{product.name.split(" ").slice(-1)[0]}</span>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-[#2AAAA0] font-medium mb-1">{product.tagline}</p>
                    <h3 className="font-medium text-[#2D2D2D] group-hover:text-[#2AAAA0] transition-colors mb-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      <svg className="w-3 h-3 text-[#F5A623] fill-[#F5A623]" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-xs text-[#6B6B6B]">{product.rating} ({product.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#F5A623]">${product.price}</span>
                      <Button
                        size="sm"
                        className="bg-[#2D2D2D] text-white hover:bg-[#2AAAA0]"
                        onClick={() => handleAddRecommended(product)}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
