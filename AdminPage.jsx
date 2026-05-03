import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (isAdmin !== "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const email = localStorage.getItem("adminEmail");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* 🔹 SIDEBAR */}
      <div style={{
        width: "220px",
        background: "#111",
        color: "#fff",
        padding: "20px"
      }}>
        <h2>Admin</h2>
        <p style={{ fontSize: "12px" }}>{email}</p>

        <hr />

        <p>📊 Dashboard</p>
        <p>📝 Blog</p>
        <p>⚙ Settings</p>

        <button onClick={logout} style={{ marginTop: "20px" }}>
          Logout
        </button>
      </div>

      {/* 🔹 MAIN CONTENT */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Dashboard 🚀</h1>

        {/* Cards */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          
          <div style={{
            padding: "20px",
            background: "#f3f3f3",
            borderRadius: "10px",
            flex: 1
          }}>
            <h3>Total Visitors</h3>
            <p>1,234</p>
          </div>

          <div style={{
            padding: "20px",
            background: "#f3f3f3",
            borderRadius: "10px",
            flex: 1
          }}>
            <h3>Blog Posts</h3>
            <p>12</p>
          </div>

          <div style={{
            padding: "20px",
            background: "#f3f3f3",
            borderRadius: "10px",
            flex: 1
          }}>
            <h3>Leads</h3>
            <p>45</p>
          </div>

        </div>

        {/* Table Example */}
        <div style={{ marginTop: "40px" }}>
          <h2>Recent Activity</h2>

          <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "10px" }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Today</td>
                <td>New blog published</td>
              </tr>
              <tr>
                <td>Yesterday</td>
                <td>User login</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
