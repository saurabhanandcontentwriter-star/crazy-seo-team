import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const allowed = [
    "sauravanand499@gmail.com",
    "crazyseoteam@gmail.com",
  ];

  const login = () => {
    const email = prompt("Enter Email:");
    if (allowed.includes(email)) {
      localStorage.setItem("admin", "true");
      localStorage.setItem("adminEmail", email);
      navigate("/admin");
    } else {
      alert("Accessallow");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Admin Login</h1>
      <button onClick={login}>Login</button>
    </div>
  );
}
