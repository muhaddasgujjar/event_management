"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type QuoteData = {
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  event_type: string;
  event_date: string;
  requires_smd: boolean;
  smd_requirements: string;
  requires_sound: boolean;
  sound_requirements: string;
  requires_stall: boolean;
  stall_requirements: string;
  venue_details: string;
  estimated_budget: string;
  notes: string;
};

export function QuoteClient() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<QuoteData>({
    company_name: "",
    contact_person: "",
    phone: "",
    email: "",
    event_type: "",
    event_date: "",
    requires_smd: false,
    smd_requirements: "",
    requires_sound: false,
    sound_requirements: "",
    requires_stall: false,
    stall_requirements: "",
    venue_details: "",
    estimated_budget: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggle = (name: keyof QuoteData) => {
    setFormData(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.company_name || !formData.contact_person || !formData.phone || !formData.email) {
        setError("Please fill in all required contact fields.");
        return;
      }
    }
    setError(null);
    setStep(s => Math.min(3, s + 1));
  };

  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload: any = {
      ...formData,
    };
    
    if (payload.estimated_budget === "") {
      payload.estimated_budget = null;
    } else if (payload.estimated_budget) {
      const parsed = parseFloat(payload.estimated_budget);
      if (!isNaN(parsed)) {
        payload.estimated_budget = parsed;
      } else {
        payload.estimated_budget = null;
      }
    }

    if (payload.event_date === "") {
      payload.event_date = null;
    }

    const { error: submitError } = await fetchApi("/api/quotes/", {
      method: "POST",
      data: payload
    });

    setLoading(false);

    if (submitError) {
      const errorStr = typeof submitError === 'string' ? submitError : JSON.stringify(submitError);
      setError(errorStr || "Failed to submit quote request. Please try again.");
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="pt-24 pb-16 min-h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-white/5 p-12 rounded-2xl max-w-lg w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold font-heading text-white mb-4">Request Submitted</h2>
          <p className="text-muted mb-8 leading-relaxed">
            Thank you for reaching out. Our team will review your requirements and get back to you within 24 hours.
          </p>
          <Link href="/">
            <Button className="w-full">Return to Homepage</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">Build Your Quote</h1>
          <p className="text-muted">Tell us about your event, and we'll engineer the perfect solution.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-bold ${step >= 1 ? "text-accent" : "text-muted"}`}>Contact Info</span>
            <span className={`text-sm font-bold ${step >= 2 ? "text-accent" : "text-muted"}`}>Requirements</span>
            <span className={`text-sm font-bold ${step >= 3 ? "text-accent" : "text-muted"}`}>Review</span>
          </div>
          <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-accent"
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="bg-surface border border-white/5 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          {error && (
            <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Company Name *</label>
                    <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Contact Person *</label>
                    <input type="text" name="contact_person" value={formData.contact_person} onChange={handleChange} className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Phone Number *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Event Type</label>
                    <input type="text" name="event_type" value={formData.event_type} onChange={handleChange} placeholder="e.g. Medical Conference" className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Event Date</label>
                    <input type="date" name="event_date" value={formData.event_date} onChange={handleChange} className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Toggles */}
                <div className="space-y-6">
                  {/* SMD */}
                  <div className="border border-white/10 rounded-xl p-5 bg-surface-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`w-6 h-6 ${formData.requires_smd ? "text-accent" : "text-muted"}`} />
                        <span className="font-bold text-white">Requires SMD Screen?</span>
                      </div>
                      <button 
                        onClick={() => handleToggle("requires_smd")}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.requires_smd ? "bg-accent" : "bg-white/10"}`}
                      >
                        <motion.div 
                          layout
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                          initial={false}
                          animate={{ left: formData.requires_smd ? "calc(100% - 22px)" : "2px" }}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {formData.requires_smd && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4">
                          <textarea name="smd_requirements" value={formData.smd_requirements} onChange={handleChange} placeholder="Dimensions, setup type, etc." className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent min-h-[100px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Sound */}
                  <div className="border border-white/10 rounded-xl p-5 bg-surface-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`w-6 h-6 ${formData.requires_sound ? "text-accent" : "text-muted"}`} />
                        <span className="font-bold text-white">Requires Sound System?</span>
                      </div>
                      <button 
                        onClick={() => handleToggle("requires_sound")}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.requires_sound ? "bg-accent" : "bg-white/10"}`}
                      >
                        <motion.div 
                          layout
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                          initial={false}
                          animate={{ left: formData.requires_sound ? "calc(100% - 22px)" : "2px" }}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {formData.requires_sound && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4">
                          <textarea name="sound_requirements" value={formData.sound_requirements} onChange={handleChange} placeholder="Audience size, mic needs, etc." className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent min-h-[100px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Stall */}
                  <div className="border border-white/10 rounded-xl p-5 bg-surface-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`w-6 h-6 ${formData.requires_stall ? "text-accent" : "text-muted"}`} />
                        <span className="font-bold text-white">Requires 3D Stall?</span>
                      </div>
                      <button 
                        onClick={() => handleToggle("requires_stall")}
                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.requires_stall ? "bg-accent" : "bg-white/10"}`}
                      >
                        <motion.div 
                          layout
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                          initial={false}
                          animate={{ left: formData.requires_stall ? "calc(100% - 22px)" : "2px" }}
                        />
                      </button>
                    </div>
                    <AnimatePresence>
                      {formData.requires_stall && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4">
                          <textarea name="stall_requirements" value={formData.stall_requirements} onChange={handleChange} placeholder="Stall dimensions, branding needs, etc." className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent min-h-[100px]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Venue Details</label>
                    <textarea name="venue_details" value={formData.venue_details} onChange={handleChange} className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" rows={2} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Additional Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" rows={2} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-white">Estimated Budget (PKR) - Optional</label>
                    <input type="text" name="estimated_budget" value={formData.estimated_budget} onChange={handleChange} className="w-full bg-surface-2 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-surface-2 border border-white/10 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Contact Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div><span className="text-muted block">Company:</span><span className="text-white font-medium">{formData.company_name}</span></div>
                    <div><span className="text-muted block">Contact:</span><span className="text-white font-medium">{formData.contact_person}</span></div>
                    <div><span className="text-muted block">Email:</span><span className="text-white font-medium">{formData.email}</span></div>
                    <div><span className="text-muted block">Phone:</span><span className="text-white font-medium">{formData.phone}</span></div>
                  </div>

                  <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Event Requirements</h3>
                  <div className="space-y-4 text-sm">
                    {formData.requires_smd && (
                      <div><span className="text-accent font-bold">SMD Screen:</span> <span className="text-white">{formData.smd_requirements || "Requested"}</span></div>
                    )}
                    {formData.requires_sound && (
                      <div><span className="text-accent font-bold">Sound System:</span> <span className="text-white">{formData.sound_requirements || "Requested"}</span></div>
                    )}
                    {formData.requires_stall && (
                      <div><span className="text-accent font-bold">3D Stall:</span> <span className="text-white">{formData.stall_requirements || "Requested"}</span></div>
                    )}
                    {!formData.requires_smd && !formData.requires_sound && !formData.requires_stall && (
                      <p className="text-muted">No specific equipment selected.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10 pt-6 border-t border-white/5">
            {step > 1 ? (
              <Button variant="ghost" onClick={prevStep} disabled={loading} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            ) : <div />}
            
            {step < 3 ? (
              <Button onClick={nextStep} className="gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} isLoading={loading}>
                Submit Request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
