import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

const ADMIN_USER = "Crazyseoteam";
const ADMIN_PASS = "Crazyseoteam@#$2025";

const genCaptcha = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState(() => genCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [busy, setBusy] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(genCaptcha());
    setCaptchaInput("");
  };

  const captchaStyle = useMemo(
    () => ({
      backgroundImage:
        "repeating-linear-gradient(45deg, hsl(var(--muted)) 0 2px, transparent 2px 6px), repeating-linear-gradient(-45deg, hsl(var(--muted)) 0 2px, transparent 2px 8px)",
    }),
    [captcha],
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => {
      if (userId.trim() !== ADMIN_USER) {
        toast.error("Invalid User ID");
        setBusy(false);
        return;
      }
      if (password !== ADMIN_PASS) {
        toast.error("Invalid password");
        setBusy(false);
        return;
      }
      if (captchaInput.trim().toUpperCase() !== captcha) {
        toast.error("Captcha does not match");
        refreshCaptcha();
        setBusy(false);
        return;
      }
      sessionStorage.setItem("admin_authed", "1");
      sessionStorage.setItem("admin_user_id", ADMIN_USER);
      sessionStorage.setItem("admin_email", "crazyseoteam@gmail.com");
      toast.success("Welcome, Admin");
      navigate("/admin", { replace: true });
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleLogin}
        className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
            <ShieldCheck size={28} className="text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1 text-center">Admin Login</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Enter your credentials to access the dashboard.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="uid">User ID</Label>
            <Input
              id="uid"
              autoComplete="username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID"
              required
            />
          </div>
          <div>
            <Label htmlFor="pwd">Password</Label>
            <Input
              id="pwd"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <Label htmlFor="cap">Captcha</Label>
            <div className="flex items-center gap-2 mb-2">
              <div
                style={captchaStyle}
                className="flex-1 h-12 rounded-md border border-border flex items-center justify-center select-none font-mono text-2xl font-bold tracking-[0.5em] text-foreground italic"
                aria-label="Captcha code"
              >
                <span style={{ textShadow: "1px 1px 0 hsl(var(--primary) / 0.4)" }}>
                  {captcha}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={refreshCaptcha}
                title="Refresh captcha"
              >
                <RefreshCw size={16} />
              </Button>
            </div>
            <Input
              id="cap"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Enter the code above"
              maxLength={6}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={busy}
            className="w-full gradient-bg text-primary-foreground"
            size="lg"
          >
            {busy ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                Login <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
