"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchApi } from "@/lib/api";
import { API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import {
  Plus, Trash2, Edit, Star, ImagePlus, Video, Upload, X, Play,
  Eye, EyeOff,
} from "lucide-react";

type Category = "SMD" | "SOUND" | "STALL" | "FULL_SETUP";

interface PortfolioItem {
  id: number;
  title: string;
  description?: string;
  category: Category;
  event_type?: string;
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  is_featured: boolean;
  display_order: number;
  tags_json?: string;
  created_at: string;
}

const INPUT = "w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-accent text-sm";
const LABEL = "text-xs font-semibold text-muted uppercase tracking-wide";

const CAT_COLORS: Record<Category, string> = {
  SMD: "bg-blue-500/10 text-blue-400",
  SOUND: "bg-purple-500/10 text-purple-400",
  STALL: "bg-orange-500/10 text-orange-400",
  FULL_SETUP: "bg-accent/10 text-accent",
};

function MediaPreview({ imageUrl, videoUrl }: { imageUrl?: string; videoUrl?: string }) {
  const src = imageUrl ? (imageUrl.startsWith("/uploads") ? `${API_URL}${imageUrl}` : imageUrl) : null;
  const vid = videoUrl ? (videoUrl.startsWith("/uploads") ? `${API_URL}${videoUrl}` : videoUrl) : null;

  if (vid) {
    if (vid.includes("youtube.com") || vid.includes("youtu.be")) {
      const id = vid.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1];
      return id ? (
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${id}`}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : null;
    }
    return (
      <video src={vid} className="w-full aspect-video rounded-xl object-cover bg-black" controls />
    );
  }
  if (src) {
    return <img src={src} alt="" className="w-full aspect-video rounded-xl object-cover bg-surface-2" />;
  }
  return (
    <div className="w-full aspect-video rounded-xl bg-surface-2 flex items-center justify-center text-muted">
      <ImagePlus className="w-8 h-8" />
    </div>
  );
}

export default function PortfolioAdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState<Category | "ALL">("ALL");
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const emptyForm = {
    id: 0, title: "", description: "", category: "SMD" as Category,
    event_type: "", image_url: "", video_url: "",
    is_featured: false, display_order: 0, tags_json: "",
  };
  const [form, setForm] = useState(emptyForm);
  const F = (f: Partial<typeof form>) => setForm(prev => ({ ...prev, ...f }));

  const load = useCallback(async () => {
    const { data } = await fetchApi("/api/portfolio/");
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(emptyForm); setIsEditing(false); setModalOpen(true); };
  const openEdit = (item: PortfolioItem) => {
    setForm({
      ...item,
      description: item.description || "",
      event_type: item.event_type || "",
      image_url: item.image_url || "",
      video_url: item.video_url || "",
      tags_json: item.tags_json || "",
    });
    setIsEditing(true); setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    const { id, ...payload } = form;
    const cleaned = {
      ...payload,
      image_url: payload.image_url || null,
      video_url: payload.video_url || null,
      thumbnail_url: payload.image_url || null,
      tags_json: payload.tags_json || null,
      description: payload.description || null,
      event_type: payload.event_type || null,
    };
    const endpoint = isEditing ? `/api/portfolio/${id}` : "/api/portfolio/";
    const { error } = await fetchApi(endpoint, { method: isEditing ? "PUT" : "POST", data: cleaned });
    setActionLoading(false);
    if (error) { addToast(error, "error"); return; }
    addToast(isEditing ? "Item updated" : "Item added", "success");
    setModalOpen(false); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this portfolio item?")) return;
    const { error } = await fetchApi(`/api/portfolio/${id}`, { method: "DELETE" });
    if (error) { addToast(error, "error"); return; }
    addToast("Deleted", "success"); load();
  };

  const handleToggleFeatured = async (id: number) => {
    const { error } = await fetchApi(`/api/portfolio/${id}/feature`, { method: "PUT" });
    if (error) { addToast(error, "error"); return; }
    load();
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const token = localStorage.getItem("hb_token");
      const res = await fetch(`${API_URL}/api/uploads/portfolio-image`, {
        method: "POST", body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) { F({ image_url: data.file }); addToast("Image uploaded", "success"); }
      else addToast(data.detail || "Upload failed", "error");
    } catch { addToast("Upload failed", "error"); }
    setUploading(false);
  };

  const uploadVideo = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const token = localStorage.getItem("hb_token");
      const res = await fetch(`${API_URL}/api/uploads/portfolio-video`, {
        method: "POST", body: fd,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) { F({ video_url: data.file }); addToast("Video uploaded", "success"); }
      else addToast(data.detail || "Upload failed", "error");
    } catch { addToast("Upload failed", "error"); }
    setUploading(false);
  };

  const filtered = filterCat === "ALL" ? items : items.filter(i => i.category === filterCat);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-56 bg-surface-2 animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="aspect-video bg-surface-2 animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-white">Portfolio</h1>
          <p className="text-muted">Manage gallery — images and videos shown on the website.</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0"><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["ALL", "SMD", "SOUND", "STALL", "FULL_SETUP"] as const).map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold shrink-0 transition-all ${
              filterCat === c ? "bg-accent text-primary" : "bg-surface-2 text-muted hover:text-white"
            }`}
          >
            {c === "ALL" ? "All" : c.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center text-muted">No portfolio items yet. Add your first one.</Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => {
            const hasVideo = !!item.video_url;
            const imgSrc = item.image_url
              ? (item.image_url.startsWith("/uploads") ? `${API_URL}${item.image_url}` : item.image_url)
              : null;

            return (
              <Card key={item.id} className="overflow-hidden group">
                <div className="relative aspect-video bg-surface-2">
                  {imgSrc ? (
                    <img src={imgSrc} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <ImagePlus className="w-8 h-8" />
                    </div>
                  )}
                  {hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}
                  {item.is_featured && (
                    <div className="absolute top-2 left-2 bg-accent text-primary text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Featured
                    </div>
                  )}
                  <span className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${CAT_COLORS[item.category]}`}>
                    {item.category.replace("_", " ")}
                  </span>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
                    <button onClick={() => handleToggleFeatured(item.id)} title={item.is_featured ? "Unfeature" : "Feature"} className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                      <Star className={`w-4 h-4 ${item.is_featured ? "fill-accent text-accent" : ""}`} />
                    </button>
                    <button onClick={() => openEdit(item)} className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl bg-danger/20 text-danger hover:bg-danger/30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-bold truncate">{item.title}</h3>
                  {item.event_type && <p className="text-muted text-xs">{item.event_type}</p>}
                  {item.description && <p className="text-muted text-sm mt-1 line-clamp-2">{item.description}</p>}
                  <div className="flex gap-2 mt-2 text-xs text-muted">
                    {item.image_url && <span className="flex items-center gap-1"><ImagePlus className="w-3 h-3" /> Image</span>}
                    {item.video_url && <span className="flex items-center gap-1"><Video className="w-3 h-3" /> Video</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit Portfolio Item" : "Add Portfolio Item"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <label className={LABEL}>Title *</label>
              <input className={INPUT} value={form.title} onChange={e => F({ title: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Category *</label>
              <select className={INPUT} value={form.category} onChange={e => F({ category: e.target.value as Category })}>
                <option value="SMD">SMD Screen</option>
                <option value="SOUND">Sound System</option>
                <option value="STALL">Stall Fabrication</option>
                <option value="FULL_SETUP">Full Setup</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={LABEL}>Event Type</label>
              <input className={INPUT} placeholder="e.g. Corporate, Concert" value={form.event_type} onChange={e => F({ event_type: e.target.value })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={LABEL}>Description</label>
            <textarea className={INPUT} rows={2} value={form.description} onChange={e => F({ description: e.target.value })} />
          </div>

          {/* Image */}
          <div className="space-y-2">
            <label className={LABEL}>Image</label>
            <div className="flex gap-2">
              <input
                className={`${INPUT} flex-1`}
                placeholder="Paste image URL or upload below"
                value={form.image_url}
                onChange={e => F({ image_url: e.target.value })}
              />
              <button
                type="button"
                onClick={() => imgInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-2 rounded-xl bg-surface-2 border border-white/10 text-muted hover:text-white hover:border-accent transition-colors shrink-0"
                title="Upload image file"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <input ref={imgInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); }} />
            {form.image_url && (
              <div className="relative mt-1">
                <img
                  src={form.image_url.startsWith("/uploads") ? `${API_URL}${form.image_url}` : form.image_url}
                  alt=""
                  className="w-full h-32 object-cover rounded-xl"
                  onError={e => (e.currentTarget.style.display = "none")}
                />
                <button type="button" onClick={() => F({ image_url: "" })} className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Video */}
          <div className="space-y-2">
            <label className={LABEL}>Video (YouTube URL or upload .mp4/.mov)</label>
            <div className="flex gap-2">
              <input
                className={`${INPUT} flex-1`}
                placeholder="https://youtube.com/watch?v=... or upload below"
                value={form.video_url}
                onChange={e => F({ video_url: e.target.value })}
              />
              <button
                type="button"
                onClick={() => vidInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-2 rounded-xl bg-surface-2 border border-white/10 text-muted hover:text-white hover:border-accent transition-colors shrink-0"
                title="Upload video file"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
            <input ref={vidInputRef} type="file" accept="video/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadVideo(e.target.files[0]); }} />
            {uploading && <p className="text-accent text-xs animate-pulse">Uploading...</p>}
            {form.video_url && !uploading && (
              <div className="flex items-center gap-2 mt-1">
                <Video className="w-4 h-4 text-accent" />
                <p className="text-muted text-xs truncate flex-1">{form.video_url}</p>
                <button type="button" onClick={() => F({ video_url: "" })} className="p-1 text-muted hover:text-danger">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={LABEL}>Display Order</label>
              <input type="number" min={0} className={INPUT} value={form.display_order} onChange={e => F({ display_order: +e.target.value })} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => F({ is_featured: !form.is_featured })}
                  className={`w-10 h-6 rounded-full transition-colors ${form.is_featured ? "bg-accent" : "bg-surface-2"} relative cursor-pointer`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.is_featured ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm text-muted">Featured on homepage</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={actionLoading}>{isEditing ? "Save Changes" : "Add Item"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
