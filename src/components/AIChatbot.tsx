import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Mic, MicOff, Volume2, VolumeX, Copy, Trash2, Sparkles, Search, FileText, BarChart3, Tag, Code2, ShieldCheck, Bot, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";

type Msg = { role: "user" | "assistant"; content: string; ts: number };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;
const TTS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-tts`;
const STT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-stt`;
const AUTH = `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;
const STORAGE_KEY = "cst-chat-history-v1";

const QUICK_ACTIONS = [
  { icon: ShieldCheck, label: "Run Website Audit", prompt: "Give me a step-by-step SEO audit checklist I can run on my website today." },
  { icon: FileText, label: "Generate Blog Post", prompt: "Suggest 5 blog post ideas for an AI SEO agency targeting founders and marketers in 2026." },
  { icon: BarChart3, label: "Analyze Competitor", prompt: "How should I analyze a competitor's SEO and AI-search visibility? Give me a framework." },
  { icon: Tag, label: "Create Meta Tags", prompt: "Write an SEO-optimized meta title and description for a homepage that offers AI SEO, GEO, and LLM optimization services." },
  { icon: Code2, label: "Generate Schema", prompt: "Show me the JSON-LD schema I need for an SEO agency homepage." },
  { icon: Zap, label: "AI Visibility Check", prompt: "How do I check and improve my brand visibility inside ChatGPT, Gemini, Claude, and Perplexity?" },
  { icon: Search, label: "Keyword Research", prompt: "Walk me through modern keyword research for AI-driven search engines in 2026." },
  { icon: Sparkles, label: "Optimize Google Ads", prompt: "How can I improve ROAS on my Google Ads account? Give me a prioritized action list." },
];

const WELCOME: Msg = {
  role: "assistant",
  ts: Date.now(),
  content: "👋 **Welcome to the Crazy SEO Team AI Assistant.**\n\nI'm your enterprise SEO & AI-search concierge — ask me anything about **SEO, GEO, AEO, LLM SEO, Google Ads, or AI development**. Pick a quick action below or type your question.",
};

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [ttsBusy, setTtsBusy] = useState<number | null>(null);
  const [audioOn, setAudioOn] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* noop */ }
    return [WELCOME];
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50))); } catch { /* noop */ }
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const showWelcome = messages.length === 1 && messages[0].role === "assistant" && messages[0].content === WELCOME.content;

  const send = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || busy) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", content: text, ts: Date.now() }];
    setMessages(next);
    setBusy(true);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: AUTH },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
      });
      if (resp.status === 429) { toast.error("Rate limit — try again shortly."); setBusy(false); return; }
      if (resp.status === 402) { toast.error("AI credits exhausted."); setBusy(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Stream failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "", assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "", ts: Date.now() }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl); buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const j = line.slice(6).trim();
          if (j === "[DONE]") { buf = ""; break; }
          try {
            const p = JSON.parse(j);
            const c = p.choices?.[0]?.delta?.content;
            if (c) {
              assistant += c;
              setMessages((m) => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: assistant } : msg));
            }
          } catch { buf = line + "\n" + buf; break; }
        }
      }

      if (audioOn && assistant) playTTS(assistant, -1);
    } catch (e) {
      toast.error("Chat failed", { description: e instanceof Error ? e.message : "unknown" });
    } finally {
      setBusy(false);
    }
  }, [input, busy, messages, audioOn]);

  const playTTS = async (text: string, idx: number) => {
    try {
      setTtsBusy(idx);
      audioElRef.current?.pause();
      const resp = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: AUTH },
        body: JSON.stringify({ text: text.replace(/[*_#`>[\]()]/g, "").slice(0, 2000), voice: "alloy" }),
      });
      if (!resp.ok) throw new Error("TTS failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioElRef.current = audio;
      audio.onended = () => { setTtsBusy(null); URL.revokeObjectURL(url); };
      audio.play();
    } catch {
      setTtsBusy(null);
      toast.error("Voice playback failed");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || "audio/webm" });
        if (blob.size < 1000) { toast.error("Recording too short."); return; }
        const fd = new FormData();
        fd.append("file", blob, "voice.webm");
        setBusy(true);
        try {
          const resp = await fetch(STT_URL, { method: "POST", headers: { Authorization: AUTH }, body: fd });
          const data = await resp.json();
          setBusy(false);
          if (!resp.ok) throw new Error(data.error || "STT failed");
          if (data.text?.trim()) send(data.text.trim());
        } catch (err) {
          setBusy(false);
          toast.error("Voice input failed", { description: err instanceof Error ? err.message : "" });
        }
      };
      mr.start();
      setRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const clearChat = () => {
    setMessages([{ ...WELCOME, ts: Date.now() }]);
    audioElRef.current?.pause();
    setTtsBusy(null);
  };

  const copyMsg = (t: string) => {
    navigator.clipboard.writeText(t);
    toast.success("Copied");
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 group"
          aria-label="Open AI assistant"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-70 group-hover:opacity-100 animate-pulse" />
          <span className="relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl border border-white/20 backdrop-blur-xl group-hover:scale-105 transition-transform">
            <AIOrb size={28} />
            <span className="text-sm font-semibold hidden sm:inline">Ask AI</span>
          </span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[min(420px,92vw)] sm:h-[min(680px,88vh)] flex flex-col rounded-none sm:rounded-3xl overflow-hidden shadow-[0_25px_80px_-15px_rgba(120,0,255,0.5)] border border-white/10 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-purple-950/95 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute -top-24 -left-16 w-64 h-64 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 w-64 h-64 rounded-full bg-purple-500/30 blur-3xl" />

          {/* Header */}
          <header className="relative flex items-center gap-3 p-4 border-b border-white/10 bg-white/5 backdrop-blur-xl">
            <AIOrb size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">Crazy SEO AI Assistant</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online · SEO · GEO · AEO · LLM SEO
              </p>
            </div>
            <button
              onClick={() => setAudioOn((v) => !v)}
              className={`p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition ${audioOn ? "text-emerald-400" : ""}`}
              title={audioOn ? "Voice replies on" : "Voice replies off"}
              aria-label="Toggle voice replies"
            >
              {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button onClick={clearChat} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition" title="Clear chat" aria-label="Clear chat">
              <Trash2 size={16} />
            </button>
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition" aria-label="Close">
              <X size={18} />
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto p-4 space-y-4">
            {showWelcome && (
              <div className="text-center pt-4 pb-2 animate-in fade-in duration-500">
                <div className="mx-auto mb-3"><AIOrb size={72} /></div>
                <h2 className="text-lg font-bold text-white">Boost Visibility in Google, ChatGPT, Gemini & AI Search</h2>
                <p className="text-xs text-white/60 mt-1 mb-4">Pick a quick action or ask anything.</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} group`}>
                {m.role === "assistant" && (
                  <div className="mr-2 mt-1 shrink-0"><AIOrb size={26} /></div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-900/40"
                    : "bg-white/10 text-white/95 border border-white/10 backdrop-blur"
                }`}>
                  {m.content ? (
                    <div className="prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0 prose-a:text-cyan-300 prose-strong:text-white break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => href?.startsWith("/") ? <Link to={href} className="text-cyan-300 underline underline-offset-2" onClick={() => setOpen(false)}>{children}</Link> : <a href={href} target="_blank" rel="noreferrer" className="text-cyan-300 underline underline-offset-2">{children}</a>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <TypingDots />
                  )}
                  {m.role === "assistant" && m.content && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => copyMsg(m.content)} className="text-[10px] text-white/60 hover:text-white flex items-center gap-1"><Copy size={11} /> Copy</button>
                      <button onClick={() => playTTS(m.content, i)} disabled={ttsBusy === i} className="text-[10px] text-white/60 hover:text-white flex items-center gap-1 disabled:opacity-50">
                        {ttsBusy === i ? <Loader2 size={11} className="animate-spin" /> : <Volume2 size={11} />} Listen
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {busy && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="mr-2 mt-1"><AIOrb size={26} thinking /></div>
                <div className="bg-white/10 border border-white/10 rounded-2xl px-3.5 py-2.5"><TypingDots /></div>
              </div>
            )}
          </div>

          {/* Quick actions */}
          {showWelcome && (
            <div className="relative px-4 pb-2 grid grid-cols-2 gap-2 max-h-[45%] overflow-y-auto">
              {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => send(prompt)}
                  className="text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition group"
                >
                  <Icon size={14} className="text-cyan-300 mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-[11px] font-medium text-white leading-tight">{label}</p>
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <div className="relative p-3 border-t border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="flex items-end gap-2 rounded-2xl bg-slate-900/80 border border-white/10 focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/20 transition p-1.5">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask about SEO, AI search, GEO, ads..."
                disabled={busy || recording}
                maxLength={1000}
                rows={1}
                className="flex-1 min-h-[36px] max-h-[120px] resize-none bg-transparent border-0 text-white placeholder:text-white/40 focus-visible:ring-0 text-sm py-1.5"
              />
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={busy}
                className={`shrink-0 p-2 rounded-xl transition ${recording ? "bg-red-500 text-white animate-pulse" : "text-white/70 hover:text-white hover:bg-white/10"} disabled:opacity-40`}
                aria-label={recording ? "Stop recording" : "Voice input"}
                title="Voice input"
              >
                {recording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <Button
                size="icon"
                onClick={() => send()}
                disabled={busy || !input.trim()}
                className="shrink-0 h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-40"
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </Button>
            </div>
            <p className="text-[10px] text-white/40 text-center mt-2">Powered by Lovable AI · Enterprise SEO Concierge</p>
          </div>
        </div>
      )}
    </>
  );
};

const AIOrb = ({ size = 40, thinking = false }: { size?: number; thinking?: boolean }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 blur-md opacity-70 animate-pulse" />
    <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-cyan-300 via-blue-500 to-purple-700 shadow-inner overflow-hidden ${thinking ? "animate-pulse" : ""}`}>
      <div className="absolute inset-[15%] rounded-full bg-gradient-to-tr from-white/70 to-transparent blur-sm" />
      <div className="absolute top-[20%] left-[25%] w-[20%] h-[20%] rounded-full bg-white/80 blur-[1px]" />
      <Bot size={size * 0.4} className="absolute inset-0 m-auto text-white/90" strokeWidth={2.5} />
    </div>
  </div>
);

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-bounce" style={{ animationDelay: "0ms" }} />
    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
  </div>
);

export default AIChatbot;
