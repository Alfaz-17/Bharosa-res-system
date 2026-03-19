"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { ArrowLeft, Minus, Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

import { useCartStore } from "@/store/cartStore";
import { useCreateOrder } from "@/hooks/useOrders";

function CartContent() {
  const params = useSearchParams();
  const router = useRouter();
  const tableNumber = params.get("table") || "1";
  const { items, addItem, removeItem, updateNotes, clearCart, totalAmount } = useCartStore();
  const createOrder = useCreateOrder();
  const [orderNotes, setOrderNotes] = useState("");

  const subtotal = totalAmount();
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return toast.error("Your cart is empty");
    
    createOrder.mutate({
      table_number: tableNumber,
      notes: orderNotes,
      items: items.map(i => ({
        menu_item_id: i.item.id,
        quantity: i.quantity,
        notes: i.notes
      }))
    }, {
      onSuccess: (data: any) => {
        clearCart();
        router.push(`/order-status/${data.id}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-black text-gray-900">Your Order</h1>
            <p className="text-xs text-gray-400 font-medium">Table {tableNumber} • {items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
            <div className="text-6xl mb-4">🛒</div>
            <p className="font-black uppercase tracking-widest">Cart is empty</p>
            <button onClick={() => router.back()} className="mt-6 text-brand font-black underline text-sm">← Browse Menu</button>
          </div>
        ) : (
          items.map(i => (
            <div key={i.item.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-gray-900 text-sm truncate">{i.item.name}</h4>
                <p className="text-xs font-bold text-brand mt-0.5">{formatCurrency(i.item.price || 0)} each</p>
                <input
                  type="text"
                  placeholder="Add special notes..."
                  className="mt-2 w-full bg-transparent border-b border-gray-100 text-[11px] text-gray-500 outline-none focus:border-brand transition-colors py-1"
                  value={i.notes}
                  onChange={e => updateNotes(i.item.id!, e.target.value)}
                />
              </div>
              <div className="flex flex-col items-end space-y-3 shrink-0">
                <p className="font-black text-gray-900">{formatCurrency((i.item.price || 0) * i.quantity)}</p>
                <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-1 py-1">
                  <button onClick={() => removeItem(i.item.id!)} className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:text-danger transition-colors">
                    {i.quantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  </button>
                  <span className="text-sm font-black w-4 text-center">{i.quantity}</span>
                  <button onClick={() => addItem(i.item)} className="h-6 w-6 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm hover:text-brand transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Order Notes */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <label className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              <FileText className="h-3.5 w-3.5" /> <span>Order Notes (Optional)</span>
            </label>
            <textarea
              rows={3}
              placeholder="Any special requests for the kitchen? (e.g. less spicy, no onions...)"
              className="w-full rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition-all"
              value={orderNotes}
              onChange={e => setOrderNotes(e.target.value)}
            />
          </div>
        )}

        {/* Bill Summary */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 pb-2 border-b border-gray-100">Bill Summary</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 border-b border-dashed border-gray-100 pb-3">
              <span>GST (5%)</span>
              <span className="font-bold">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-1">
              <span className="text-base font-black text-gray-900">Total</span>
              <span className="text-xl font-black text-brand">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        {items.length > 0 && (
          <button
            onClick={handlePlaceOrder}
            disabled={createOrder.isPending}
            className="w-full flex items-center justify-center rounded-2xl bg-gray-900 py-5 text-sm font-black text-white shadow-xl tracking-widest uppercase transition-all active:scale-[0.98] hover:bg-gray-800 disabled:opacity-60"
          >
            {createOrder.isPending ? (
              <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Placing Order...</>
            ) : (
              <>Place Order · {formatCurrency(total)}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    }>
      <CartContent />
    </Suspense>
  );
}
