"use client";

import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { Plus, Package, Edit, Trash2, ShieldCheck, AlertTriangle } from "lucide-react";
import EquipmentLoading from "./loading";

const CATEGORIES = ["SMD", "SOUND", "LIGHTING", "STALL_FABRICATION", "OTHER"];
const STATUSES = ["AVAILABLE", "IN_USE", "MAINTENANCE", "RETIRED"];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    category: "SMD",
    status: "AVAILABLE",
    serial_number: "",
    notes: ""
  });

  const { addToast } = useToast();

  const loadEquipment = async () => {
    const { data, error } = await fetchApi("/api/equipment/");
    if (data) setEquipment(data);
    else if (error) addToast(error, "error");
    setLoading(false);
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const openCreate = () => {
    setFormData({ id: 0, name: "", category: "SMD", status: "AVAILABLE", serial_number: "", notes: "" });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEdit = (item: any) => {
    setFormData({ ...item });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const endpoint = isEditing ? `/api/equipment/${formData.id}` : "/api/equipment/";
    const method = isEditing ? "PUT" : "POST";
    
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
      addToast(isEditing ? "Equipment updated" : "Equipment added", "success");
      setModalOpen(false);
      loadEquipment();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this equipment?")) return;
    
    const { error } = await fetchApi(`/api/equipment/${id}`, { method: "DELETE" });
    if (error) {
      addToast(error, "error");
    } else {
      addToast("Equipment deleted", "success");
      loadEquipment();
    }
  };

  if (loading && equipment.length === 0) return <EquipmentLoading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Equipment Inventory</h1>
          <p className="text-muted">Manage your physical assets and their availability.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Equipment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {equipment.length > 0 ? equipment.map((item) => (
          <Card key={item.id} className="p-5 flex flex-col hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold tracking-wider text-muted uppercase">{item.category}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="text-muted hover:text-white p-1" title="Edit">
                  <Edit className="w-3 h-3" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-muted hover:text-danger p-1" title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{item.name}</h3>
            <p className="text-xs text-muted font-mono mb-4">SN: {item.serial_number || "N/A"}</p>
            
            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded ${
                item.status === "AVAILABLE" ? "bg-success/10 text-success" :
                item.status === "IN_USE" ? "bg-blue-500/10 text-blue-500" :
                item.status === "MAINTENANCE" ? "bg-accent/10 text-accent" :
                "bg-danger/10 text-danger"
              }`}>
                {item.status === "AVAILABLE" && <ShieldCheck className="w-3 h-3" />}
                {item.status === "IN_USE" && <Package className="w-3 h-3" />}
                {item.status === "MAINTENANCE" && <AlertTriangle className="w-3 h-3" />}
                {item.status === "RETIRED" && <Trash2 className="w-3 h-3" />}
                {item.status.replace("_", " ")}
              </div>
            </div>
          </Card>
        )) : (
          <div className="col-span-full text-center py-12 text-muted bg-surface-2/50 rounded-2xl border border-white/5">
            No equipment found in inventory.
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit Equipment" : "Add Equipment"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Equipment Name *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent appearance-none">
                {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-surface">{cat.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent appearance-none">
                {STATUSES.map(s => <option key={s} value={s} className="bg-surface">{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Serial Number</label>
            <input type="text" value={formData.serial_number} onChange={e => setFormData({...formData, serial_number: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent font-mono" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent resize-none h-20" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={actionLoading}>{isEditing ? "Save Changes" : "Add Equipment"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
