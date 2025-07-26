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

const navItems = [
    { id: "/calling", label: "Calls Log", icon: <Phone size={18} /> },
    { id: "/whatsapp-logs", label: "WhatsApp Logs", icon: <MessageSquareText size={18} /> },
    { id: "/sendcall", label: "Send Call", icon: <PhoneForwarded size={18} /> },
    { id: "/whats-app", label: "WhatsApp", icon: <Smartphone size={18} /> }, // use distinct icon
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = React.useState(false);
    const [mobileOpen, setMobileOpen] = React.useState(false);

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
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => {
                                    navigate(item.id);
                                    setMobileOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${location.pathname === item.id
                                    ? "bg-gray-700 text-gray-300"
                                    : "hover:bg-gray-700 text-gray-300"
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="space-y-2 px-4 pb-4">
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md ${loading ? "opacity-60 cursor-not-allowed" : ""
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

    // 👇 this controls hiding of sidebar + topbar
    const isWhatsAppFull = location.pathname === "/whats-app";

    return (
        <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900 relative">
            {/* Mobile Top Bar */}
            {!isWhatsAppFull && (
                <div className="w-full bg-[#101826] text-white px-4 py-3 flex items-center justify-between md:hidden">
                    <button onClick={() => setMobileOpen(true)}>
                        <Menu size={24} />
                    </button>
                </div>
            )}

            <div className="flex flex-1">
                {/* Mobile overlay */}
                {!isWhatsAppFull && mobileOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Mobile Sidebar */}
                {!isWhatsAppFull && (
                    <aside
                        className={`fixed z-50 top-0 left-0 w-64 h-full bg-[#101826] text-white shadow-lg transform transition-transform duration-300 md:hidden overflow-y-auto flex flex-col ${mobileOpen ? "translate-x-0" : "-translate-x-full"
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

                {/* Desktop Sidebar */}
                {!isWhatsAppFull && (
                    <aside className="hidden md:flex w-64 bg-[#101826] text-white">
                        <SidebarContent />
                    </aside>
                )}

                {/* Main Content */}
                <main className={`flex-1 overflow-auto ${isWhatsAppFull ? "p-0" : "p-4 md:p-6"}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Sidebar;
