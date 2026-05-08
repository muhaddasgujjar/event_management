"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import QuotesLoading from "./loading";

const FILTERS = ["ALL", "PENDING", "REVIEWING", "APPROVED", "REJECTED"];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  
  // Modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const [finalPrice, setFinalPrice] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { addToast } = useToast();

  const loadQuotes = async () => {
    const endpoint = filter === "ALL" ? "/api/quotes/" : `/api/quotes/?status=${filter}`;
    const { data, error } = await fetchApi(endpoint);
    if (data) setQuotes(data);
    else if (error) addToast(error, "error");
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    loadQuotes();
  }, [filter]);

  const handleStatusChange = async (id: number, status: string, payload: any = {}) => {
    setActionLoading(true);
    
    // Optimistic UI update
    const previousQuotes = [...quotes];
    setQuotes(quotes.map(q => q.id === id ? { ...q, status, ...payload } : q));

    const { error } = await fetchApi(`/api/quotes/${id}/status`, {
      method: "PUT",
      data: { status, ...payload }
    });

    setActionLoading(false);

    if (error) {
      setQuotes(previousQuotes);
      addToast(error, "error");
    } else {
      addToast(`Quote status updated to ${status}`, "success");
      setApproveModalOpen(false);
      setRejectModalOpen(false);
      setFinalPrice("");
      setRejectionReason("");
    }
  };

  const getCount = (status: string) => {
    if (status === "ALL") return quotes.length;
    return quotes.filter(q => q.status === status).length;
  };

  if (loading && quotes.length === 0) return <QuotesLoading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading text-white">Quotes Management</h1>
        <p className="text-muted">Review and respond to client quote requests.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === f 
                ? "bg-accent text-white" 
                : "bg-surface border border-white/10 text-muted hover:text-white"
            }`}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-2/50 text-muted text-sm border-b border-white/5">
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Company</th>
                <th className="px-6 py-3 font-medium">Event Type</th>
                <th className="px-6 py-3 font-medium">Event Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Budget</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {quotes.length > 0 ? (
                quotes.map((quote) => (
                  <React.Fragment key={quote.id}>
                    <tr 
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${expandedRow === quote.id ? "bg-white/[0.02]" : ""}`}
                      onClick={() => setExpandedRow(expandedRow === quote.id ? null : quote.id)}
                    >
                      <td className="px-6 py-4 text-muted">#{quote.id}</td>
                      <td className="px-6 py-4 font-medium text-white">{quote.client?.company_name || '-'}</td>
                      <td className="px-6 py-4 text-muted">{quote.event_type || "-"}</td>
                      <td className="px-6 py-4 text-muted">{quote.event_date ? new Date(quote.event_date).toLocaleDateString() : "-"}</td>
                      <td className="px-6 py-4"><Badge status={quote.status} /></td>
                      <td className="px-6 py-4 text-muted">{quote.estimated_budget || "-"}</td>
                      <td className="px-6 py-4">
                        <button className="text-muted hover:text-white">
                          {expandedRow === quote.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </td>
                    </tr>
                    
                    <AnimatePresence>
                      {expandedRow === quote.id && (
                        <tr>
                          <td colSpan={7} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-surface-2/30 border-y border-white/5 overflow-hidden"
                            >
                              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                  <h4 className="font-bold text-accent mb-3 uppercase tracking-wider text-xs">Contact Info</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><span className="text-muted">Person:</span> <span className="text-white">{quote.client?.contact_person || '-'}</span></p>
                                    <p><span className="text-muted">Email:</span> <span className="text-white">{quote.client?.email || '-'}</span></p>
                                    <p><span className="text-muted">Phone:</span> <span className="text-white">{quote.client?.phone || '-'}</span></p>
                                    <p><span className="text-muted">Date Requested:</span> <span className="text-white">{new Date(quote.created_at).toLocaleString()}</span></p>
                                  </div>

                                  <h4 className="font-bold text-accent mt-6 mb-3 uppercase tracking-wider text-xs">Requirements</h4>
                                  <div className="space-y-2 text-sm">
                                    {quote.requires_smd && <p><span className="text-muted">SMD:</span> <span className="text-white">{quote.smd_requirements || "Yes"}</span></p>}
                                    {quote.requires_sound && <p><span className="text-muted">Sound:</span> <span className="text-white">{quote.sound_requirements || "Yes"}</span></p>}
                                    {quote.requires_stall && <p><span className="text-muted">Stall:</span> <span className="text-white">{quote.stall_requirements || "Yes"}</span></p>}
                                    {quote.venue_details && <p><span className="text-muted">Venue:</span> <span className="text-white">{quote.venue_details}</span></p>}
                                    {quote.notes && <p><span className="text-muted">Notes:</span> <span className="text-white">{quote.notes}</span></p>}
                                  </div>
                                </div>

                                <div className="flex flex-col gap-3 justify-start bg-surface p-4 rounded-xl border border-white/5 h-fit">
                                  <h4 className="font-bold text-white mb-2">Update Status</h4>
                                  
                                  {quote.status === "PENDING" && (
                                    <Button 
                                      variant="secondary" 
                                      onClick={(e) => { e.stopPropagation(); handleStatusChange(quote.id, "REVIEWING"); }}
                                    >
                                      Mark as Reviewing
                                    </Button>
                                  )}
                                  
                                  {(quote.status === "PENDING" || quote.status === "REVIEWING") && (
                                    <>
                                      <Button 
                                        variant="primary"
                                        onClick={(e) => { e.stopPropagation(); setCurrentQuote(quote); setApproveModalOpen(true); }}
                                      >
                                        Approve Quote
                                      </Button>
                                      <Button 
                                        variant="danger"
                                        onClick={(e) => { e.stopPropagation(); setCurrentQuote(quote); setRejectModalOpen(true); }}
                                      >
                                        Reject Quote
                                      </Button>
                                    </>
                                  )}

                                  {quote.status === "APPROVED" && (
                                    <div className="text-sm p-3 bg-success/10 border border-success/20 text-success rounded-lg">
                                      <span className="font-bold block mb-1">Approved</span>
                                      Final Price: PKR {quote.final_price?.toLocaleString()}
                                    </div>
                                  )}

                                  {quote.status === "REJECTED" && (
                                    <div className="text-sm p-3 bg-danger/10 border border-danger/20 text-danger rounded-lg">
                                      <span className="font-bold block mb-1">Rejected</span>
                                      Reason: {quote.rejection_reason || "N/A"}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted">No quotes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Approve Modal */}
      <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} title="Approve Quote">
        <div className="space-y-4">
          <p className="text-muted text-sm">Enter the final negotiated price to approve this quote.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Final Price (PKR) *</label>
            <input 
              type="number" 
              value={finalPrice} 
              onChange={(e) => setFinalPrice(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent" 
              required
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setApproveModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => handleStatusChange(currentQuote.id, "APPROVED", { final_price: parseInt(finalPrice) })}
              isLoading={actionLoading}
              disabled={!finalPrice}
            >
              Confirm Approval
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} title="Reject Quote">
        <div className="space-y-4">
          <p className="text-muted text-sm">Please provide a reason for rejecting this quote request.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Rejection Reason</label>
            <textarea 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent resize-none h-24" 
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>Cancel</Button>
            <Button 
              variant="danger"
              onClick={() => handleStatusChange(currentQuote.id, "REJECTED", { rejection_reason: rejectionReason })}
              isLoading={actionLoading}
            >
              Reject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
