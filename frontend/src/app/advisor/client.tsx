"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Send, Volume2, VolumeX, Sparkles,
  Calendar, Monitor, Building2, ChevronRight,
  Loader2, CheckCircle2, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";
import { API_URL } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  sender: "user" | "bot";
  content: string;
  isVoice?: boolean;
}

interface CollectedInfo {
  eventType: string | null;
  services: string[];
  date: string | null;
}

const INITIAL_CHIPS = [
  { label: "Corporate Conference", icon: Building2 },
  { label: "Concert / Music Event", icon: Monitor },
  { label: "Pharmaceutical Exhibition", icon: Sparkles },
  { label: "Trade Show / Expo", icon: Building2 },
  { label: "What services do you offer?", icon: ChevronRight },
];

const SERVICE_CHIPS = [
  { label: "SMD Screen Rental", icon: Monitor },
  { label: "Sound System", icon: Monitor },
  { label: "3D Stall Fabrication", icon: Building2 },
  { label: "All Three Services", icon: Sparkles },
];

const ADVISOR_INTRO = `Assalam-o-Alaikum! I'm your H&B Event Advisor — your personal consultant for planning a flawless event. With 30 years of production experience behind us, I can help you explore our services, understand your options, and build the perfect setup.\n\nWhat kind of event are you planning?`;

