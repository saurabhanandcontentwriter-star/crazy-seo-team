import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const allowed = [
    "sauravanand499@gmail.com",
    "crazyseoteam@gmail.com"
  ];

  const login = () => {
    const email = prompt("Enter Gmail:");

    if (allowed.includes(email)) {
      localStorage.setItem("admin", "true");
      localStorage.setItem("adminEmail", email);
      navigate("/admin");
    } else {
      alert("Access Denied ❌");
    }
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f5f5f5"
    }}>
      <div style={{
        padding: "30px",
        background: "#fff",
        borderRadius: "10px",
        width: "300px",
        textAlign: "center",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
      }}>
        <h2>Admin Login</h2>

        <button onClick={login} style={{
          padding: "10px",
          width: "100%",
          background: "#4285F4",
          color: "#fff",
          border: "none",
          borderRadius: "5px"
        }}>
          Continue with Gmail
        </button>
      </div>
    </div>
  );
}
