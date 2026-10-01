import { useEffect, useMemo, useRef, useState } from "react";

const START_SECONDS = 2 * 60 + 20;

const LaunchCelebration = () => {
  const [seconds, setSeconds] = useState(START_SECONDS);
  const [launched, setLaunched] = useState(false);
  const [visible, setVisible] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const confetti = useMemo(() => Array.from({ length: 42 }, (_, i) => i), []);

  const playTone = (frequency: number, duration = 0.12, type: OscillatorType = "sine") => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = audioRef.current || new AudioCtx();
    audioRef.current = ctx;
    if (ctx.state === "suspended") void ctx.resume();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration + 0.03);
  };

  const toggleSound = () => {
    setSoundOn((value) => {
      const next = !value;
      if (next) playTone(660, 0.2, "triangle");
      return next;
    });
  };

  useEffect(() => {
    const seen = sessionStorage.getItem("cst-launch-screen-seen");
    if (seen) { setVisible(false); return; }

    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setLaunched(true);
          sessionStorage.setItem("cst-launch-screen-seen", "1");
          if (soundOn) {
            playTone(523, 0.18, "triangle");
            window.setTimeout(() => playTone(659, 0.18, "triangle"), 170);
            window.setTimeout(() => playTone(784, 0.3, "triangle"), 340);
          }
          window.setTimeout(() => setVisible(false), 3600);
          return 0;
        }
        if (soundOn) playTone(value <= 10 ? 880 : 440, value <= 10 ? 0.08 : 0.045, "sine");
        return value - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
      audioRef.current?.close().catch(() => undefined);
    };
  }, [soundOn]);

  if (!visible) return null;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className={"fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#050816] text-white transition-opacity duration-700 " + (launched ? "opacity-0" : "opacity-100")}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,.24),transparent_35%),radial-gradient(circle_at_20%_80%,rgba(168,85,247,.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,.14),transparent_28%)]" />
      {confetti.map((i) => <span key={i} className="absolute h-2 w-1.5 rounded-sm bg-cyan-300 animate-[cst-confetti_2.8s_ease-out_forwards]" style={{ left: ((i * 37) % 100) + "%", top: ((i * 19) % 100) + "%", animationDelay: ((i % 12) * 55) + "ms", transform: "rotate(" + (i * 31) + "deg)" }} />)}
      <div className="absolute right-5 top-5 z-20">
        <button type="button" onClick={toggleSound} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-white backdrop-blur transition hover:bg-white/15" aria-label={soundOn ? "Turn launch sound off" : "Turn launch sound on"}>
          {soundOn ? "Sound On" : "Enable Sound"}
        </button>
      </div>
      <div className="relative z-10 w-full max-w-4xl px-5 text-center">
        {!launched ? (
          <>
            <div className="mx-auto mb-6 inline-flex rounded-full border border-cyan-300/20 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[.28em] text-cyan-200 backdrop-blur">Official Website Launch</div>
            <p className="text-sm font-semibold uppercase tracking-[.35em] text-blue-200">Crazy SEO Team</p>
            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-7xl md:text-8xl">Something Big<br /><span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">Is Coming.</span></h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-300 sm:text-lg">The next generation of SEO, AI & digital growth is about to launch.</p>
            <div className="mt-10 flex items-center justify-center gap-2 sm:gap-4">
              {[{v:"0",l:"DAYS"},{v:"0",l:"HOURS"},{v:String(minutes).padStart(2,"0"),l:"MIN"},{v:String(secs).padStart(2,"0"),l:"SEC"}].map((item) => <div key={item.l} className="min-w-[64px] rounded-2xl border border-white/10 bg-white/[.07] px-3 py-4 shadow-2xl backdrop-blur sm:min-w-[100px] sm:px-5 sm:py-5"><div className="text-2xl font-black tabular-nums sm:text-4xl">{item.v}</div><div className="mt-1 text-[9px] font-bold tracking-[.2em] text-slate-400 sm:text-[10px]">{item.l}</div></div>)}
            </div>
            <p className="mt-8 text-xs uppercase tracking-[.25em] text-slate-500">Get ready • We’re launching</p>
            <p className="mt-3 text-[10px] text-slate-600">Tap Enable Sound for launch music & countdown effects.</p>
          </>
        ) : (
          <div className="animate-[cst-launch_1s_ease-out]">
            <div className="text-6xl sm:text-8xl">🎉</div>
            <p className="mt-5 text-sm font-bold uppercase tracking-[.35em] text-cyan-200">We’re Live!</p>
            <h2 className="mt-4 text-5xl font-black sm:text-7xl">CRAZY SEO TEAM</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-slate-300 sm:text-xl">The new era of digital growth starts now.</p>
          </div>
        )}
      </div>
      <style>{"@keyframes cst-confetti{0%{opacity:0;transform:translateY(-30px) rotate(0deg)}20%{opacity:1}100%{opacity:.15;transform:translateY(110vh) rotate(540deg)}}@keyframes cst-launch{0%{opacity:0;transform:scale(.72)}65%{opacity:1;transform:scale(1.06)}100%{transform:scale(1)}}"}</style>
    </div>
  );
};

export default LaunchCelebration;