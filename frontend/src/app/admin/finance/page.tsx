"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import {
  Truck, Monitor, Layers, Users, Plus, Trash2, Edit,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock,
  ChevronDown, ChevronUp,
} from "lucide-react";

// ─── types ────────────────────────────────────────────────────────────────────

type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";
type PaymentMethod = "CASH" | "BANK_TRANSFER" | "CHEQUE" | "OTHER";
type StaffCategory = "FOOD" | "TRANSPORT" | "ACCOMMODATION" | "MISCELLANEOUS";

interface TransportRecord {
  id: number; driver_name: string; vehicle_type?: string; route?: string;
  days_count: number; daily_rate: number; total_amount: number;
  event_ref?: string; payment_status: PaymentStatus;
  payment_method?: PaymentMethod; record_date: string; notes?: string;
}

interface SmdRecord {
  id: number; screen_description: string; setup_location?: string;
  rental_days: number; daily_rate: number; total_amount: number;
  event_ref?: string; payment_status: PaymentStatus;
  payment_method?: PaymentMethod; record_date: string; notes?: string;
}

interface StallPayment {
  id: number; record_id: number; payer_name: string; organization?: string;
  amount: number; payment_method: PaymentMethod; paid_date: string; notes?: string;
}

interface StallRecord {
  id: number; project_name: string; total_budget: number;
  event_ref?: string; record_date: string; notes?: string;
  payments: StallPayment[];
}

interface StaffExpense {
  id: number; staff_name: string; expense_category: StaffCategory;
  amount: number; event_ref?: string; expense_date: string; description?: string;
}

