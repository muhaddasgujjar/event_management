"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setStatus("loading");
    
    const { error } = await fetchApi("/api/contact/subscribe", {
      method: "POST",
      data: { email, name }
    });

    if (error) {
      setStatus("error");
      setMessage(error || "Failed to subscribe. Please try again.");
    } else {
      setStatus("success");
      setMessage("Thanks for subscribing!");
      setEmail("");
      setName("");
    }
    
    setTimeout(() => {
      if (status !== "error") setStatus("idle");
    }, 5000);
  };

  return (
    <section className="bg-gradient-to-r from-surface-2 via-surface-2 to-surface border-y border-white/5 py-16 relative overflow-hidden">
      {/* Decorative Gold Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      <div className="absolute -left-32 -top-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left flex-1">
            <h3 className="text-2xl font-bold font-heading text-white mb-2">Stay Updated</h3>
            <p className="text-muted">Receive exclusive insights on event production and new service offerings.</p>
          </div>

          <div className="w-full md:w-auto flex-1 max-w-md relative">
            <AnimatePresence mode="wait">
              {status === "success" || status === "error" ? (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    status === "success" 
                      ? "bg-success/10 border-success/20 text-success" 
                      : "bg-danger/10 border-danger/20 text-danger"
                  }`}
                >
                  {status === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  <span className="font-medium text-sm">{message}</span>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={status === "loading"}
                      className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all disabled:opacity-50"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={status === "loading"}
                      className="w-full bg-surface border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all disabled:opacity-50"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    isLoading={status === "loading"} 
                    className="h-[auto] sm:h-[104px]" // align with two inputs
                  >
                    Subscribe
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
