"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpdatePasswordModal({ isOpen, onClose }: UpdatePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match", "error");
      return;
    }
    if (newPassword.length < 8) {
      addToast("New password must be at least 8 characters", "error");
      return;
    }

    setLoading(true);
    const { error } = await fetchApi("/api/auth/change-password", {
      method: "POST",
      data: {
        current_password: currentPassword,
        new_password: newPassword,
      },
    });
    setLoading(false);

    if (error) {
      addToast(error, "error");
    } else {
      addToast("Password updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Password">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-accent"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}
