import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();

  // ✅ allowed emails
  const allowedEmails = [
    "sauravanand499@gmail.com",
    "crazyseoteam@gmail.com"
  ];

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (isAdmin === "true") {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleLogin = () => {
    const email = prompt("Enter Admin Email:");

    if (allowedEmails.includes(email)) {
      localStorage.setItem("admin", "true");
      localStorage.setItem("adminEmail", email);
      navigate("/admin");
    } else {
      alert("Access Denied ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 border rounded-xl text-center">
        <Lock size={30} />
        <h1 className="text-xl font-bold mt-2 mb-4">Admin Login</h1>

        <Button onClick={handleLogin}>
          Login as Admin
        </Button>
      </div>
    </div>
  );
};

export default AdminLogin;
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");

    if (isAdmin !== "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("adminEmail");
    navigate("/");
  };

  const email = localStorage.getItem("adminEmail");

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome Admin 🚀</h1>
      <p>{email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default AdminPage;
