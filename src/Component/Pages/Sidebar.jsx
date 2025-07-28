
import React from "react";
import {
  Phone,
  MessageSquareText,
  PhoneForwarded,
  LogOut,
  Menu,
  X,
  Smartphone,
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { toast } from "react-hot-toast";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // 👇 get user role from cookie
  const role = Cookies.get("role");
  const handleLogout = () => {
    setLoading(true);
    setTimeout(() => {
      Cookies.remove("CallingAgent");
      Cookies.remove("role");
      toast.success("Logged out successfully");
      navigate("/login");
      setLoading(false);
    }, 1000);
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full w-full">
      <div>
        <div className="border-b border-gray-600 w-full">
          <h2 className="text-xl font-bold text-center py-4">Dashboard</h2>
        </div>

        <ul className="mt-6 space-y-2 px-4">
          {/* Always visible menu items */}
          <li>
            <button
              onClick={() => {
                navigate("/calling");
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                location.pathname === "/calling"
                  ? "bg-gray-700 text-gray-300"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Phone size={18} />
              Calls Log
            </button>
          </li>

          <li>
            <button
              onClick={() => {
                navigate("/whatsapp-logs");
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                location.pathname === "/whatsapp-logs"
                  ? "bg-gray-700 text-gray-300"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <MessageSquareText size={18} />
              WhatsApp Logs
            </button>
          </li>

          {/* Conditionally render Send Call only if admin */}
          {role === "admin" && (
            <li>
              <button
                onClick={() => {
                  navigate("/sendcall");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                  location.pathname === "/sendcall"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <PhoneForwarded size={18} />
                Send Call
              </button>
            </li>
          )}

          <li>
            <button
              onClick={() => {
                navigate("/whats-app");
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                location.pathname === "/whats-app"
                  ? "bg-gray-700 text-gray-300"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Smartphone size={18} />
              WhatsApp
            </button>
          </li>
        </ul>
      </div>

      <div className="space-y-2 px-4 pb-4">
        <button
          onClick={handleLogout}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
          ) : (
            <LogOut size={16} />
          )}
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );

  const isWhatsAppFull = location.pathname === "/whats-app";

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900 relative">
      {!isWhatsAppFull && (
        <div className="w-full bg-[#101826] text-white px-4 py-3 flex items-center justify-between md:hidden">
          <button onClick={() => setMobileOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      )}

      <div className="flex flex-1">
        {!isWhatsAppFull && mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {!isWhatsAppFull && (
          <aside
            className={`fixed z-50 top-0 left-0 w-64 h-full bg-[#101826] text-white shadow-lg transform transition-transform duration-300 md:hidden overflow-y-auto flex flex-col ${
              mobileOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex justify-end px-4 py-4">
              <button onClick={() => setMobileOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        )}

        {!isWhatsAppFull && (
          <aside className="hidden md:flex w-64 bg-[#101826] text-white">
            <SidebarContent />
          </aside>
        )}

        <main
          className={`flex-1 overflow-auto ${
            isWhatsAppFull ? "p-0" : "p-4 md:p-6"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
