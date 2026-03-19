"use client";

import { UserPlus, Mail, Clock, Loader2, Trash2, Edit2, Power } from "lucide-react";
import { Role, User } from "@/types";
import { useUsers, useDeleteUser, useUpdateUser } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import StaffModal from "@/components/users/StaffModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { useWebSocket } from "@/lib/websocket";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import AuthGuard from "@/components/auth/AuthGuard";

const roleStyles: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "bg-purple-100 text-purple-700 font-black",
  [Role.ADMIN]: "bg-red-100 text-red-700 font-black",
  [Role.MANAGER]: "bg-blue-100 text-blue-700 font-black",
  [Role.WAITER]: "bg-green-100 text-green-700 font-black",
  [Role.KITCHEN]: "bg-orange-100 text-orange-700 font-black",
};

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<User | null>(null);

  // Listen for real-time updates to refresh staff list
  useWebSocket(() => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  });
  
  const handleDelete = (id: string) => {
    deleteUser.mutate(id, {
      onSuccess: () => setDeleteConfirm(null)
    });
  };

  const handleToggleActive = (user: User) => {
    updateUser.mutate({ id: user.id, is_active: !user.is_active }, {
      onSuccess: () => setStatusConfirm(null)
    });
  };

  const openAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-brand animate-spin" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading staff database...</p>
      </div>
    );
  }

  const isSuperAdmin = currentUser?.role === Role.SUPER_ADMIN;

  return (
    <AuthGuard allowedRoles={[Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER]}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">User Management</h1>
            <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider">Manage your restaurant staff and access levels</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex h-12 items-center justify-center rounded-xl bg-brand px-6 text-xs font-black text-white shadow-lg shadow-brand/20 hover:bg-brand-hover uppercase tracking-widest transition-all active:scale-[0.98]"
          >
            <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((u) => (
            <div key={u.id} className="group relative flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-brand text-xl font-black ring-1 ring-border shadow-inner uppercase">
                    {u.name.substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 uppercase tracking-tight">{u.name}</h3>
                    <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase mt-1">
                      <Mail className="mr-1 h-3 w-3" /> {u.email}
                    </div>
                  </div>
                </div>
                <span className={`rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm ${roleStyles[u.role as Role]}`}>
                  {u.role}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Status</p>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${u.is_active ? "bg-success animate-pulse" : "bg-gray-300"}`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${u.is_active ? "text-success" : "text-gray-400"}`}>
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Last Active</p>
                  <div className="flex items-center justify-end text-[11px] font-black text-gray-600 uppercase tracking-tight">
                    <Clock className="mr-1 h-3 w-3 opacity-40" />
                    {u.updated_at ? new Date(u.updated_at).toLocaleDateString() : "Never"}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center space-x-2">
                <button 
                  onClick={() => openEditModal(u)}
                  className="flex-1 flex h-10 items-center justify-center rounded-xl bg-gray-50 text-[10px] font-black text-gray-600 uppercase tracking-widest hover:bg-brand hover:text-white transition-all transition-all"
                >
                  <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                </button>
                
                <button 
                  onClick={() => setStatusConfirm(u)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-gray-400 hover:text-brand hover:bg-brand/5 transition-all"
                  title={u.is_active ? "Deactivate" : "Activate"}
                >
                  <Power className={cn("h-4 w-4", !u.is_active && "text-brand filled")} />
                </button>

                {isSuperAdmin && u.id !== currentUser?.id && (
                  <button 
                    onClick={() => setDeleteConfirm(u.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    title="Remove Account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {!u.is_active && (
                <div className="absolute inset-x-0 bottom-0 top-[100px] bg-white/60 backdrop-blur-[1px] rounded-b-2xl pointer-events-none flex items-center justify-center">
                  <span className="bg-white/80 border border-border px-4 py-2 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shadow-xl">Account Restricted</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <StaffModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          user={editingUser}
        />

        <ConfirmDialog 
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
          title="Remove Staff Member"
          description="Are you absolutely sure? This action will permanently delete this account and all associated history. This cannot be undone."
          confirmText="Yes, Delete Account"
          variant="danger"
          isLoading={deleteUser.isPending}
        />

        <ConfirmDialog 
          isOpen={!!statusConfirm}
          onClose={() => setStatusConfirm(null)}
          onConfirm={() => statusConfirm && handleToggleActive(statusConfirm)}
          title={statusConfirm?.is_active ? "Deactivate Account" : "Activate Account"}
          description={statusConfirm?.is_active 
            ? "This user will no longer be able to log in or access any system features until reactivated."
            : "Access will be restored immediately for this user."
          }
          confirmText={statusConfirm?.is_active ? "Deactivate" : "Activate"}
          variant={statusConfirm?.is_active ? "danger" : "brand"}
          isLoading={updateUser.isPending}
        />
      </div>
    </AuthGuard>
  );
}
