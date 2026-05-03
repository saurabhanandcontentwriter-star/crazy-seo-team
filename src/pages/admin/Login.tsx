import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (isAdmin === "true") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogin = () => {
    const email = prompt("Enter Admin Email:");

    // 👉 अपना email यहाँ डालो
    if (email === "admin@gmail.com") {
      localStorage.setItem("admin", "true");
      navigate("/admin");
    } else {
      alert("Access Denied ❌");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center">
            <Lock className="text-primary-foreground" size={26} />
          </div>
        </div>

        <h1 className="text-2xl font-black text-center mb-6">
          Admin Login
        </h1>

        <Button
          onClick={handleLogin}
          className="w-full gradient-bg text-primary-foreground h-12 font-semibold"
        >
          Login as Admin
        </Button>
      </div>
    </div>
  );
};

export default AdminLogin;
