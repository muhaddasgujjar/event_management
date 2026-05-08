"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { Plus, User as UserIcon, Mail, Shield, Trash2, Edit } from "lucide-react";
import UsersLoading from "./loading";
import { ROLES } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const router = useRouter();
  
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    email: "",
    password: "", // only for create
    full_name: "",
    role: "STAFF",
    is_active: true
  });

  const { addToast } = useToast();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/admin/dashboard");
      return;
    }
    loadUsers();
  }, [isAdmin, loading]);

  const loadUsers = async () => {
    const { data, error } = await fetchApi("/api/users/");
    if (data) setUsers(data);
    else if (error) addToast(error, "error");
    setLoading(false);
  };

  const openCreate = () => {
    setFormData({ id: 0, email: "", password: "", full_name: "", role: "STAFF", is_active: true });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (user: any) => {
    setFormData({ ...user, password: "" }); // Never show password, only allow update
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const endpoint = isEditing ? `/api/users/${formData.id}` : "/api/users/";
    const method = isEditing ? "PUT" : "POST";
    
    const payload = { ...formData };
    if (!isEditing) {
      delete (payload as any).id;
      delete (payload as any).is_active; // Server sets this on creation typically, or handles it
    } else {
      delete (payload as any).password; // Don't send empty password on update unless implemented in API
    }

    const { error } = await fetchApi(endpoint, {
      method,
      data: payload
    });

    setActionLoading(false);

    if (error) {
      addToast(error, "error");
    } else {
      addToast(isEditing ? "User updated" : "User created", "success");
      setModalOpen(false);
      loadUsers();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return;
    
    // Most systems deactivate rather than delete, assuming delete endpoint exists or we use PUT
    const { error } = await fetchApi(`/api/users/${id}`, { method: "DELETE" });
    if (error) {
      addToast(error, "error");
    } else {
      addToast("User deactivated", "success");
      loadUsers();
    }
  };

  if (loading) return <UsersLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Team Management</h1>
          <p className="text-muted">Manage system access and roles for H&B staff.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-sm border-b border-white/5">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.length > 0 ? users.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted flex items-center gap-2 h-[72px]">
                    <Mail className="w-3 h-3" /> {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded w-fit ${
                      user.role === ROLES.ADMIN ? "bg-accent/10 text-accent" : 
                      user.role === ROLES.SALES ? "bg-blue-500/10 text-blue-500" :
                      "bg-surface text-muted border border-white/5"
                    }`}>
                      <Shield className="w-3 h-3" />
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${user.is_active ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                      {user.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(user)} className="p-2 text-muted hover:text-white transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.is_active && (
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-muted hover:text-danger transition-colors" title="Deactivate">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit User" : "New User"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Full Name *</label>
            <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Email Address *</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" disabled={isEditing} />
            {isEditing && <p className="text-xs text-muted mt-1">Email cannot be changed after creation.</p>}
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password *</label>
              <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!isEditing} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Role</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent appearance-none">
              {Object.values(ROLES).map(r => <option key={r} value={r} className="bg-surface">{r}</option>)}
            </select>
          </div>

          {isEditing && (
            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="active" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 accent-accent" />
              <label htmlFor="active" className="text-sm text-white">Account is active</label>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={actionLoading}>{isEditing ? "Save Changes" : "Create User"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
