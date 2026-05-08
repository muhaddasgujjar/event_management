"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { Plus, Building, Phone, Mail, FileText, Trash2, Edit } from "lucide-react";
import ClientsLoading from "./loading";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    total_spent: 0
  });

  const { addToast } = useToast();

  const loadClients = async () => {
    const { data, error } = await fetchApi("/api/clients/");
    if (data) setClients(data);
    else if (error) addToast(error, "error");
    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const openCreate = () => {
    setFormData({ id: 0, company_name: "", contact_person: "", email: "", phone: "", total_spent: 0 });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (client: any) => {
    setFormData({ ...client });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const endpoint = isEditing ? `/api/clients/${formData.id}` : "/api/clients/";
    const method = isEditing ? "PUT" : "POST";
    
    // Total spent shouldn't be manually edited normally, but keeping it for completeness if API supports it
    const payload = { ...formData };
    if (!isEditing) delete (payload as any).id;

    const { error } = await fetchApi(endpoint, {
      method,
      data: payload
    });

    setActionLoading(false);

    if (error) {
      addToast(error, "error");
    } else {
      addToast(isEditing ? "Client updated" : "Client created", "success");
      setModalOpen(false);
      loadClients();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    
    const { error } = await fetchApi(`/api/clients/${id}`, { method: "DELETE" });
    if (error) {
      addToast(error, "error");
    } else {
      addToast("Client deleted", "success");
      loadClients();
    }
  };

  if (loading && clients.length === 0) return <ClientsLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Client Management</h1>
          <p className="text-muted">Manage your client roster and contact information.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-sm border-b border-white/5">
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Contact Person</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Total Spent</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.length > 0 ? clients.map((client) => (
                <tr key={client.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{client.company_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{client.contact_person}</td>
                  <td className="px-6 py-4 text-muted flex items-center gap-2">
                    <Mail className="w-3 h-3" /> {client.email}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" /> {client.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-success font-medium">
                    PKR {client.total_spent?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(client)} className="p-2 text-muted hover:text-white transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(client.id)} className="p-2 text-muted hover:text-danger transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted">No clients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit Client" : "New Client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Company Name *</label>
            <input type="text" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Contact Person *</label>
            <input type="text" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email Address *</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Phone Number *</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={actionLoading}>{isEditing ? "Save Changes" : "Create Client"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
