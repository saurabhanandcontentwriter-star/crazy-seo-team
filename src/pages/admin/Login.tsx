import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-card shadow-xl text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
            <ShieldCheck size={28} className="text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Click below to open the admin dashboard.
        </p>
        <Button
          onClick={() => navigate("/admin")}
          className="w-full gradient-bg text-primary-foreground"
          size="lg"
        >
          Open Admin Dashboard
          <ArrowRight size={18} className="ml-2" />
        </Button>
      </div>
    </div>
  );
}
