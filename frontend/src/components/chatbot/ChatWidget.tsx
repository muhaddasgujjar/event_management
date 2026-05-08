"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Mic, MicOff, Volume2, Loader2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { API_URL } from "@/lib/constants";
import { usePathname } from "next/navigation";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
  isVoice?: boolean;
}

export function ChatWidget() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isEscalated, setIsEscalated] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [micPermission, setMicPermission] = useState<"granted" | "denied" | "unknown">("unknown");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const token = sessionStorage.getItem("hb_chat_token");
    if (token) setSessionToken(token);
  }, []);

  if (isAdminRoute) return null;

  const handleOpen = async () => {
    setIsOpen(true);
    if (!sessionToken && messages.length === 0) {
      setIsTyping(true);
      const { data, error } = await fetchApi<{ session_token: string; message: string }>("/api/chatbot/start", {
        method: "POST",
      });
      setIsTyping(false);
      if (data && !error) {
        sessionStorage.setItem("hb_chat_token", data.session_token);
        setSessionToken(data.session_token);
        setMessages([{ id: Date.now().toString(), sender: "bot", content: data.message }]);
      } else {
        setMessages([{ id: Date.now().toString(), sender: "bot", content: "Hi! How can I help you today?" }]);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !sessionToken) return;
    const userMessage: ChatMessage = { id: Date.now().toString(), sender: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const { data, error } = await fetchApi<{ user_message: any; bot_message: any; is_escalated: boolean }>(
      "/api/chatbot/message",
      { method: "POST", data: { session_token: sessionToken, content: userMessage.content } }
    );
    setIsTyping(false);
    if (data && !error) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", content: data.bot_message.content }]);
      if (data.is_escalated) setIsEscalated(true);
    } else {
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", content: "Sorry, I'm having trouble connecting. Please try again or visit our contact page." }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ─── Voice Recording ──────────────────────────────────────────────────────

  const getBestMimeType = () => {
    const types = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  };

  const startRecording = async () => {
    if (!sessionToken) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission("granted");
      const mimeType = getBestMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
        await sendVoiceMessage(blob, mimeType || "audio/webm");
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setMicPermission("denied");
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", content: "Microphone access was denied. Please allow mic access to use voice." }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessingVoice(true);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob, mimeType: string) => {
    if (!sessionToken) return;
    const ext = mimeType.includes("ogg") ? ".ogg" : mimeType.includes("mp4") ? ".mp4" : ".webm";
    const formData = new FormData();
    formData.append("session_token", sessionToken);
    formData.append("audio", audioBlob, `voice${ext}`);

    try {
      const token = localStorage.getItem("hb_token");
      const res = await fetch(`${API_URL}/api/chatbot/voice-message`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), sender: "user", content: data.user_text, isVoice: true },
          { id: (Date.now() + 1).toString(), sender: "bot", content: data.bot_text },
        ]);
        if (data.audio_base64) playAudio(data.audio_base64);
        if (data.is_escalated) setIsEscalated(true);
      } else {
        throw new Error("Voice processing failed");
      }
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "bot", content: "Sorry, I had trouble processing your voice message. Please try typing." }]);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const playAudio = (base64: string) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    audio.play().catch(() => {});
  };

  const speakMessage = async (text: string) => {
    try {
      const fd = new FormData();
      fd.append("text", text);
      const res = await fetch(`${API_URL}/api/chatbot/speak`, { method: "POST", body: fd });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch(() => {});
        audio.onended = () => URL.revokeObjectURL(url);
      }
    } catch {}
  };

  const isVoiceLoading = isRecording || isProcessingVoice;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: isOpen ? 0 : [1, 1.1, 1] }}
        transition={isOpen ? { duration: 0.2 } : { repeat: Infinity, duration: 2, repeatDelay: 5 }}
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-accent-light hover:text-primary transition-colors border-2 border-primary"
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[320px] sm:w-[360px] h-[520px] bg-surface-2 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-surface p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">H&B Assistant</h3>
                  <p className="text-xs text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" /> Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} group`}>
                  <div className={`max-w-[80%] ${msg.sender === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div
                      className={`p-3 rounded-2xl text-sm ${
                        msg.sender === "user"
                          ? "bg-accent text-white rounded-br-sm"
                          : "bg-surface text-accent-light border border-white/5 rounded-bl-sm"
                      }`}
                    >
                      {msg.isVoice && (
                        <span className="text-xs opacity-60 flex items-center gap-1 mb-1">
                          <Mic className="w-3 h-3" /> Voice
                        </span>
                      )}
                      {msg.content}
                    </div>
                    {msg.sender === "bot" && (
                      <button
                        onClick={() => speakMessage(msg.content)}
                        className="text-muted hover:text-accent transition-colors opacity-0 group-hover:opacity-100 ml-1"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing / processing indicator */}
              {(isTyping || isProcessingVoice) && (
                <div className="flex justify-start">
                  <div className="bg-surface text-accent-light border border-white/5 p-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                    {isProcessingVoice ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                        <span className="text-xs text-muted">Processing voice…</span>
                      </>
                    ) : (
                      <>
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-muted rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-muted rounded-full" />
                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-muted rounded-full" />
                      </>
                    )}
                  </div>
                </div>
              )}

              {isEscalated && (
                <div className="text-center p-2 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-xs text-accent">A team member will follow up with you shortly.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Recording indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 py-2 bg-danger/10 border-t border-danger/20 flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-2 h-2 bg-danger rounded-full"
                    />
                    <span className="text-xs text-danger font-medium">Recording… tap mic to send</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-4 bg-surface border-t border-white/5">
              <div className="flex items-end gap-2 bg-surface-2 border border-white/10 rounded-xl overflow-hidden p-1 focus-within:border-accent/50 transition-colors">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isVoiceLoading ? "Processing voice…" : "Type a message…"}
                  disabled={isVoiceLoading}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-2 max-h-32 min-h-[40px] resize-none disabled:opacity-40"
                  rows={1}
                />
                {/* Mic button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessingVoice || isTyping}
                  title={isRecording ? "Stop recording" : "Voice message"}
                  className={`p-2 rounded-lg transition-colors mb-1 disabled:opacity-40 ${
                    isRecording
                      ? "text-danger hover:bg-danger/10 animate-pulse"
                      : "text-muted hover:text-accent hover:bg-accent/10"
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || isVoiceLoading}
                  className="p-2 text-accent hover:bg-accent/10 rounded-lg disabled:opacity-50 transition-colors mb-1 mr-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
