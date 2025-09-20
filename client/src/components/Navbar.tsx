import { useNavigate } from "react-router-dom";
import { useAuth } from "../context /AuthContext";

export default function Navbar() {
  const { logout, user, isAuthenticated, isAdmin } = useAuth();
  const nav = useNavigate();

  const onLogout = () => {
    if (!confirm("Logout now?")) return;
    logout();
    nav("/login", { replace: true });
  };

  if (!isAuthenticated) return null;

  // prefer showing the user's name; fallback to role or "User"
  const displayName = user?.name ?? (user?.role ? String(user.role).toUpperCase() : "User");

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 8, borderBottom: "1px solid #eee" }}>
      <div style={{ fontWeight: 700, cursor: "pointer" }} onClick={() => nav("/")}>Sweet Shop</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: 14 }}>{displayName}</div>
        <button onClick={() => nav("/")} style={{ padding: "6px 8px" }}>Dashboard</button>
        {isAdmin && <button onClick={() => nav("/admin")} style={{ padding: "6px 8px" }}>Admin</button>}
        <button onClick={onLogout} style={{ padding: "6px 8px" }}>Logout</button>
      </div>
    </div>
  );
} 