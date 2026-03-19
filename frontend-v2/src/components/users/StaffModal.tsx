"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Loader2, UserPlus, Save } from "lucide-react";
import { Role, User } from "@/types";
import { useCreateUser, useUpdateUser } from "@/hooks/useUsers";
import { useEffect } from "react";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.nativeEnum(Role),
});

type UserFormValues = z.infer<typeof userSchema>;

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export default function StaffModal({ isOpen, onClose, user }: StaffModalProps) {
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const isEdit = !!user;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: Role.WAITER,
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role as Role,
        password: "", // Don't pre-fill password
      });
    } else {
      reset({
        name: "",
        email: "",
        role: Role.WAITER,
        password: "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: UserFormValues) => {
    if (isEdit && user) {
      // For updates, we only send password if it's provided
      const updateData: any = { id: user.id, name: data.name, email: data.email, role: data.role };
      if (data.password) updateData.password = data.password;
      
      updateUser.mutate(updateData, {
        onSuccess: () => {
          onClose();
        }
      });
    } else {
      createUser.mutate(data as any, {
        onSuccess: () => {
          reset();
          onClose();
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-border animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between border-b border-border bg-gray-50/50 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand/10 rounded-lg text-brand">
               {isEdit ? <Save className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                {isEdit ? "Edit Staff Member" : "Add Staff Member"}
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {isEdit ? "Update account details and role" : "New users are Restricted by default"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
            <input
              {...register("name")}
              placeholder="e.g. John Doe"
              className="w-full h-11 px-4 rounded-xl border border-border bg-gray-50 text-sm font-bold focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all placeholder:text-gray-300"
            />
            {errors.name && <p className="text-[10px] font-bold text-danger ml-1 uppercase">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <input
              {...register("email")}
              type="email"
              placeholder="name@restaurant.com"
              className="w-full h-11 px-4 rounded-xl border border-border bg-gray-50 text-sm font-bold focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all placeholder:text-gray-300"
            />
            {errors.email && <p className="text-[10px] font-bold text-danger ml-1 uppercase">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">
              {isEdit ? "New Password (Optional)" : "Password"}
            </label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              className="w-full h-11 px-4 rounded-xl border border-border bg-gray-50 text-sm font-bold focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all placeholder:text-gray-300"
            />
            {errors.password && <p className="text-[10px] font-bold text-danger ml-1 uppercase">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">System Role</label>
            <select
              {...register("role")}
              className="w-full h-11 px-4 rounded-xl border border-border bg-gray-50 text-sm font-bold focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all appearance-none"
            >
              <option value={Role.WAITER}>Staff / Waiter</option>
              <option value={Role.KITCHEN}>Kitchen Staff</option>
              <option value={Role.MANAGER}>Manager</option>
              <option value={Role.ADMIN}>Administrator</option>
              <option value={Role.SUPER_ADMIN}>Super Admin</option>
            </select>
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border border-border text-xs font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 transition-all font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createUser.isPending || updateUser.isPending}
              className="flex-[2] h-12 rounded-xl bg-brand text-xs font-black text-white shadow-lg shadow-brand/20 hover:bg-brand-hover uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center"
            >
              {(createUser.isPending || updateUser.isPending) ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : isEdit ? (
                <Save className="h-4 w-4 mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              {(createUser.isPending || updateUser.isPending) ? "Saving..." : isEdit ? "Update Account" : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
