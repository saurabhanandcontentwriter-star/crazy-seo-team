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

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome Admin</h1>
      <p>{localStorage.getItem("adminEmail")}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
