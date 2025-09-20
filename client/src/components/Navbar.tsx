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
    <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gradient-to-r from-[#BCC7DC] to-[#F2F4F7]">
      <div
        className="font-bold cursor-pointer text-[#0D3253] hover:text-[#3E4C65] transition-colors"
        onClick={() => nav("/")}
      >
        Sweet Shop
      </div>
      <div className="flex gap-3 items-center">
        <div className="text-sm text-[#333333]">{displayName}</div>
        <button
          onClick={() => nav("/")}
          className="px-2 py-1.5 bg-[#0D3253] text-white rounded hover:bg-[#3E4C65] transition-colors text-sm"
        >
          Dashboard
        </button>
        {isAdmin && (
          <button
            onClick={() => nav("/admin")}
            className="px-2 py-1.5 bg-[#5CC5D5] text-[#0D3253] rounded hover:bg-[#3E4C65] hover:text-white transition-colors text-sm"
          >
            Admin
          </button>
        )}
        <button
          onClick={onLogout}
          className="px-2 py-1.5 bg-[#333333] text-white rounded hover:bg-[#222222] transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
} 