interface Summary {
  transport_count: number; transport_total: number;
  transport_paid: number; transport_pending: number;
  smd_count: number; smd_total: number;
  smd_paid: number; smd_pending: number;
  stall_count: number; stall_budget_total: number;
  stall_collected_total: number; stall_shortfall: number;
  staff_count: number; staff_total: number;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const PKR = (v: number) => `PKR ${v.toLocaleString()}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" });
const toDateInput = (d: string) => new Date(d).toISOString().split("T")[0];

const INPUT = "w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent text-sm";
const LABEL = "text-xs font-semibold text-muted uppercase tracking-wide";

function StatusBadge({ status }: { status: PaymentStatus }) {
  const map = {
    PAID: { icon: <CheckCircle className="w-3 h-3" />, cls: "bg-success/10 text-success" },
    PENDING: { icon: <Clock className="w-3 h-3" />, cls: "bg-warning/10 text-warning" },
    PARTIAL: { icon: <AlertCircle className="w-3 h-3" />, cls: "bg-blue-400/10 text-blue-400" },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
}

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["PENDING", "PARTIAL", "PAID"];
const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTHER", label: "Other" },
];
const STAFF_CAT_OPTIONS: { value: StaffCategory; label: string }[] = [
  { value: "FOOD", label: "Food & Meals" },
  { value: "TRANSPORT", label: "Transport" },
  { value: "ACCOMMODATION", label: "Accommodation" },
  { value: "MISCELLANEOUS", label: "Miscellaneous" },
];

// ─── SUMMARY CARDS ───────────────────────────────────────────────────────────

function SummaryCards({ summary }: { summary: Summary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-semibold uppercase tracking-wide">
          <Truck className="w-4 h-4 text-accent" /> Transport
        </div>
        <p className="text-white text-xl font-bold">{PKR(summary.transport_total)}</p>
        <div className="flex gap-3 text-xs">
          <span className="text-success">Paid {PKR(summary.transport_paid)}</span>
          <span className="text-warning">Pending {PKR(summary.transport_pending)}</span>
        </div>
        <p className="text-muted text-xs">{summary.transport_count} records</p>
      </Card>

      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-semibold uppercase tracking-wide">
          <Monitor className="w-4 h-4 text-accent" /> SMD Screen
        </div>
        <p className="text-white text-xl font-bold">{PKR(summary.smd_total)}</p>
        <div className="flex gap-3 text-xs">
          <span className="text-success">Paid {PKR(summary.smd_paid)}</span>
          <span className="text-warning">Pending {PKR(summary.smd_pending)}</span>
        </div>
        <p className="text-muted text-xs">{summary.smd_count} records</p>
      </Card>

      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-semibold uppercase tracking-wide">
          <Layers className="w-4 h-4 text-accent" /> Stall Fab.
        </div>
        <p className="text-white text-xl font-bold">{PKR(summary.stall_budget_total)}</p>
        <div className="flex gap-3 text-xs">
          <span className="text-success">Collected {PKR(summary.stall_collected_total)}</span>
        </div>
        <p className={`text-xs font-semibold ${summary.stall_shortfall > 0 ? "text-danger" : "text-success"}`}>
          {summary.stall_shortfall > 0 ? `⚠ Shortfall ${PKR(summary.stall_shortfall)}` : "Fully collected"}
        </p>
      </Card>

      <Card className="p-4 space-y-1">
        <div className="flex items-center gap-2 text-muted text-xs font-semibold uppercase tracking-wide">
          <Users className="w-4 h-4 text-accent" /> Staff Exp.
        </div>
        <p className="text-white text-xl font-bold">{PKR(summary.staff_total)}</p>
        <p className="text-muted text-xs">{summary.staff_count} expenses</p>
      </Card>
    </div>
  );
}

// ─── TRANSPORT TAB ───────────────────────────────────────────────────────────

function TransportTab() {
  const [records, setRecords] = useState<TransportRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const emptyForm = {
    id: 0, driver_name: "", vehicle_type: "", route: "",
    days_count: 1, daily_rate: 0, total_amount: 0,
    event_ref: "", payment_status: "PENDING" as PaymentStatus,
    payment_method: "CASH" as PaymentMethod,
    record_date: new Date().toISOString().split("T")[0], notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const { data } = await fetchApi("/api/finance/transport");
    if (data) setRecords(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const F = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }));

  const autoTotal = () => {
    const t = form.days_count * form.daily_rate;
    F({ total_amount: t });
  };

  const openCreate = () => { setForm(emptyForm); setIsEditing(false); setModalOpen(true); };
  const openEdit = (r: TransportRecord) => {
    setForm({ ...r, record_date: toDateInput(r.record_date), vehicle_type: r.vehicle_type || "", route: r.route || "", event_ref: r.event_ref || "", payment_method: r.payment_method || "CASH", notes: r.notes || "" });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { id, ...payload } = form;
    const endpoint = isEditing ? `/api/finance/transport/${id}` : "/api/finance/transport";
    const { error } = await fetchApi(endpoint, { method: isEditing ? "PUT" : "POST", data: payload });
    setLoading(false);
    if (error) { addToast(error, "error"); return; }
    addToast(isEditing ? "Record updated" : "Record added", "success");
    setModalOpen(false); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this transport record?")) return;
    const { error } = await fetchApi(`/api/finance/transport/${id}`, { method: "DELETE" });
    if (error) { addToast(error, "error"); return; }
    addToast("Deleted", "success"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Transport</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-xs border-b border-white/5">
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Driver</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Route</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Days × Rate</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Event</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length > 0 ? records.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">
                    {r.driver_name}
                    {r.vehicle_type && <span className="text-muted text-xs block">{r.vehicle_type}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted text-sm">{r.route || "—"}</td>
                  <td className="px-4 py-3 text-muted text-sm">{r.days_count}d × {PKR(r.daily_rate)}</td>
                  <td className="px-4 py-3 text-accent font-bold">{PKR(r.total_amount)}</td>
                  <td className="px-4 py-3 text-muted text-sm">{r.event_ref || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.payment_status} /></td>
                  <td className="px-4 py-3 text-muted text-sm">{fmtDate(r.record_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-muted hover:text-white"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No transport records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit Transport Record" : "Add Transport Record"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Driver Name *</label>
              <input className={INPUT} value={form.driver_name} onChange={e => F({ driver_name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Vehicle Type</label>
              <input className={INPUT} placeholder="e.g. Truck, Pickup" value={form.vehicle_type} onChange={e => F({ vehicle_type: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Route / Description</label>
            <input className={INPUT} placeholder="e.g. Lahore → Islamabad" value={form.route} onChange={e => F({ route: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Days *</label>
              <input type="number" min={1} className={INPUT} value={form.days_count} onChange={e => F({ days_count: +e.target.value })} onBlur={autoTotal} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Daily Rate (PKR) *</label>
              <input type="number" min={0} className={INPUT} value={form.daily_rate} onChange={e => F({ daily_rate: +e.target.value })} onBlur={autoTotal} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Total Amount *</label>
              <input type="number" min={0} className={INPUT} value={form.total_amount} onChange={e => F({ total_amount: +e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Event Reference</label>
              <input className={INPUT} placeholder="Optional event name" value={form.event_ref} onChange={e => F({ event_ref: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Record Date *</label>
              <input type="date" className={INPUT} value={form.record_date} onChange={e => F({ record_date: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Payment Status</label>
              <select className={INPUT} value={form.payment_status} onChange={e => F({ payment_status: e.target.value as PaymentStatus })}>
                {PAYMENT_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Payment Method</label>
              <select className={INPUT} value={form.payment_method} onChange={e => F({ payment_method: e.target.value as PaymentMethod })}>
                {PAYMENT_METHOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Notes</label>
            <textarea className={INPUT} rows={2} value={form.notes} onChange={e => F({ notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{isEditing ? "Save Changes" : "Add Record"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── SMD TAB ─────────────────────────────────────────────────────────────────

function SmdTab() {
  const [records, setRecords] = useState<SmdRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const emptyForm = {
    id: 0, screen_description: "", setup_location: "",
    rental_days: 1, daily_rate: 0, total_amount: 0,
    event_ref: "", payment_status: "PENDING" as PaymentStatus,
    payment_method: "CASH" as PaymentMethod,
    record_date: new Date().toISOString().split("T")[0], notes: "",
  };
  const [form, setForm] = useState(emptyForm);
  const F = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }));

  const load = useCallback(async () => {
    const { data } = await fetchApi("/api/finance/smd");
    if (data) setRecords(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const autoTotal = () => F({ total_amount: form.rental_days * form.daily_rate });
  const openCreate = () => { setForm(emptyForm); setIsEditing(false); setModalOpen(true); };
  const openEdit = (r: SmdRecord) => {
    setForm({ ...r, record_date: toDateInput(r.record_date), setup_location: r.setup_location || "", event_ref: r.event_ref || "", payment_method: r.payment_method || "CASH", notes: r.notes || "" });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { id, ...payload } = form;
    const endpoint = isEditing ? `/api/finance/smd/${id}` : "/api/finance/smd";
    const { error } = await fetchApi(endpoint, { method: isEditing ? "PUT" : "POST", data: payload });
    setLoading(false);
    if (error) { addToast(error, "error"); return; }
    addToast(isEditing ? "Updated" : "Added", "success");
    setModalOpen(false); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this SMD record?")) return;
    const { error } = await fetchApi(`/api/finance/smd/${id}`, { method: "DELETE" });
    if (error) { addToast(error, "error"); return; }
    addToast("Deleted", "success"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add SMD Record</Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-xs border-b border-white/5">
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Screen</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Location</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Days × Rate</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Event</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length > 0 ? records.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">{r.screen_description}</td>
                  <td className="px-4 py-3 text-muted text-sm">{r.setup_location || "—"}</td>
                  <td className="px-4 py-3 text-muted text-sm">{r.rental_days}d × {PKR(r.daily_rate)}</td>
                  <td className="px-4 py-3 text-accent font-bold">{PKR(r.total_amount)}</td>
                  <td className="px-4 py-3 text-muted text-sm">{r.event_ref || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.payment_status} /></td>
                  <td className="px-4 py-3 text-muted text-sm">{fmtDate(r.record_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-muted hover:text-white"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted">No SMD records yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit SMD Record" : "Add SMD Record"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className={LABEL}>Screen Description *</label>
              <input className={INPUT} placeholder="e.g. P3.91 6×4m" value={form.screen_description} onChange={e => F({ screen_description: e.target.value })} required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className={LABEL}>Setup Location</label>
              <input className={INPUT} placeholder="Venue / Hall name" value={form.setup_location} onChange={e => F({ setup_location: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Rental Days *</label>
              <input type="number" min={1} className={INPUT} value={form.rental_days} onChange={e => F({ rental_days: +e.target.value })} onBlur={autoTotal} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Daily Rate (PKR) *</label>
              <input type="number" min={0} className={INPUT} value={form.daily_rate} onChange={e => F({ daily_rate: +e.target.value })} onBlur={autoTotal} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Total Amount *</label>
              <input type="number" min={0} className={INPUT} value={form.total_amount} onChange={e => F({ total_amount: +e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Event Reference</label>
              <input className={INPUT} value={form.event_ref} onChange={e => F({ event_ref: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Record Date *</label>
              <input type="date" className={INPUT} value={form.record_date} onChange={e => F({ record_date: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Payment Status</label>
              <select className={INPUT} value={form.payment_status} onChange={e => F({ payment_status: e.target.value as PaymentStatus })}>
                {PAYMENT_STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Payment Method</label>
              <select className={INPUT} value={form.payment_method} onChange={e => F({ payment_method: e.target.value as PaymentMethod })}>
                {PAYMENT_METHOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Notes</label>
            <textarea className={INPUT} rows={2} value={form.notes} onChange={e => F({ notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{isEditing ? "Save Changes" : "Add Record"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── STALL TAB ────────────────────────────────────────────────────────────────

function StallTab() {
  const [records, setRecords] = useState<StallRecord[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; recordId: number; editing?: StallPayment }>({ open: false, recordId: 0 });
  const { addToast } = useToast();

  const emptyForm = {
    id: 0, project_name: "", total_budget: 0,
    event_ref: "", record_date: new Date().toISOString().split("T")[0], notes: "",
  };
  const [form, setForm] = useState(emptyForm);
  const F = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }));

  const emptyPayForm = {
    id: 0, payer_name: "", organization: "", amount: 0,
    payment_method: "CASH" as PaymentMethod,
    paid_date: new Date().toISOString().split("T")[0], notes: "",
  };
  const [payForm, setPayForm] = useState(emptyPayForm);
  const PF = (f: Partial<typeof payForm>) => setPayForm(prev => ({ ...prev, ...f }));

  const load = useCallback(async () => {
    const { data } = await fetchApi("/api/finance/stall");
    if (data) setRecords(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setIsEditing(false); setModalOpen(true); };
  const openEdit = (r: StallRecord) => {
    setForm({ ...r, record_date: toDateInput(r.record_date), event_ref: r.event_ref || "", notes: r.notes || "" });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    const { id, ...payload } = form;
    const endpoint = isEditing ? `/api/finance/stall/${id}` : "/api/finance/stall";
    const { error } = await fetchApi(endpoint, { method: isEditing ? "PUT" : "POST", data: payload });
    setActionLoading(false);
    if (error) { addToast(error, "error"); return; }
    addToast(isEditing ? "Updated" : "Added", "success");
    setModalOpen(false); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this stall record and all its payments?")) return;
    const { error } = await fetchApi(`/api/finance/stall/${id}`, { method: "DELETE" });
    if (error) { addToast(error, "error"); return; }
    addToast("Deleted", "success"); load();
  };

  const openAddPayment = (recordId: number) => {
    setPayForm(emptyPayForm); setPaymentModal({ open: true, recordId });
  };
  const openEditPayment = (recordId: number, p: StallPayment) => {
    setPayForm({ ...p, paid_date: toDateInput(p.paid_date), organization: p.organization || "", notes: p.notes || "" });
    setPaymentModal({ open: true, recordId, editing: p });
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    const { id, ...payload } = payForm;
    let endpoint: string; let method: string;
    if (paymentModal.editing) {
      endpoint = `/api/finance/stall/payments/${paymentModal.editing.id}`;
      method = "PUT";
    } else {
      endpoint = `/api/finance/stall/${paymentModal.recordId}/payments`;
      method = "POST";
    }
    const { error } = await fetchApi(endpoint, { method, data: payload });
    setActionLoading(false);
    if (error) { addToast(error, "error"); return; }
    addToast(paymentModal.editing ? "Payment updated" : "Payment added", "success");
    setPaymentModal({ open: false, recordId: 0 }); load();
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm("Delete this payment entry?")) return;
    const { error } = await fetchApi(`/api/finance/stall/payments/${paymentId}`, { method: "DELETE" });
    if (error) { addToast(error, "error"); return; }
    addToast("Deleted", "success"); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Stall Project</Button>
      </div>

      <div className="space-y-3">
        {records.length === 0 && (
          <Card className="p-8 text-center text-muted">No stall fabrication records yet.</Card>
        )}
        {records.map(r => {
          const collected = r.payments.reduce((s, p) => s + p.amount, 0);
          const shortfall = r.total_budget - collected;
          const isExp = expanded === r.id;
          return (
            <Card key={r.id} className="overflow-hidden">
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpanded(isExp ? null : r.id)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate">{r.project_name}</h3>
                  <p className="text-muted text-xs">{r.event_ref ? `Event: ${r.event_ref} · ` : ""}{fmtDate(r.record_date)}</p>
                </div>
                <div className="flex items-center gap-4 text-sm shrink-0">
                  <div className="text-center">
                    <p className="text-muted text-xs">Budget</p>
                    <p className="text-white font-bold">{PKR(r.total_budget)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted text-xs">Collected</p>
                    <p className="text-success font-bold">{PKR(collected)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted text-xs">Shortfall</p>
                    <p className={`font-bold ${shortfall > 0 ? "text-danger" : "text-success"}`}>
                      {shortfall > 0 ? PKR(shortfall) : "✓ Done"}
                    </p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <button onClick={e => { e.stopPropagation(); openEdit(r); }} className="p-1.5 text-muted hover:text-white"><Edit className="w-4 h-4" /></button>
                    <button onClick={e => { e.stopPropagation(); handleDelete(r.id); }} className="p-1.5 text-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                    {isExp ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                  </div>
                </div>
              </div>

              {isExp && (
                <div className="border-t border-white/5 p-4 space-y-3">
                  {r.notes && <p className="text-muted text-sm italic">{r.notes}</p>}
                  <div className="flex items-center justify-between">
                    <h4 className="text-white text-sm font-semibold">Payment Entries ({r.payments.length})</h4>
                    <Button onClick={() => openAddPayment(r.id)} className="gap-1 text-xs py-1.5 px-3">
                      <Plus className="w-3 h-3" /> Add Payment
                    </Button>
                  </div>
                  {r.payments.length > 0 ? (
                    <div className="rounded-xl overflow-hidden border border-white/5">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-surface-2/50 text-muted text-xs border-b border-white/5">
                            <th className="px-3 py-2 font-semibold uppercase tracking-wide">Payer</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-wide">Organization</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-wide">Amount</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-wide">Method</th>
                            <th className="px-3 py-2 font-semibold uppercase tracking-wide">Date</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {r.payments.map(p => (
                            <tr key={p.id} className="hover:bg-white/[0.02]">
                              <td className="px-3 py-2 text-white text-sm font-medium">{p.payer_name}</td>
                              <td className="px-3 py-2 text-muted text-sm">{p.organization || "—"}</td>
                              <td className="px-3 py-2 text-success font-bold text-sm">{PKR(p.amount)}</td>
                              <td className="px-3 py-2 text-muted text-xs">{p.payment_method}</td>
                              <td className="px-3 py-2 text-muted text-xs">{fmtDate(p.paid_date)}</td>
                              <td className="px-3 py-2">
                                <div className="flex gap-1 justify-end">
                                  <button onClick={() => openEditPayment(r.id, p)} className="p-1 text-muted hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => handleDeletePayment(p.id)} className="p-1 text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted text-sm text-center py-4">No payments recorded yet. Add the first one.</p>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Stall Record Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit Stall Project" : "New Stall Project"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className={LABEL}>Project Name *</label>
            <input className={INPUT} placeholder="e.g. Pharma Expo Stall — Expo Centre" value={form.project_name} onChange={e => F({ project_name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Total Budget (PKR) *</label>
              <input type="number" min={0} className={INPUT} value={form.total_budget} onChange={e => F({ total_budget: +e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Record Date *</label>
              <input type="date" className={INPUT} value={form.record_date} onChange={e => F({ record_date: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Event Reference</label>
            <input className={INPUT} value={form.event_ref} onChange={e => F({ event_ref: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Notes</label>
            <textarea className={INPUT} rows={2} value={form.notes} onChange={e => F({ notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={actionLoading}>{isEditing ? "Save Changes" : "Create Project"}</Button>
          </div>
        </form>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={paymentModal.open} onClose={() => setPaymentModal({ open: false, recordId: 0 })} title={paymentModal.editing ? "Edit Payment" : "Add Payment Entry"}>
        <form onSubmit={handlePaySubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Payer Name *</label>
              <input className={INPUT} value={payForm.payer_name} onChange={e => PF({ payer_name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Organization</label>
              <input className={INPUT} placeholder="Company / Org name" value={payForm.organization} onChange={e => PF({ organization: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Amount (PKR) *</label>
              <input type="number" min={0} className={INPUT} value={payForm.amount} onChange={e => PF({ amount: +e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Date Paid *</label>
              <input type="date" className={INPUT} value={payForm.paid_date} onChange={e => PF({ paid_date: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Payment Method</label>
            <select className={INPUT} value={payForm.payment_method} onChange={e => PF({ payment_method: e.target.value as PaymentMethod })}>
              {PAYMENT_METHOD_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Notes</label>
            <textarea className={INPUT} rows={2} value={payForm.notes} onChange={e => PF({ notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setPaymentModal({ open: false, recordId: 0 })}>Cancel</Button>
            <Button type="submit" isLoading={actionLoading}>{paymentModal.editing ? "Save Changes" : "Add Payment"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── STAFF TAB ────────────────────────────────────────────────────────────────

function StaffTab() {
  const [records, setRecords] = useState<StaffExpense[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const emptyForm = {
    id: 0, staff_name: "", expense_category: "FOOD" as StaffCategory,
    amount: 0, event_ref: "",
    expense_date: new Date().toISOString().split("T")[0], description: "",
  };
  const [form, setForm] = useState(emptyForm);
  const F = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }));

  const load = useCallback(async () => {
    const { data } = await fetchApi("/api/finance/staff");
    if (data) setRecords(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setIsEditing(false); setModalOpen(true); };
  const openEdit = (r: StaffExpense) => {
    setForm({ ...r, expense_date: toDateInput(r.expense_date), event_ref: r.event_ref || "", description: r.description || "" });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { id, ...payload } = form;
    const endpoint = isEditing ? `/api/finance/staff/${id}` : "/api/finance/staff";
    const { error } = await fetchApi(endpoint, { method: isEditing ? "PUT" : "POST", data: payload });
    setLoading(false);
    if (error) { addToast(error, "error"); return; }
    addToast(isEditing ? "Updated" : "Added", "success");
    setModalOpen(false); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this expense?")) return;
    const { error } = await fetchApi(`/api/finance/staff/${id}`, { method: "DELETE" });
    if (error) { addToast(error, "error"); return; }
    addToast("Deleted", "success"); load();
  };

  const catColors: Record<StaffCategory, string> = {
    FOOD: "bg-orange-500/10 text-orange-400",
    TRANSPORT: "bg-blue-500/10 text-blue-400",
    ACCOMMODATION: "bg-purple-500/10 text-purple-400",
    MISCELLANEOUS: "bg-muted/10 text-muted",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> Add Expense</Button>
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-xs border-b border-white/5">
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Staff</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Amount</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Event</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Description</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wide">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {records.length > 0 ? records.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium">{r.staff_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${catColors[r.expense_category]}`}>
                      {r.expense_category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-accent font-bold">{PKR(r.amount)}</td>
                  <td className="px-4 py-3 text-muted text-sm">{r.event_ref || "—"}</td>
                  <td className="px-4 py-3 text-muted text-sm">{r.description || "—"}</td>
                  <td className="px-4 py-3 text-muted text-sm">{fmtDate(r.expense_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-muted hover:text-white"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="p-1.5 text-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No staff expenses yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit Expense" : "Add Staff Expense"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Staff Name *</label>
              <input className={INPUT} value={form.staff_name} onChange={e => F({ staff_name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Category *</label>
              <select className={INPUT} value={form.expense_category} onChange={e => F({ expense_category: e.target.value as StaffCategory })}>
                {STAFF_CAT_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Amount (PKR) *</label>
              <input type="number" min={0} className={INPUT} value={form.amount} onChange={e => F({ amount: +e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Date *</label>
              <input type="date" className={INPUT} value={form.expense_date} onChange={e => F({ expense_date: e.target.value })} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Event Reference</label>
            <input className={INPUT} value={form.event_ref} onChange={e => F({ event_ref: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL}>Description</label>
            <textarea className={INPUT} rows={2} value={form.description} onChange={e => F({ description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{isEditing ? "Save Changes" : "Add Expense"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

type Tab = "transport" | "smd" | "stall" | "staff";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "transport", label: "Transport", icon: <Truck className="w-4 h-4" /> },
  { id: "smd", label: "SMD Screen", icon: <Monitor className="w-4 h-4" /> },
  { id: "stall", label: "Stall Fabrication", icon: <Layers className="w-4 h-4" /> },
  { id: "staff", label: "Staff Expenses", icon: <Users className="w-4 h-4" /> },
];

export default function FinancePage() {
  const [tab, setTab] = useState<Tab>("transport");
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetchApi("/api/finance/summary").then(({ data }) => { if (data) setSummary(data); });
  }, [tab]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-white">Finance Records</h1>
        <p className="text-muted">Private expense ledger — transport, SMD, stall fabrication & staff costs.</p>
      </div>

      {summary && <SummaryCards summary={summary} />}

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-all ${
              tab === t.id
                ? "bg-accent text-primary"
                : "bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "transport" && <TransportTab />}
      {tab === "smd" && <SmdTab />}
      {tab === "stall" && <StallTab />}
      {tab === "staff" && <StaffTab />}
    </div>
  );
}
