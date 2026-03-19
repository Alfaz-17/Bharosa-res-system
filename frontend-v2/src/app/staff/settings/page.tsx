"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, Building2, Phone, Mail, Globe, DollarSign, Percent } from "lucide-react";
import { toast } from "sonner";
import { useRestaurant, useUpdateRestaurant } from "@/hooks/useRestaurant";
import AuthGuard from "@/components/auth/AuthGuard";
import { Role } from "@/types";

export default function SettingsPage() {
  const { data: restaurant, isLoading } = useRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    currency: "INR",
    timezone: "Asia/Kolkata",
    tax_rate: 0,
  });

  useEffect(() => {
    if (restaurant) {
      setForm({
        name: restaurant.name || "",
        address: restaurant.address || "",
        phone: restaurant.phone || "",
        email: restaurant.email || "",
        currency: restaurant.currency || "INR",
        timezone: restaurant.timezone || "Asia/Kolkata",
        tax_rate: Number(restaurant.tax_rate) || 0,
      });
    }
  }, [restaurant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurant.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const inputClass = "mt-1.5 h-10 w-full rounded-lg border border-border bg-white px-4 text-sm font-medium text-gray-800 focus:border-brand focus:ring-1 focus:ring-brand outline-none transition-all";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400";

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER]}>
      <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Restaurant Settings</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Manage your restaurant profile, tax rates, and regional preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-border shadow-card p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-border">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Restaurant Profile</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Basic information and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Restaurant Name</label>
              <input name="name" value={form.name} onChange={handleChange} className={inputClass} placeholder="Your Restaurant Name" required />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <input name="address" value={form.address} onChange={handleChange} className={inputClass} placeholder="Full address" />
            </div>
            <div>
              <label className={labelClass}>Phone Number</label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input name="phone" value={form.phone} onChange={handleChange} className={`${inputClass} mt-0 pl-9`} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Address</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input name="email" type="email" value={form.email} onChange={handleChange} className={`${inputClass} mt-0 pl-9`} placeholder="contact@restaurant.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Regional & Tax Section */}
        <div className="bg-white rounded-xl border border-border shadow-card p-8 space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-border">
            <div className="h-9 w-9 rounded-lg bg-info/10 flex items-center justify-center text-info">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Regional & Billing</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Currency, timezone and tax settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className={labelClass}>Currency</label>
              <select name="currency" value={form.currency} onChange={handleChange} className={inputClass}>
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
                <option value="EUR">€ EUR — Euro</option>
                <option value="GBP">£ GBP — British Pound</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Timezone</label>
              <select name="timezone" value={form.timezone} onChange={handleChange} className={inputClass}>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Tax Rate (%)</label>
              <div className="relative mt-1.5">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  name="tax_rate"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={form.tax_rate}
                  onChange={handleChange}
                  className={`${inputClass} mt-0 pl-9`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {updateRestaurant.isPending ? "Saving changes..." : "Everything up to date"}
          </p>
          <button
            type="submit"
            disabled={updateRestaurant.isPending}
            className="flex items-center rounded-xl bg-brand px-8 py-3 text-sm font-black text-white shadow-lg shadow-brand/20 hover:bg-brand-hover tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {updateRestaurant.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {updateRestaurant.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
    </AuthGuard>
  );
}
