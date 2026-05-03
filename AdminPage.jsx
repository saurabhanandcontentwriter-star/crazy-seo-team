import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("admin") !== "true") {
      navigate("/");
    }
  }, [navigate]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const email = localStorage.getItem("email");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div style={{
        width: "220px",
        background: "#111",
        color: "#fff",
        padding: "20px"
      }}>
        <h2>Dashboard</h2>
        <p style={{ fontSize: "12px" }}>{email}</p>

        <hr />
        <p>📊 Overview</p>
        <p>📝 Blogs</p>
        <p>⚙ Settings</p>

        <button onClick={logout} style={{
          marginTop: "20px",
          padding: "8px",
          width: "100%"
        }}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "20px" }}>
        <h1>Welcome 🚀</h1>

        {/* Cards */}
        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          <div style={card}>Visitors<br/><b>1200</b></div>
          <div style={card}>Blogs<br/><b>15</b></div>
          <div style={card}>Leads<br/><b>32</b></div>
        </div>

        {/* Table */}
        <div style={{ marginTop: "40px" }}>
          <h3>Recent Activity</h3>
          <table border="1" width="100%" cellPadding="10">
            <tr><th>Date</th><th>Action</th></tr>
            <tr><td>Today</td><td>New blog added</td></tr>
            <tr><td>Yesterday</td><td>User login</td></tr>
          </table>
        </div>
      </div>
    </div>
  );
}

const card = {
  flex: 1,
  padding: "20px",
  background: "#f3f3f3",
  borderRadius: "10px",
  textAlign: "center"
};