export function AdvisorClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chips, setChips] = useState(INITIAL_CHIPS);
  const [showQuoteCTA, setShowQuoteCTA] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({
    eventType: null, services: [], date: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const botReplyCount = useRef(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const init = async () => {
      const saved = sessionStorage.getItem("hb_advisor_token");
      if (saved) { setSessionToken(saved); return; }
      setIsTyping(true);
      const { data } = await fetchApi<{ session_token: string; message: string }>("/api/chatbot/start", { method: "POST" });
      setIsTyping(false);
      if (data) {
        sessionStorage.setItem("hb_advisor_token", data.session_token);
        setSessionToken(data.session_token);
        setMessages([{ id: "intro", sender: "bot", content: ADVISOR_INTRO }]);
      }
    };
    init();
  }, []);

  const parseContext = useCallback((userText: string) => {
    const t = userText.toLowerCase();
    setCollectedInfo((prev) => {
      const updated = { ...prev };
      if (!updated.eventType) {
        if (t.includes("conference")) updated.eventType = "Corporate Conference";
        else if (t.includes("concert") || t.includes("music")) updated.eventType = "Concert";
        else if (t.includes("pharma") || t.includes("medical")) updated.eventType = "Pharmaceutical Exhibition";
        else if (t.includes("trade") || t.includes("expo") || t.includes("exhibition")) updated.eventType = "Trade Show";
      }
      const svcs = [...updated.services];
      if ((t.includes("smd") || t.includes("screen")) && !svcs.includes("SMD Screen")) svcs.push("SMD Screen");
      if ((t.includes("sound") || t.includes("audio") || t.includes("mic")) && !svcs.includes("Sound System")) svcs.push("Sound System");
      if ((t.includes("stall") || t.includes("booth") || t.includes("fabricat")) && !svcs.includes("3D Stall")) svcs.push("3D Stall");
      if (t.includes("all") && t.includes("three")) {
        ["SMD Screen", "Sound System", "3D Stall"].forEach(s => { if (!svcs.includes(s)) svcs.push(s); });
      }
      updated.services = svcs;
      if (updated.eventType && chips === INITIAL_CHIPS) setChips(SERVICE_CHIPS);
      return updated;
    });
    botReplyCount.current += 1;
    if (botReplyCount.current >= 4) setShowQuoteCTA(true);
  }, [chips]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !sessionToken) return;
    const userMsg: Message = { id: Date.now().toString(), sender: "user", content: text.trim() };
    setMessages(p => [...p, userMsg]);
    setInput("");
    setIsTyping(true);
    const { data, error } = await fetchApi<{ user_message: any; bot_message: any; is_escalated: boolean }>(
      "/api/chatbot/message",
      { method: "POST", data: { session_token: sessionToken, content: text.trim() } }
    );
    setIsTyping(false);
    if (data && !error) {
      const botMsg: Message = { id: (Date.now() + 1).toString(), sender: "bot", content: data.bot_message.content };
      setMessages(p => [...p, botMsg]);
      parseContext(text);
      if (voiceEnabled) speakMessage(data.bot_message.content, botMsg.id);
    } else {
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), sender: "bot", content: "I'm having trouble connecting right now. Please try again in a moment." }]);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const getBestMime = () =>
    ["audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus","audio/mp4"].find(t => MediaRecorder.isTypeSupported(t)) || "";

  const startRecording = async () => {
    if (!sessionToken) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = getBestMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
      mediaRecorderRef.current = rec;
      audioChunksRef.current = [];
      rec.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mime || "audio/webm" });
        await sendVoice(blob, mime || "audio/webm");
      };
      rec.start();
      setIsRecording(true);
    } catch {
      setMessages(p => [...p, { id: Date.now().toString(), sender: "bot", content: "Microphone access denied. Please allow mic access in your browser settings." }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessingVoice(true);
    }
  };

  const sendVoice = async (blob: Blob, mime: string) => {
    if (!sessionToken) return;
    const ext = mime.includes("ogg") ? ".ogg" : mime.includes("mp4") ? ".mp4" : ".webm";
    const fd = new FormData();
    fd.append("session_token", sessionToken);
    fd.append("audio", blob, `voice${ext}`);
    try {
      const tkn = localStorage.getItem("hb_token");
      const res = await fetch(`${API_URL}/api/chatbot/voice-message`, {
        method: "POST", body: fd,
        headers: tkn ? { Authorization: `Bearer ${tkn}` } : {},
      });
      if (res.ok) {
        const d = await res.json();
        const um: Message = { id: Date.now().toString(), sender: "user", content: d.user_text, isVoice: true };
        const bm: Message = { id: (Date.now()+1).toString(), sender: "bot", content: d.bot_text };
        setMessages(p => [...p, um, bm]);
        parseContext(d.user_text);
        if (d.audio_base64 && voiceEnabled) new Audio(`data:audio/mp3;base64,${d.audio_base64}`).play().catch(()=>{});
      } else throw new Error();
    } catch {
      setMessages(p => [...p, { id: Date.now().toString(), sender: "bot", content: "Sorry, I had trouble with your voice message. Please try typing." }]);
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const speakMessage = async (text: string, msgId: string) => {
    setSpeakingMsgId(msgId);
    try {
      const fd = new FormData();
      fd.append("text", text.slice(0, 500));
      const res = await fetch(`${API_URL}/api/chatbot/speak`, { method: "POST", body: fd });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play().catch(()=>{});
        audio.onended = () => { URL.revokeObjectURL(url); setSpeakingMsgId(null); };
      } else setSpeakingMsgId(null);
    } catch { setSpeakingMsgId(null); }
  };

  const quoteParams = () => {
    const p = new URLSearchParams();
    if (collectedInfo.eventType) p.set("event_type", collectedInfo.eventType);
    if (collectedInfo.services.includes("SMD Screen")) p.set("requires_smd", "true");
    if (collectedInfo.services.includes("Sound System")) p.set("requires_sound", "true");
    if (collectedInfo.services.includes("3D Stall")) p.set("requires_stall", "true");
    return p.toString() ? `?${p}` : "";
  };

  return (
    <div className="min-h-screen bg-primary pt-20">
      {/* ─── Page Header ───────────────────────────────────────────────── */}
      <div className="border-b border-white/5 bg-surface/50">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs text-accent font-semibold uppercase tracking-wider">AI-Powered</span>
              </div>
              <h1 className="text-xl md:text-3xl font-bold font-heading text-white leading-tight">
                H&B Event Advisor
              </h1>
              <p className="text-muted text-xs md:text-sm mt-0.5">
                Plan your event by voice or text. I'll guide you every step.
              </p>
            </div>
            <button
              onClick={() => setVoiceEnabled(v => !v)}
              className={`self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
                voiceEnabled
                  ? "bg-accent/20 border-accent text-accent"
                  : "border-white/10 text-muted hover:border-white/20 hover:text-white"
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              Voice {voiceEnabled ? "On" : "Off"}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Layout ───────────────────────────────────────────────── */}
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-5xl">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6">

          {/* ─── Chat Panel ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="bg-surface border border-white/5 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-[70vh] md:h-[68vh] lg:h-[65vh]">

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-5 flex flex-col gap-3 md:gap-4">
                <AnimatePresence initial={false}>
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} group`}
                    >
                      {msg.sender === "bot" && (
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mr-2 mt-1">
                          <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        </div>
                      )}
                      <div className={`max-w-[82%] flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                        <div className={`p-3 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.sender === "user"
                            ? "bg-accent text-white rounded-br-sm"
                            : "bg-surface-2 text-accent-light border border-white/5 rounded-bl-sm"
                        }`}>
                          {msg.isVoice && (
                            <span className="text-[10px] opacity-60 flex items-center gap-1 mb-1">
                              <Mic className="w-2.5 h-2.5" /> Voice
                            </span>
                          )}
                          {msg.content}
                        </div>
                        {msg.sender === "bot" && (
                          <button
                            onClick={() => speakMessage(msg.content, msg.id)}
                            disabled={speakingMsgId === msg.id}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-accent ml-1"
                          >
                            {speakingMsgId === msg.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <Volume2 className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {(isTyping || isProcessingVoice) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent shrink-0 mr-2 mt-1">
                      <Sparkles className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    </div>
                    <div className="bg-surface-2 border border-white/5 p-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                      {isProcessingVoice ? (
                        <><Loader2 className="w-3 h-3 animate-spin text-accent" /><span className="text-xs text-muted">Processing voice…</span></>
                      ) : (
                        <>
                          {[0, 0.15, 0.3].map((d, i) => (
                            <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: d }} className="w-1.5 h-1.5 bg-accent/60 rounded-full" />
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Inline Quote CTA (appears after 4 exchanges) */}
                <AnimatePresence>
                  {showQuoteCTA && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-accent/10 border border-accent/30 rounded-2xl p-3 md:p-4 max-w-[82%]">
                        <p className="text-xs md:text-sm text-accent-light mb-2 md:mb-3 font-medium">
                          Ready to turn this into a formal quote request?
                        </p>
                        <Link href={`/quote${quoteParams()}`}>
                          <button className="flex items-center gap-2 bg-accent text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold hover:bg-accent/90 transition-colors">
                            Build Your Quote <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* Quick reply chips */}
              {messages.length <= 2 && (
                <div className="px-3 pb-2 flex flex-wrap gap-1.5 md:gap-2">
                  {chips.map(chip => (
                    <button
                      key={chip.label}
                      onClick={() => sendMessage(chip.label)}
                      className="flex items-center gap-1 bg-surface-2 border border-white/10 text-accent-light text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1.5 rounded-full hover:border-accent/40 hover:text-accent transition-colors"
                    >
                      <chip.icon className="w-2.5 h-2.5 md:w-3 md:h-3 shrink-0" />
                      {chip.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Recording bar */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-4 py-2 bg-danger/10 border-t border-danger/20 flex items-center gap-2">
                      <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-danger rounded-full" />
                      <span className="text-xs text-danger font-medium">Recording — tap mic to send</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input */}
              <div className="p-3 md:p-4 border-t border-white/5 bg-surface">
                <div className="flex items-end gap-1.5 bg-surface-2 border border-white/10 rounded-xl p-1 focus-within:border-accent/50 transition-colors">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder={isRecording ? "Recording…" : isProcessingVoice ? "Processing…" : "Ask me about your event…"}
                    disabled={isRecording || isProcessingVoice || isTyping}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-xs md:text-sm p-2 max-h-24 min-h-[38px] resize-none disabled:opacity-40"
                    rows={1}
                  />
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessingVoice || isTyping}
                    className={`p-1.5 md:p-2 rounded-lg transition-colors mb-1 disabled:opacity-40 ${
                      isRecording ? "text-danger hover:bg-danger/10 animate-pulse" : "text-muted hover:text-accent hover:bg-accent/10"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Mic className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  </button>
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isTyping || isRecording || isProcessingVoice}
                    className="p-1.5 md:p-2 text-accent hover:bg-accent/10 rounded-lg disabled:opacity-40 transition-colors mb-1 mr-1"
                  >
                    <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                </div>
                <p className="text-[10px] md:text-xs text-muted text-center mt-1.5">
                  Enter to send · mic for voice · powered by Groq AI
                </p>
              </div>
            </div>
          </div>

          {/* ─── Info Panel (desktop only) ────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Collected summary */}
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" /> Event Summary
              </h3>
              <div className="space-y-3 text-sm">
                <InfoRow label="Event Type" value={collectedInfo.eventType} />
                <div>
                  <span className="text-muted text-xs uppercase tracking-wider block mb-1.5">Services</span>
                  {collectedInfo.services.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {collectedInfo.services.map(s => (
                        <span key={s} className="text-xs bg-accent/15 text-accent border border-accent/25 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted italic text-xs">Not yet discussed</span>
                  )}
                </div>
              </div>
              {(collectedInfo.eventType || collectedInfo.services.length > 0) && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <Link href={`/quote${quoteParams()}`}>
                    <Button className="w-full gap-2 text-sm">
                      Build Quote <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Services reference */}
            <div className="bg-surface border border-white/5 rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm mb-3">Our Services</h3>
              <div className="space-y-3">
                {[
                  { icon: Monitor, name: "SMD Screen Rental", desc: "Indoor P3 & outdoor P6" },
                  { icon: Monitor, name: "Sound Systems", desc: "JBL line-array + Shure mics" },
                  { icon: Building2, name: "3D Stall Fabrication", desc: "Render to build, end-to-end" },
                ].map(s => (
                  <div key={s.name} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                      <s.icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-white text-xs font-semibold">{s.name}</p>
                      <p className="text-muted text-xs">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent/5 border border-accent/15 rounded-2xl p-4">
              <p className="text-xs text-accent-light leading-relaxed">
                <strong className="text-accent">Voice tip:</strong> Enable Voice above to hear responses. Tap the mic in the chat to speak.
              </p>
            </div>
          </div>

          {/* ─── Mobile: compact quote CTA when info collected ─────────── */}
          {(collectedInfo.eventType || collectedInfo.services.length > 0) && (
            <div className="lg:hidden bg-accent/10 border border-accent/25 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-muted mb-0.5">Planning detected</p>
                <p className="text-sm font-semibold text-white truncate">
                  {collectedInfo.eventType || "Your event"}{collectedInfo.services.length > 0 ? ` · ${collectedInfo.services.join(", ")}` : ""}
                </p>
              </div>
              <Link href={`/quote${quoteParams()}`} className="shrink-0">
                <button className="flex items-center gap-1.5 bg-accent text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-accent/90 transition-colors">
                  Quote <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="text-muted text-xs uppercase tracking-wider block mb-0.5">{label}</span>
      {value
        ? <span className="text-white text-sm font-medium flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent" />{value}</span>
        : <span className="text-muted italic text-xs">Not yet discussed</span>}
    </div>
  );
}
