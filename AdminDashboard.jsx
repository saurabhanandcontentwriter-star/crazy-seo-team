import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  // 🔒 protect page
  useEffect(() => {
    if (localStorage.getItem("admin") !== "true") {
      navigate("/");
    }
  }, [navigate]);

  // demo data
  useEffect(() => {
    setPosts([
      { id: 1, title: "SEO Tips 2026" },
      { id: 2, title: "How to Rank Website" }
    ]);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div style={{
        width: "220px",
        background: "#111",
        color: "#fff",
        padding: "20px"
      }}>
        <h2>Admin Panel</h2>

        <p style={{ fontSize: "12px" }}>
          {localStorage.getItem("adminEmail")}
        </p>

        <hr />

        <p>📊 Dashboard</p>
        <p>📝 Blog</p>

        <button onClick={logout} style={{ marginTop: "20px" }}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Dashboard 🚀</h1>

        <h3>Posts</h3>

        {posts.map((p) => (
          <div key={p.id} style={{
            padding: "10px",
            border: "1px solid #ccc",
            marginBottom: "10px"
          }}>
            {p.title}
          </div>
        ))}
      </div>

    </div>
  );
}
