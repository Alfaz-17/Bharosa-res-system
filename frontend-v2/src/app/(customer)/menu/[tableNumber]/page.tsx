"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, Star } from "lucide-react";
import { MenuItem, MenuCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useCategories, useMenuItems } from "@/hooks/useMenu";
import { useCartStore } from "@/store/cartStore";

export default function CustomerMenuPage({ params }: { params: { tableNumber: string } }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const { addItem, removeItem, items: cartItems, totalItems, totalAmount } = useCartStore();

  const { data: categories, isLoading: isCatsLoading } = useCategories();
  const { data: menuItems, isLoading: isItemsLoading } = useMenuItems();

  const isLoading = isCatsLoading || isItemsLoading;

  const filteredItems = activeCategory === "all"
    ? menuItems?.filter(item => item.is_available)
    : menuItems?.filter(item => item.category?.id === activeCategory && item.is_available);

  const cartQuantity = (id: string) => cartItems.find(c => c.item.id === id)?.quantity || 0;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Restaurant Menu</h1>
              <p className="text-xs text-gray-500 font-medium">Dine-in Menu</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-black text-brand border border-brand/20">
              Table {params.tableNumber}
            </span>
          </div>

          {/* Category Pills */}
          <div className="mt-4 flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                activeCategory === "all"
                  ? "bg-brand text-white shadow-sm shadow-brand/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Items
            </button>
            {categories?.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeCategory === cat.id
                    ? "bg-brand text-white shadow-sm shadow-brand/30"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {filteredItems?.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No items found in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredItems?.map(item => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={item.image_url || "/placeholder-menu.jpg"}
                    alt={item.name!}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <span className="flex items-center rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-black text-amber-500">
                      <Star className="mr-1 h-3 w-3 fill-amber-400 text-amber-400" /> 4.8
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-black text-gray-900 text-sm">{item.name}</h3>
                  <p className="mt-1 text-[11px] text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-black text-gray-900">{formatCurrency(item.price || 0)}</span>
                    {cartQuantity(item.id!) > 0 ? (
                      <div className="flex items-center space-x-2 bg-brand rounded-full px-1 py-1">
                        <button
                          onClick={() => removeItem(item.id!)}
                          className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-white text-sm font-black w-4 text-center">{cartQuantity(item.id!)}</span>
                        <button
                          onClick={() => addItem(item)}
                          className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(item)}
                        className="flex items-center rounded-full bg-brand/10 border border-brand/20 px-3 py-1.5 text-xs font-black text-brand hover:bg-brand hover:text-white transition-all"
                      >
                        <Plus className="mr-1 h-3 w-3" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sticky Cart Bar */}
      {totalItems() > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4">
          <Link
            href={`/cart?table=${params.tableNumber}`}
            className="flex w-full max-w-2xl items-center justify-between rounded-2xl bg-gray-900 px-5 py-4 shadow-2xl transition-all hover:bg-gray-800 active:scale-[0.98]"
          >
            <div className="flex items-center space-x-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
                <ShoppingCart className="h-5 w-5 text-white" />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-gray-900 border-2 border-gray-900">
                  {totalItems()}
                </span>
              </div>
              <div>
                <p className="text-xs font-black text-white">{totalItems()} item{totalItems() > 1 ? "s" : ""} in cart</p>
                <p className="text-[10px] text-gray-400">Tap to review your order</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-black text-white">{formatCurrency(totalAmount())}</span>
              <span className="rounded-lg bg-brand px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-widest">
                View Cart →
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
