"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const { error: registerError } = await fetchApi("/api/auth/register", {
      method: "POST",
      data: formData,
    });

    if (registerError) {
      setError(registerError);
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      // Auto login
      const { error: loginError } = await login(formData.email, formData.password);
      if (loginError) {
        setError(loginError);
        setLoading(false);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4 pt-20">
      <motion.div 
        animate={shake ? { x: [0, -10, 10, -10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface-2 border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-light" />
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-muted text-sm">Join H&B Event Solution to manage your quotes.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger rounded-lg text-sm text-center font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Full Name</label>
              <input 
                type="text" 
                value={formData.full_name} 
                onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                required
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Email Address</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                required
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Password</label>
              <input 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                required
                minLength={8}
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors" 
              />
              <p className="text-xs text-muted">Must be at least 8 characters long</p>
            </div>

            <Button type="submit" isLoading={loading} className="w-full">
              Sign Up
            </Button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:text-accent-light transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
