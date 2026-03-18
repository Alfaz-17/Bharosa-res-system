"use client";

import { useState } from "react";
import { X, Search, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { MenuItem } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";

import { useMenuItems } from "@/hooks/useMenu";
import { useCreateOrder } from "@/hooks/useOrders";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewOrderModal({ isOpen, onClose }: NewOrderModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number; notes: string }[]>([]);
  
  const { data: menuItems, isLoading } = useMenuItems();
  const createOrder = useCreateOrder();

  if (!isOpen) return null;

  const filteredItems = menuItems?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) && item.is_available
  ) || [];

  const addToCart = (item: MenuItem) => {
    const existing = cart.find(c => c.item.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { item, quantity: 1, notes: "" }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    const existing = cart.find(c => c.item.id === itemId);
    if (existing && existing.quantity > 1) {
      setCart(cart.map(c => c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c));
    } else {
      setCart(cart.filter(c => c.item.id !== itemId));
    }
  };

  const updateNotes = (itemId: string, notes: string) => {
    setCart(cart.map(c => c.item.id === itemId ? { ...c, notes } : c));
  };

  const total = cart.reduce((sum, c) => sum + (c.item.price || 0) * c.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!tableNumber) return toast.error("Please enter a table number");
    if (cart.length === 0) return toast.error("Please add at least one item");

    createOrder.mutate({
      table_number: tableNumber,
      items: cart.map(c => ({
        menu_item_id: c.item.id,
        quantity: c.quantity,
        notes: c.notes
      }))
    }, {
      onSuccess: () => {
        toast.success("Order placed successfully!");
        onClose();
        setCart([]);
        setTableNumber("");
      }
    });
  };

  const isSubmitting = createOrder.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-opacity animate-in fade-in duration-200">
      <div className="flex h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Left Side - Item Selection */}
        <div className="flex flex-1 flex-col border-r border-border min-w-0">
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create New Order</h2>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                className="h-10 w-full rounded-lg border border-border bg-surface pl-10 pr-4 text-sm focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-brand animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="group relative flex flex-col rounded-xl border border-border bg-white p-3 text-left transition-all hover:border-brand hover:shadow-md active:scale-[0.98]"
                  >
                    <div className="relative aspect-square w-full mb-3 overflow-hidden rounded-lg bg-surface">
                      <img src={item.image_url || "/placeholder-food.png"} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                    <p className="mt-1 text-xs font-black text-brand">{formatCurrency(item.price || 0)}</p>
                    <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-brand text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Cart & Order Detail */}
        <div className="flex w-96 flex-col bg-gray-50">
          <div className="p-6 border-b border-border bg-white flex justify-between items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Order Cart</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4 bg-white border-b border-border">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Table Number</label>
              <input
                type="text"
                placeholder="Ex: 05"
                className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-4 text-sm font-bold focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-8">
                <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-40">Cart is empty</p>
                <p className="text-xs mt-1">Select items from the left to start an order</p>
              </div>
            ) : (
              cart.map(c => (
                <div key={c.item.id} className="bg-white rounded-xl border border-border p-4 shadow-sm animate-in slide-in-from-right-2 duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-bold text-gray-900">{c.item.name}</h5>
                      <p className="text-xs text-brand font-bold">{formatCurrency(c.item.price || 0)}</p>
                    </div>
                    <div className="flex items-center space-x-3 bg-surface rounded-lg p-1">
                      <button onClick={() => removeFromCart(c.item.id!)} className="h-6 w-6 flex items-center justify-center rounded bg-white border border-border text-gray-600 hover:text-brand transition-colors">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-xs font-black w-4 text-center">{c.quantity}</span>
                      <button onClick={() => addToCart(c.item)} className="h-6 w-6 flex items-center justify-center rounded bg-white border border-border text-gray-600 hover:text-brand transition-colors">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Add notes..."
                    className="mt-3 w-full bg-transparent border-0 border-b border-gray-100 h-6 text-[11px] font-medium text-gray-500 focus:border-brand focus:ring-0 outline-none transition-all"
                    value={c.notes}
                    onChange={(e) => updateNotes(c.item.id!, e.target.value)}
                  />
                </div>
              ))
            )}
          </div>

          <div className="p-6 bg-white border-t border-border space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">Total Amount</span>
              <span className="text-xl font-black text-gray-900">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || cart.length === 0}
              className="w-full flex items-center justify-center rounded-xl bg-brand py-4 text-sm font-black text-white shadow-lg shadow-brand/20 hover:bg-brand-hover tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing...
                </>
              ) : (
                "Place Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
