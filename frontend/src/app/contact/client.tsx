"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MapPin, Phone, CheckCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const INQUIRY_TYPES = [
  { value: "GENERAL", label: "General Inquiry" },
  { value: "QUOTE", label: "Request a Quote" },
  { value: "SUPPORT", label: "Technical Support" },
  { value: "PARTNERSHIP", label: "Partnership Opportunity" },
];

export function ContactClient() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    inquiry_type: "GENERAL",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: submitError } = await fetchApi("/api/contact/", {
      method: "POST",
      data: formData
    });

    setLoading(false);

    if (submitError) {
      setError(submitError || "Failed to send message. Please try again.");
    } else {
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        inquiry_type: "GENERAL",
        message: "",
      });
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="pt-20 min-h-screen pb-24">
      <div className="bg-surface border-b border-white/5 py-16 mb-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-6">Contact Us</h1>
          <p className="text-xl text-muted">
            Have a question or ready to start planning? Our team is here to help.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Left Column - Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/3 flex flex-col gap-10"
          >
            <div>
              <h2 className="text-2xl font-bold font-heading text-white mb-6">Get in Touch</h2>
              <p className="text-muted leading-relaxed mb-8">
                Reach out to us directly or visit our office. We're always ready to discuss your next big event.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Office Address</h3>
                    <p className="text-muted">LDA 840, Lahore, Pakistan</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Phone Number</h3>
                    <p className="text-muted">+92 300 0000000</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Email Address</h3>
                    <p className="text-muted">info@hbeventsolution.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="w-full h-64 bg-surface-2 border border-white/5 rounded-2xl overflow-hidden relative">
              {/* Fake Map */}
              <div className="absolute inset-0 bg-[#1e232b] flex items-center justify-center">
                <div className="text-center text-muted">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">Google Maps Placeholder</span>
                  <br/>
                  <span className="text-xs opacity-50">LDA 840, Lahore</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-2/3"
          >
            <div className="bg-surface-2 border border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative">
              <AnimatePresence>
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8 p-4 bg-success/10 border border-success/20 text-success rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 shrink-0" />
                    <p className="font-medium">Message sent successfully! We'll get back to you soon.</p>
                  </motion.div>
                )}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-8 p-4 bg-danger/10 border border-danger/20 text-danger rounded-xl flex items-center gap-3"
                  >
                    <p className="font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={loading} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent disabled:opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Email Address *</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent disabled:opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Phone Number</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={loading} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent disabled:opacity-50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Company</label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} disabled={loading} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent disabled:opacity-50" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Inquiry Type</label>
                  <select name="inquiry_type" value={formData.inquiry_type} onChange={handleChange} disabled={loading} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent disabled:opacity-50 appearance-none">
                    {INQUIRY_TYPES.map(type => (
                      <option key={type.value} value={type.value} className="bg-surface text-white">{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Your Message *</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required disabled={loading} rows={5} className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent disabled:opacity-50 resize-none" />
                </div>

                <div className="pt-4">
                  <Button type="submit" isLoading={loading} className="w-full sm:w-auto px-10">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
