window.location.href = "/admin";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Legacy screen: authentication is handled by Supabase in src/pages/admin/Login.tsx.
    if (username === "crazyseoteamnalanda" && password.length > 0) {
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/admin/dashboard");
    } else {
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin}>
        <h1>Admin Login</h1>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
