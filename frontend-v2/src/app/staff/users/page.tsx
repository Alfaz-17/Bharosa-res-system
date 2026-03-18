"use client";

import { Plus, MoreHorizontal, UserPlus, Shield, Mail, Clock, Loader2, Trash2 } from "lucide-react";
import { Role } from "@/types";
import { useUsers, useDeleteUser } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import AddStaffModal from "@/components/users/AddStaffModal";

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
  const { user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      deleteUser.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Staff Management</h1>
          <p className="text-sm text-gray-500 font-medium tracking-wide">Manage your team, roles, and system access.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center rounded-lg bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover transition-all"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Add Staff Member
        </button>
      </div>

      <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="rounded-xl border border-border bg-white shadow-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <th className="px-6 py-5">Staff Member</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users?.map((user) => (
              <tr key={user.id} className="table-row-hover">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-gray-600 font-black text-xs ring-1 ring-border">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900">{user.name}</p>
                      <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        <Mail className="mr-1 h-3 w-3" /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge uppercase tracking-widest text-[9px] px-3 py-1 rounded-full ${roleStyles[user.role as Role]}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <div className={`h-1.5 w-1.5 rounded-full mr-2 ${user.last_active ? 'bg-success' : 'bg-gray-300'}`} />
                      <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                        {user.last_active ? "Onlineish" : "Offline"}
                      </span>
                    </div>
                    {user.last_active && (
                      <span className="text-[8px] text-gray-400 font-bold uppercase mt-0.5 ml-3.5">
                        Active {new Date(user.last_active).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    {currentUser?.role === Role.SUPER_ADMIN && user.id !== currentUser.id && (
                      <button 
                        onClick={() => handleDelete(user.id)}
                        disabled={deleteUser.isPending}
                        className="p-2 text-gray-400 hover:text-danger transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Access Control Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm font-bold">
          <div className="h-10 w-10 rounded-lg bg-orange-50 flex items-center justify-center text-brand mb-4">
             <Shield className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Role Permissions</h4>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            Ensure staff members have only the access they need. <strong>Waiters</strong> can manage orders, while <strong>Managers</strong> have access to menu and analytics.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm font-bold">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-info mb-4">
             <UserPlus className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Inviting Staff</h4>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            When adding new staff, they will receive an email with their temporary credentials and login instructions.
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-border shadow-sm font-bold">
          <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-success mb-4">
             <Clock className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-2">Login Activity</h4>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
            Monitor last active status to track system usage. Unusual activity can be flagged for security review.
          </p>
        </div>
      </div>
    </div>
  );
}
