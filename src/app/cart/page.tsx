"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clearCart } = useCart();

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

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Shipping</span>
                    <span className="text-[#2AAAA0]">Free</span>
                  </div>
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-[#E8E8E8] pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold text-[#2D2D2D]">
                    <span>Estimated Total</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button className="w-full bg-[#F5A623] text-[#2D2D2D] hover:bg-[#E09520] mb-3">
                  Proceed to Checkout
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/products">Continue Shopping</Link>
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-[#E8E8E8]">
                  <div className="flex items-center justify-center gap-4 text-[#6B6B6B]">
                    <div className="flex items-center gap-1 text-xs">
                      <svg className="w-4 h-4 text-[#2AAAA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Secure Checkout
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <svg className="w-4 h-4 text-[#2AAAA0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      30-Day Returns
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
            {[
              { name: "Travel Bag", price: 79, image: "Bag" },
              { name: "Battery Backup", price: 199, image: "Battery" },
              { name: "Weather Cover", price: 49, image: "Cover" },
              { name: "Cup Holder", price: 29, image: "Holder" },
            ].map((product, i) => (
              <Card key={i} className="overflow-hidden group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-[#E8DDD4] to-[#E8E8E8] flex items-center justify-center">
                  <span className="text-[#B0B0B0]">{product.image}</span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-[#2D2D2D] group-hover:text-[#2AAAA0] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[#F5A623] font-bold">${product.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
