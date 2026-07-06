window.location.href = "/admin";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (
      username === "Crazyseoteam" &&
      password === "Crazyseoteam@#$2025"
    ) {
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

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const loggedIn = localStorage.getItem("adminLoggedIn");

  return loggedIn === "true"
    ? children
    : <Navigate to="/admin/login" replace />;
}
function logout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "/admin/login";
}
