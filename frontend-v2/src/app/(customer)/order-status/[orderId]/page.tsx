"use client";

import Link from "next/link";
import { useOrder } from "@/hooks/useOrders";
import { Loader2, CheckCircle2, Clock, ChefHat, UtensilsCrossed, Home } from "lucide-react";
import { OrderStatus } from "@/types";
import { useWebSocket } from "@/lib/websocket";
import { useQueryClient } from "@tanstack/react-query";

const steps = [
  { status: OrderStatus.CREATED, label: "Order Placed", icon: CheckCircle2, message: "Your order has been received!" },
  { status: OrderStatus.CONFIRMED, label: "Confirmed", icon: Clock, message: "Great! The restaurant has confirmed your order." },
  { status: OrderStatus.IN_KITCHEN, label: "Cooking", icon: ChefHat, message: "Hang tight! Your order is being prepared 🍳" },
  { status: OrderStatus.READY, label: "Ready", icon: UtensilsCrossed, message: "Your food is ready! The waiter is on their way 🎉" },
  { status: OrderStatus.SERVED, label: "Served", icon: CheckCircle2, message: "Enjoy your meal! Bon appétit! 😊" },
  { status: OrderStatus.PAID, label: "Paid", icon: CheckCircle2, message: "Thank you for visiting! See you again soon! ❤️" },
];

const funMessages: Record<string, string> = {
  [OrderStatus.CREATED]: "We received your order! 📋",
  [OrderStatus.CONFIRMED]: "Order confirmed! Kitchen is notified 👌",
  [OrderStatus.IN_KITCHEN]: "Hang tight! Your order is being prepared 🍳",
  [OrderStatus.READY]: "Your food is ready! Waiter is coming 🚀",
  [OrderStatus.SERVED]: "Enjoy your meal! Bon Appétit! 😊",
  [OrderStatus.PAID]: "Payment received! Thank you! ❤️",
};

export default function OrderStatusPage({ params }: { params: { orderId: string } }) {
  const { data: order, isLoading } = useOrder(params.orderId);
  const queryClient = useQueryClient();

  useWebSocket((message) => {
    console.log("WS Message received in Order Status:", message);
    if (message.type === 'ORDER_UPDATED' && message.data.order_id === params.orderId) {
       queryClient.invalidateQueries({ queryKey: ["order", params.orderId] });
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
          <p className="text-gray-500 mt-2">We couldn't find the order you're looking for.</p>
          <Link href="/" className="mt-4 inline-block text-brand font-bold underline">Go Home</Link>
        </div>
      </div>
    );
  }

  const currentStatus = order.status;
  const currentStepIndex = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-black text-gray-900">Order #{order.order_number}</h1>
            <p className="text-xs text-gray-400 font-medium">Live tracking updates</p>
          </div>
          <span className="inline-flex items-center rounded-full bg-success/10 border border-success/20 px-3 py-1 text-xs font-black text-success animate-pulse">
            ● Live
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-10 space-y-10">
        {/* Current Status Hero */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="h-24 w-24 rounded-full bg-brand/10 flex items-center justify-center border-4 border-brand/20">
              {(() => {
                const CurrentIcon = steps[currentStepIndex]?.icon || Clock;
                return <CurrentIcon className="h-12 w-12 text-brand" />;
              })()}
            </div>
            {currentStatus !== OrderStatus.SERVED && (
              <span className="absolute inset-0 rounded-full border-4 border-brand animate-ping opacity-20" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">{steps[currentStepIndex]?.label || "Processing"}</h2>
            <p className="mt-2 text-sm text-gray-500 font-medium">{funMessages[currentStatus]}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200" />
          <div
            className="absolute left-6 top-6 w-0.5 bg-brand transition-all duration-700"
            style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />

          <div className="space-y-8 relative">
            {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.status} className="flex items-start space-x-5">
                  <div className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    isCompleted ? "bg-brand border-brand" :
                    isCurrent ? "bg-white border-brand shadow-lg shadow-brand/20" :
                    "bg-white border-gray-200"
                  }`}>
                    <Icon className={`h-5 w-5 ${isCompleted ? "text-white" : isCurrent ? "text-brand" : "text-gray-300"}`} />
                  </div>
                  <div className="flex-1 pt-2.5">
                    <p className={`text-sm font-black ${isCompleted || isCurrent ? "text-gray-900" : "text-gray-300"}`}>
                      {step.label}
                    </p>
                    {isCurrent && (
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">{step.message}</p>
                    )}
                    {isCompleted && (
                      <p className="text-xs text-success font-bold mt-0.5">✓ Completed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Home Link */}
        <div className="pt-4 text-center">
          <Link
            href={`/menu/${order.table_number}`}
            className="inline-flex items-center text-sm font-black text-brand underline underline-offset-4"
          >
            <Home className="mr-2 h-4 w-4" /> Order more items
          </Link>
        </div>
      </div>
    </div>
  );
}
