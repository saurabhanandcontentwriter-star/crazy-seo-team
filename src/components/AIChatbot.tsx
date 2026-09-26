import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, Mic, MicOff, Volume2, VolumeX, Copy, Trash2, Search, FileText, BarChart3, Tag, Code2, ShieldCheck, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link } from "react-router-dom";
import avatarImg from "@/assets/ai-avatar.jpg";

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

const AGENT_CONTEXT = `You are Sneha, the friendly, natural, two-way voice and chat assistant for ANVYA and Crazy SEO Team.
Speak naturally in Hindi or Hinglish according to the user's language. Do not sound robotic or read a fixed script.
For voice mode, behave like a real conversation: listen to the user's complete turn, understand it, answer briefly and naturally, then wait/listen for the next turn. Do not end the conversation after one answer.
ANVYA is a modern ideas, discovery and community knowledge platform where people can share ideas, publish posts and blogs, ask questions, start discussions, discover different perspectives, explore profiles, communities and events, and use AI-assisted discovery.
Crazy SEO Team works across SEO, technical SEO, on-page/off-page SEO, keyword research, content optimization, SEO audits, Core Web Vitals, schema, indexation, AI SEO, GEO, AEO, LLM optimization, digital marketing, Google Ads, AI solutions, automation, website/web-app development and voice AI assistants.
Keep ANVYA and Crazy SEO Team clearly distinguished: ANVYA is the platform; Crazy SEO Team is the digital growth, technology and SEO team.
If the user asks about ANVYA, explain ANVYA first. If they ask about Crazy SEO Team, explain its relevant services first.
Use short spoken responses in voice mode so the conversation feels natural. Ask one relevant follow-up question when useful.
If speech is unclear, politely ask the user to repeat. Do not interrupt the user.
Continue the conversation until the user says goodbye, asks to end the call, or otherwise clearly indicates they are finished.
Never invent pricing, guarantees, features, results, or policies. If something is not confirmed, say so and offer to collect the requirement.
For interested prospects, politely ask for their name, business/company, requirement and preferred contact details only when appropriate. Never ask for passwords, OTPs, card numbers or other sensitive credentials.`;

