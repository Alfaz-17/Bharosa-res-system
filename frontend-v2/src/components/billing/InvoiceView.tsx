"use client";

import { Printer, Share2, CreditCard, Banknote, Smartphone, Loader2, FileText, Tag, Hash } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Order, OrderStatus, PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useInvoice, useCreatePayment, useGenerateInvoice } from "@/hooks/useBilling";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

interface InvoiceViewProps {
  order: Order;
}

export default function InvoiceView({ order }: InvoiceViewProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [discount, setDiscount] = useState<number>(0);
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [reference, setReference] = useState<string>("");
  const [optimisticStatus, setOptimisticStatus] = useState<OrderStatus | null>(null);
  const user = useAuthStore(state => state.user);
  
  const { data: invoice, isLoading: isInvoiceLoading } = useInvoice(order.id);
  const generateInvoice = useGenerateInvoice();
  const createPayment = useCreatePayment();

  // Handle invoice generation if missing
  const handleGenerateInvoice = () => {
    generateInvoice.mutate({ orderId: order.id, discount });
  };

  const handleCollectPayment = () => {
    if (!invoice) return;
    
    setOptimisticStatus(OrderStatus.PAID);
    createPayment.mutate({
      orderId: order.id,
      method: paymentMethod,
      amount: invoice.total_amount,
      reference: reference || undefined
    }, {
      onError: () => setOptimisticStatus(null) // Revert on error
    });
  };

  const currentStatus = optimisticStatus || order.status;

  if (isInvoiceLoading || generateInvoice.isPending) {
    return (
      <div className="flex h-64 items-center justify-center bg-white rounded-xl border border-border">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  // If no invoice exists yet
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border-2 border-dashed border-border text-center">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">No Invoice Generated</h3>
        <p className="text-sm text-gray-500 max-w-xs mt-1 mb-6">
          An invoice must be generated before you can collect payment for this order.
        </p>
        
        {showDiscountInput ? (
          <div className="w-full max-w-xs space-y-4 mb-6 text-left animate-in fade-in slide-in-from-top-2">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Apply Discount (₹)</label>
              <button 
                onClick={() => { setShowDiscountInput(false); setDiscount(0); }}
                className="text-[10px] font-bold text-danger uppercase tracking-widest hover:underline"
              >
                Cancel
              </button>
            </div>
            <div className="relative">
               <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
               <input 
                 type="number"
                 placeholder="0.00"
                 className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-gray-50 text-sm font-bold focus:border-brand focus:ring-0 outline-none transition-all"
                 value={discount || ""}
                 onChange={(e) => setDiscount(Number(e.target.value))}
                 autoFocus
               />
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowDiscountInput(true)}
            className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-brand border border-brand/20 bg-brand/5 px-4 py-2 rounded-lg hover:bg-brand/10 transition-all mb-6"
          >
            <Tag className="h-3 w-3" />
            <span>Add Discount</span>
          </button>
        )}

        <button 
          onClick={handleGenerateInvoice}
          className="rounded-xl bg-brand px-8 py-3 text-sm font-black text-white shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all"
        >
          Generate Invoice
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Left Panel: Order Summary */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
          <div className="p-6 border-b border-border bg-gray-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Order Summary</h3>
              <p className="text-xs text-gray-500">Invoice {invoice.invoice_number} • Order #{order.order_number}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-brand bg-white border border-border rounded-lg shadow-sm">
                <Printer className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-brand bg-white border border-border rounded-lg shadow-sm">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4 text-center">Qty</th>
                  <th className="px-6 py-4 text-right">Unit Price</th>
                  <th className="px-6 py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.order_items?.map((item) => (
                  <tr key={item.id} className="text-xs">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{item.menu_item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.menu_item.category?.name || 'Item'}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-700">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{formatCurrency(item.price)}</td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50/30 border-t border-border flex justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order Notes</p>
              <p className="text-xs text-gray-600 italic">
                {order.notes || "No special instructions provided."}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billed By</p>
              <p className="text-xs font-bold text-gray-700">{user?.name || 'Staff'} ({user?.role || 'User'})</p>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start space-x-3">
          <FileText className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-amber-800 font-medium leading-relaxed">
            <p className="font-black uppercase tracking-widest mb-1 text-amber-600">Accounting Note</p>
            This invoice data is fetched directly from the backend. The total includes the subtotal of items and the applicable restaurant tax rate. 
            Once payment is recorded, this invoice will be marked as <span className="font-bold">PAID</span> in the system.
          </div>
        </div>
      </div>

      {/* Right Panel: Payment & Totals */}
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-card border border-border p-6 space-y-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Select Payment Method</h3>
          
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: PaymentMethod.CASH, icon: Banknote, label: "Cash" },
              { id: PaymentMethod.CARD, icon: CreditCard, label: "Card" },
              { id: PaymentMethod.UPI, icon: Smartphone, label: "UPI" },
            ].map((method) => (
              <button 
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all space-y-2",
                  paymentMethod === method.id ? "border-brand bg-brand/5 text-brand" : "border-border text-gray-500 hover:bg-gray-50"
                )}
              >
                <method.icon className="h-6 w-6" />
                <span className="text-[10px] font-bold uppercase">{method.label}</span>
              </button>
            ))}
          </div>

          {(paymentMethod === PaymentMethod.UPI || paymentMethod === PaymentMethod.CARD) && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
               <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Reference Number</label>
               <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Ref or Auth ID"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-gray-50 text-xs font-bold focus:border-brand focus:ring-0 outline-none transition-all"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
               </div>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Subtotal</span>
              <span className="font-bold">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Tax Amount</span>
              <span className="font-bold">{formatCurrency(invoice.tax_amount)}</span>
            </div>
            {Number(invoice.discount_amount) > 0 && (
              <div className="flex justify-between items-center text-xs text-danger">
                <span>Discount</span>
                <span className="font-bold">-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            <div className="border-b border-border border-dashed pb-2" />
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-black text-gray-900 uppercase">Total</span>
              <span className="text-2xl font-black text-brand tracking-tighter">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>

          <button 
            onClick={handleCollectPayment}
            disabled={createPayment.isPending || currentStatus === OrderStatus.PAID}
            className="w-full flex items-center justify-center rounded-xl bg-sidebar py-4 text-sm font-black text-white shadow-lg shadow-sidebar/20 hover:bg-gray-800 tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {createPayment.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            {currentStatus === OrderStatus.PAID ? "Payment Collected" : `Collect ${formatCurrency(invoice.total_amount)}`}
          </button>
          
          <p className="text-[10px] text-center text-gray-400 font-medium">
            By clicking "Collect Payment", the payment will be recorded via <strong>{paymentMethod}</strong> and the order status will be synchronized.
          </p>
        </div>
      </div>
    </div>
  );
}