const WELCOME: Msg = {
  role: "assistant",
  ts: Date.now(),
  content: "👋 **Namaste! Main Sneha hoon.**\n\nMain ANVYA aur Crazy SEO Team ke baare mein Hindi ya Hinglish mein baat kar sakti hoon. Aap ANVYA, SEO, AI, digital marketing, automation, website development ya voice-agent services ke baare mein pooch sakte hain.\n\nAap chahein toh **Call Sneha** se voice mein bhi baat kar sakte hain.",
};

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const voiceModeRef = useRef(false);
  const recordingRef = useRef(false);
  const [callSeconds, setCallSeconds] = useState(0);
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

  useEffect(() => {
    if (!voiceMode) {
      setCallSeconds(0);
      return;
    }
    const timer = window.setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(timer);
  }, [voiceMode]);

  const formatCallTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener("cst:open-chat", on);
    return () => window.removeEventListener("cst:open-chat", on);
  }, []);

  // Auto welcome teaser after 5 seconds (once per session)
  const [teaser, setTeaser] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("cst-chat-teaser")) return;
    const t = setTimeout(() => setTeaser(true), 5000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => { if (open) setTeaser(false); }, [open]);
  const dismissTeaser = () => { sessionStorage.setItem("cst-chat-teaser", "1"); setTeaser(false); };


  // Spoken female welcome, once per browser session
  const greetedRef = useRef(false);
  useEffect(() => {
    if (!open || greetedRef.current) return;
    greetedRef.current = true;
    if (sessionStorage.getItem("cst-chat-greeted")) return;
    sessionStorage.setItem("cst-chat-greeted", "1");
    playTTS("Namaste! Main Sneha hoon, ANVYA aur Crazy SEO Team ki assistant. Aap ANVYA ya Crazy SEO Team ke baare mein Hindi ya Hinglish mein mujhse baat kar sakte hain. Agar aap chahein, Call Sneha se voice conversation bhi start kar sakte hain.", -2);
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
        body: JSON.stringify({ messages: [{ role: "system", content: AGENT_CONTEXT }, ...next.map(({ role, content }) => ({ role, content }))] }),
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
  }, [input, busy, messages, audioOn, voiceMode]);

  const playTTS = async (text: string, idx: number) => {
    try {
      setTtsBusy(idx);
      audioElRef.current?.pause();
      const resp = await fetch(TTS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: AUTH },
        body: JSON.stringify({ text: text.replace(/[*_#`>[\]()]/g, "").slice(0, 2000), voice: "shimmer" }),
      });
      if (!resp.ok) throw new Error("TTS failed");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioElRef.current = audio;
      audio.onended = () => {
        setTtsBusy(null);
        URL.revokeObjectURL(url);
        if (voiceModeRef.current) setTimeout(() => startRecording(), 500);
      };
      audio.play();
    } catch {
      setTtsBusy(null);
      toast.error("Voice playback failed");
    }
  };

  const startRecording = async () => {
    if (!voiceModeRef.current || recordingRef.current || busy) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        recordingRef.current = false;
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
      recordingRef.current = true;
      setRecording(true);
      if (voiceModeRef.current) {
        window.setTimeout(() => {
          if (voiceModeRef.current && mediaRef.current === mr && mr.state === "recording") mr.stop();
        }, 7000);
      }
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const startVoiceCall = async () => {
    setOpen(true);
    voiceModeRef.current = true;
    setVoiceMode(true);
    setAudioOn(true);
    await startRecording();
  };

  const endVoiceCall = () => {
    voiceModeRef.current = false;
    setVoiceMode(false);
    setAudioOn(false);
    stopRecording();
  };

  const stopRecording = () => {
    recordingRef.current = false;
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
          id="tour-chatbot"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 group"
          aria-label="Open AI assistant"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 blur-xl opacity-70 group-hover:opacity-100 animate-pulse" />
          <span className="relative flex items-center gap-2 pl-2 pr-4 py-2 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl border border-slate-300 backdrop-blur-xl group-hover:scale-105 transition-transform">
            <AIOrb size={36} />
            <span className="text-sm font-semibold hidden sm:inline">Ask Sneha</span>
          </span>
        </button>
      )}

      {!open && teaser && (
        <div className="fixed bottom-24 right-6 z-40 w-[min(300px,80vw)] rounded-3xl border border-white/60 bg-white/90 backdrop-blur-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-300">
          <button
            onClick={dismissTeaser}
            aria-label="Dismiss"
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
          >
            <X size={14} />
          </button>
          <p className="text-sm font-semibold text-slate-900">👋 Welcome to Crazy SEO Team</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            I'm your AI SEO Assistant — SEO, GEO, AEO, LLM optimization, Google Ads, AI development, website audits and
            content writing. Ask me anything.
          </p>
          <Button size="sm" className="mt-3 w-full rounded-2xl" onClick={() => { dismissTeaser(); setOpen(true); }}>
            Start chatting
          </Button>
        </div>
      )}


      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 sm:w-[min(420px,92vw)] sm:h-[min(680px,88vh)] flex flex-col rounded-none sm:rounded-3xl overflow-hidden shadow-[0_25px_80px_-15px_rgba(99,102,241,0.35)] border border-white/60 bg-white/85 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Ambient blobs */}
          <div className="pointer-events-none absolute -top-24 -left-16 w-64 h-64 rounded-full bg-blue-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-16 w-64 h-64 rounded-full bg-purple-500/30 blur-3xl" />

          {/* Header */}
          <header className="relative flex items-center gap-3 p-4 border-b border-slate-200 bg-white/70 backdrop-blur-xl">
            <AIOrb size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 leading-tight">Crazy SEO AI Assistant</p>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online · SEO · GEO · AEO · LLM SEO
              </p>
            </div>
            <button
              onClick={voiceMode ? endVoiceCall : startVoiceCall}
              className={voiceMode ? "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold bg-red-50 text-red-600" : "flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700"}
              title={voiceMode ? "End voice conversation" : "Call Sneha"}
              aria-label={voiceMode ? "End voice conversation" : "Call Sneha"}
            >
              {voiceMode ? <VolumeX size={15} /> : <Mic size={15} />}
              {voiceMode ? "End Call" : "Call Sneha"}
            </button>
            <button
              onClick={() => setAudioOn((v) => !v)}
              className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition ${audioOn ? "text-emerald-600" : ""}`}
              title={audioOn ? "Voice replies on" : "Voice replies off"}
              aria-label="Toggle voice replies"
            >
              {audioOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button onClick={clearChat} className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition" title="Clear chat" aria-label="Clear chat">
              <Trash2 size={16} />
            </button>
            <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition" aria-label="Close">
              <X size={18} />
            </button>
          </header>

          {voiceMode ? (
            <div className="relative flex-1 flex flex-col items-center justify-between overflow-hidden bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.45),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,0.2),transparent_30%)]" />
              <div className="relative z-10 w-full px-6 pt-10 text-center">
                <div className="mx-auto mb-5 relative h-28 w-28">
                  <div className={`absolute inset-0 rounded-full bg-indigo-500/30 blur-xl ${recording || ttsBusy !== null ? "animate-pulse" : ""}`} />
                  <div className="relative h-28 w-28 rounded-full border-4 border-white/20 bg-slate-900 shadow-2xl overflow-hidden flex items-center justify-center">
                    <img src={avatarImg} alt="Sneha" className="h-full w-full object-cover" />
                  </div>
                  <span className="absolute right-1 bottom-2 h-4 w-4 rounded-full bg-emerald-400 border-2 border-slate-950" />
                </div>
                <h2 className="text-2xl font-bold">Sneha</h2>
                <p className="mt-1 text-sm text-indigo-200">ANVYA & Crazy SEO Team</p>
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {ttsBusy !== null ? "Sneha is speaking…" : recording ? "Listening to you…" : busy ? "Thinking…" : "Connected"}
                </p>
                <p className="mt-2 font-mono text-sm text-white/60">{formatCallTime(callSeconds)}</p>
              </div>

              <div className="relative z-10 w-full px-6 pb-8">
                <div className="mx-auto mb-8 max-w-sm rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-center backdrop-blur-xl">
                  <p className="text-sm text-white/85">
                    {recording
                      ? "Aap boliye, main sun rahi hoon…"
                      : ttsBusy !== null
                        ? "Sneha aapko reply kar rahi hai…"
                        : "Call connected. Aap Hindi ya Hinglish mein baat kar sakte hain."}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-5">
                  <button
                    onClick={endVoiceCall}
                    className="h-16 w-16 rounded-full bg-red-500 text-white shadow-xl shadow-red-950/40 hover:bg-red-600 transition flex items-center justify-center"
                    aria-label="End call"
                    title="End call"
                  >
                    <VolumeX size={24} />
                  </button>
                </div>
                <p className="mt-3 text-center text-[11px] text-white/45">Tap the red button to end the call</p>
              </div>
            </div>
          ) : (
          <>
          {/* Messages */}
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto p-4 space-y-4">
            {showWelcome && (
              <div className="text-center pt-4 pb-2 animate-in fade-in duration-500">
                <div className="mx-auto mb-3"><AIOrb size={72} /></div>
                <h2 className="text-lg font-bold text-slate-900">Boost Visibility in Google, ChatGPT, Gemini & AI Search</h2>
                <p className="text-xs text-slate-500 mt-1 mb-4">Pick a quick action or ask anything.</p>
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
                    : "bg-white text-slate-800 border border-slate-200 backdrop-blur"
                }`}>
                  {m.content ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0 prose-a:text-blue-600 prose-strong:text-slate-900 break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => href?.startsWith("/") ? <Link to={href} className="text-blue-600 underline underline-offset-2" onClick={() => setOpen(false)}>{children}</Link> : <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 underline underline-offset-2">{children}</a>,
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <TypingDots />
                  )}
                  {m.role === "assistant" && m.content && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => copyMsg(m.content)} className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1"><Copy size={11} /> Copy</button>
                      <button onClick={() => playTTS(m.content, i)} disabled={ttsBusy === i} className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-1 disabled:opacity-50">
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
                <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5"><TypingDots /></div>
              </div>
            )}
          </div>
          </>
          )}

          {/* Quick actions */}
          {!voiceMode && showWelcome && (
            <div className="relative px-4 pb-2 grid grid-cols-2 gap-2 max-h-[45%] overflow-y-auto">
              {QUICK_ACTIONS.map(({ icon: Icon, label, prompt }) => (
                <button
                  key={label}
                  onClick={() => send(prompt)}
                  className="text-left p-2.5 rounded-xl bg-white/70 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 transition group"
                >
                  <Icon size={14} className="text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-[11px] font-medium text-slate-800 leading-tight">{label}</p>
                </button>
              ))}
            </div>
          )}

          {!voiceMode && (
          <div className="relative p-3 border-t border-slate-200 bg-white/70 backdrop-blur-xl">
            <div className="flex items-end gap-2 rounded-2xl bg-white border border-slate-200 focus-within:border-cyan-400/50 focus-within:ring-2 focus-within:ring-cyan-400/20 transition p-1.5">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask about SEO, AI search, GEO, ads..."
                disabled={busy || recording}
                maxLength={1000}
                rows={1}
                className="flex-1 min-h-[36px] max-h-[120px] resize-none bg-transparent border-0 text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 text-sm py-1.5"
              />
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={busy}
                className={`shrink-0 p-2 rounded-xl transition ${recording ? "bg-red-500 text-white animate-pulse" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"} disabled:opacity-40`}
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
            <p className="text-[10px] text-slate-400 text-center mt-2">Powered by Lovable AI · Enterprise SEO Concierge</p>
          </div>
          )} 
        </div>
      )}
    </>
  );
};

const AIOrb = ({ size = 40, thinking = false, speaking = false }: { size?: number; thinking?: boolean; speaking?: boolean }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 blur-md ${speaking ? "opacity-90 animate-pulse" : thinking ? "opacity-80 animate-pulse" : "opacity-60"}`} />
    <div className={`absolute -inset-1 rounded-full border border-cyan-300/40 ${speaking ? "animate-ping" : ""}`} />
    <div className={`relative w-full h-full rounded-full overflow-hidden ring-2 ring-white/25 shadow-inner ${thinking ? "animate-pulse" : ""}`}>
      <img src={avatarImg} alt="Sneha, AI voice assistant" className="w-full h-full object-cover" draggable={false} />
      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/30 via-transparent to-cyan-400/10 mix-blend-overlay" />
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
