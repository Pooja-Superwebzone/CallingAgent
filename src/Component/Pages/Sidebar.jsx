
// import React from "react";
// import {
//   Phone,
//   MessageSquareText,
//   PhoneForwarded,
//   LogOut,
//   Menu,
//   X,
//   Smartphone,
//   User,
// } from "lucide-react";
// import Cookies from "js-cookie";
// import { useNavigate, useLocation, Outlet } from "react-router-dom";
// import { toast } from "react-hot-toast";

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [loading, setLoading] = React.useState(false);
//   const [mobileOpen, setMobileOpen] = React.useState(false);

//   const [role, setRole] = React.useState("");
//   const [twilioUser, setTwilioUser] = React.useState(0);

//   React.useEffect(() => {
//     const roleFromCookie = Cookies.get("role") || "";
//     const twilioFromCookie = Cookies.get("twilio_user") || "0";
//     setRole(roleFromCookie);
//     setTwilioUser(Number(twilioFromCookie));
//   }, []);
// const handleLogout = () => {
//   setLoading(true);

//   // Remove all login cookies immediately
//   Cookies.remove("CallingAgent");
//   Cookies.remove("role");
//   Cookies.remove("twilio_user");

//   // Show toast and navigate right away
//   toast.success("Logged out successfully");

//   navigate({ pathname: "/login", search: "?tab=login" });
//   setLoading(false);
// };

//   const SidebarContent = () => (
//     <div className="flex flex-col justify-between h-full w-full">
//       <div>
//         <div className="border-b border-gray-600 w-full">
//           <h2 className="text-xl font-bold text-center py-4">Dashboard</h2>
//         </div>

//         <ul className="mt-6 space-y-2 px-4">
//             {(role === "admin" || twilioUser === 1) && (
//             <li>
//               <button
//                 onClick={() => {
//                   navigate("/sendcall");
//                   setMobileOpen(false);
//                 }}
//                 className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                   location.pathname === "/sendcall"
//                     ? "bg-gray-700 text-gray-300"
//                     : "hover:bg-gray-700 text-gray-300"
//                 }`}
//               >
//                 <PhoneForwarded size={18} />
//              Make a Call
//               </button>
//             </li>
//           )}

//           {/* ✅ Always show Call Log */}
//           <li>
//             <button
//               onClick={() => {
//                 navigate("/calling");
//                 setMobileOpen(false);
//               }}
//               className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                 location.pathname === "/calling"
//                   ? "bg-gray-700 text-gray-300"
//                   : "hover:bg-gray-700 text-gray-300"
//               }`}
//             >
//               <Phone size={18} />
//               Calls Log
//             </button>
//           </li>


//           {/* ✅ Non-admin + twilioUser === 0 → Only WhatsApp Logs */}
//           {(twilioUser === 0 && (role === "admin" || role !== "admin")) && (
//             <>
//               <li>
//                 <button
//                   onClick={() => {
//                     navigate("/whatsapp-logs");
//                     setMobileOpen(false);
//                   }}
//                   className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                     location.pathname === "/whatsapp-logs"
//                       ? "bg-gray-700 text-gray-300"
//                       : "hover:bg-gray-700 text-gray-300"
//                   }`}
//                 >
//                   <MessageSquareText size={18} />
//                   WhatsApp Logs
//                 </button>
//               </li>

//               {role === "admin" && (
//                 <li>
//                   <button
//                     onClick={() => {
//                       navigate("/whats-app");
//                       setMobileOpen(false);
//                     }}
//                     className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                       location.pathname === "/whats-app"
//                         ? "bg-gray-700 text-gray-300"
//                         : "hover:bg-gray-700 text-gray-300"
//                     }`}
//                   >
//                     <Smartphone size={18} />
//                     WhatsApp
//                   </button>
//                 </li>
//               )}
//             </>
//           )}


//           {role === "admin" && twilioUser === 0 && (
//             <li>
//               <button
//                 onClick={() => {
//                   navigate("/sub-admin");
//                   setMobileOpen(false);
//                 }}
//                 className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                   location.pathname === "/sub-admin"
//                     ? "bg-gray-700 text-gray-300"
//                     : "hover:bg-gray-700 text-gray-300"
//                 }`}
//               >
//                 <User size={18} />
//                 Sub Admin
//               </button>
//             </li>
//           )}
//         </ul>
//       </div>

//       <div className="space-y-2 px-4 pb-4">
//         <button
//           onClick={handleLogout}
//           disabled={loading}
//           className={`w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md ${
//             loading ? "opacity-60 cursor-not-allowed" : ""
//           }`}
//         >
//           {loading ? (
//             <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
//           ) : (
//             <LogOut size={16} />
//           )}
//           {loading ? "Logging out..." : "Logout"}
//         </button>
//       </div>
//     </div>
//   );

//   const isWhatsAppFull = location.pathname === "/whats-app";

//   return (
//     <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900 relative">
//       {!isWhatsAppFull && (
//         <div className="w-full bg-[#101826] text-white px-4 py-3 flex items-center justify-between md:hidden">
//           <button onClick={() => setMobileOpen(true)}>
//             <Menu size={24} />
//           </button>
//         </div>
//       )}

//       <div className="flex flex-1">
//         {!isWhatsAppFull && mobileOpen && (
//           <div
//             className="fixed inset-0 bg-black/50 z-40"
//             onClick={() => setMobileOpen(false)}
//           />
//         )}

//         {!isWhatsAppFull && (
//           <aside
//             className={`fixed z-50 top-0 left-0 w-64 h-full bg-[#101826] text-white shadow-lg transform transition-transform duration-300 md:hidden overflow-y-auto flex flex-col ${
//               mobileOpen ? "translate-x-0" : "-translate-x-full"
//             }`}
//           >
//             <div className="flex justify-end px-4 py-4">
//               <button onClick={() => setMobileOpen(false)}>
//                 <X size={24} />
//               </button>
//             </div>
//             <SidebarContent />
//           </aside>
//         )}

//         {!isWhatsAppFull && (
//           <aside className="hidden md:flex w-64 bg-[#101826] text-white">
//             <SidebarContent />
//           </aside>
//         )}

//         <main
//           className={`flex-1 overflow-auto ${
//             isWhatsAppFull ? "p-0" : "p-4 md:p-6"
//           }`}
//         >
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;


// import React, { useEffect, useState } from "react";
// import {
//   Phone,
//   MessageSquareText,
//   PhoneForwarded,
//   LogOut,
//   Menu,
//   X,
//   Smartphone,
//   User,
// } from "lucide-react";
// import Cookies from "js-cookie";
// import { useNavigate, useLocation, Outlet } from "react-router-dom";
// import { toast } from "react-hot-toast";

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [loading, setLoading] = useState(false);
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const [role, setRole] = useState("");
//   const [twilioUser, setTwilioUser] = useState(0);

//   const [showWelcomeModal, setShowWelcomeModal] = useState(false);
//   const [trialMinutes, setTrialMinutes] = useState(0);

//   const [showNextStepsModal, setShowNextStepsModal] = useState(false);
//   const [remainingMinutes, setRemainingMinutes] = useState(0);
//   const [isSignupUser, setIsSignupUser] = useState(false); // 🔑

//   // 🧠 Set from route state after signup
//   useEffect(() => {
//     if (location.state?.showWelcome) {
//       const minutes = location.state.trialMinutes || 10;
//       setShowWelcomeModal(true);
//       setTrialMinutes(minutes);
//       setRemainingMinutes(minutes);
//       setIsSignupUser(true);
//       localStorage.setItem("userRemainingMinutes", minutes.toString());
//       localStorage.setItem("isSignupUser", "true");
//       window.history.replaceState({}, document.title); // clean state
//     }
//   }, [location.state]);

//   // 🧠 On every mount, load local values
//   useEffect(() => {
//     const storedMinutes = parseInt(localStorage.getItem("userRemainingMinutes") || "0");
//     const signupFlag = localStorage.getItem("isSignupUser") === "true";
//     setRemainingMinutes(storedMinutes);
//     setIsSignupUser(signupFlag);
//   }, []);

//   // 🍪 Load role and flags from cookies
//   useEffect(() => {
//     const roleFromCookie = Cookies.get("role") || "";
//     const twilioFromCookie = Cookies.get("twilio_user") || "0";
//     setRole(roleFromCookie);
//     setTwilioUser(Number(twilioFromCookie));
//   }, []);

//   const handleLogout = () => {
//     setLoading(true);
//     Cookies.remove("CallingAgent");
//     Cookies.remove("role");
//     Cookies.remove("twilio_user");
//     localStorage.removeItem("userRemainingMinutes");
//     localStorage.removeItem("isSignupUser");
//     toast.success("Logged out successfully");
//     navigate({ pathname: "/login", search: "?tab=login" });
//     setLoading(false);
//   };

//   const SidebarContent = () => (
//     <div className="flex flex-col justify-between h-full w-full">
//       <div>
//         <div className="border-b border-gray-600 w-full">
//           <h2 className="text-xl font-bold text-center py-4">Dashboard</h2>
//         </div>

//         <ul className="mt-6 space-y-2 px-4">
//           {(role === "admin" || twilioUser === 1) && (
//             <li>
//               <button
//                 onClick={() => {
//                   navigate("/sendcall");
//                   setMobileOpen(false);
//                 }}
//                 className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                   location.pathname === "/sendcall"
//                     ? "bg-gray-700 text-gray-300"
//                     : "hover:bg-gray-700 text-gray-300"
//                 }`}
//               >
//                 <PhoneForwarded size={18} />
//                 Make a Call
//               </button>
//             </li>
//           )}

//           <li>
//             <button
//               onClick={() => {
//                 navigate("/calling");
//                 setMobileOpen(false);
//               }}
//               className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                 location.pathname === "/calling"
//                   ? "bg-gray-700 text-gray-300"
//                   : "hover:bg-gray-700 text-gray-300"
//               }`}
//             >
//               <Phone size={18} />
//               Calls Log
//             </button>
//           </li>

//           {/* ✅ Show "Next Steps" only for Signup users */}
//           {twilioUser && (
//             <li>
//               <button
//                 onClick={() => setShowNextStepsModal(true)}
//                 className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition hover:bg-gray-700 text-gray-300"
//               >
//                 <User size={18} />
//                 Next Steps
//               </button>
//             </li>
//           )}

//           {(twilioUser === 0 && (role === "admin" || role !== "admin")) && (
//             <>
//               <li>
//                 <button
//                   onClick={() => {
//                     navigate("/whatsapp-logs");
//                     setMobileOpen(false);
//                   }}
//                   className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                     location.pathname === "/whatsapp-logs"
//                       ? "bg-gray-700 text-gray-300"
//                       : "hover:bg-gray-700 text-gray-300"
//                   }`}
//                 >
//                   <MessageSquareText size={18} />
//                   WhatsApp Logs
//                 </button>
//               </li>

//               {role === "admin" && (
//                 <li>
//                   <button
//                     onClick={() => {
//                       navigate("/whats-app");
//                       setMobileOpen(false);
//                     }}
//                     className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                       location.pathname === "/whats-app"
//                         ? "bg-gray-700 text-gray-300"
//                         : "hover:bg-gray-700 text-gray-300"
//                     }`}
//                   >
//                     <Smartphone size={18} />
//                     WhatsApp
//                   </button>
//                 </li>
//               )}
//             </>
//           )}

//           {role === "admin" && twilioUser === 0 && (
//             <li>
//               <button
//                 onClick={() => {
//                   navigate("/sub-admin");
//                   setMobileOpen(false);
//                 }}
//                 className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
//                   location.pathname === "/sub-admin"
//                     ? "bg-gray-700 text-gray-300"
//                     : "hover:bg-gray-700 text-gray-300"
//                 }`}
//               >
//                 <User size={18} />
//                 Sub Admin
//               </button>
//             </li>
//           )}
//         </ul>
//       </div>

//       <div className="space-y-2 px-4 pb-4">
//         <button
//           onClick={handleLogout}
//           disabled={loading}
//           className={`w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md ${
//             loading ? "opacity-60 cursor-not-allowed" : ""
//           }`}
//         >
//           {loading ? (
//             <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
//           ) : (
//             <LogOut size={16} />
//           )}
//           {loading ? "Logging out..." : "Logout"}
//         </button>
//       </div>
//     </div>
//   );

//   const isWhatsAppFull = location.pathname === "/whats-app";

//   return (
//     <div className="flex min-h-screen flex-col bg-gray-100 text-gray-900 relative">
//       {!isWhatsAppFull && (
//         <div className="w-full bg-[#101826] text-white px-4 py-3 flex items-center justify-between md:hidden">
//           <button onClick={() => setMobileOpen(true)}>
//             <Menu size={24} />
//           </button>
//         </div>
//       )}

//       <div className="flex flex-1">
//         {!isWhatsAppFull && mobileOpen && (
//           <div
//             className="fixed inset-0 bg-black/50 z-40"
//             onClick={() => setMobileOpen(false)}
//           />
//         )}

//         {!isWhatsAppFull && (
//           <aside
//             className={`fixed z-50 top-0 left-0 w-64 h-full bg-[#101826] text-white shadow-lg transform transition-transform duration-300 md:hidden overflow-y-auto flex flex-col ${
//               mobileOpen ? "translate-x-0" : "-translate-x-full"
//             }`}
//           >
//             <div className="flex justify-end px-4 py-4">
//               <button onClick={() => setMobileOpen(false)}>
//                 <X size={24} />
//               </button>
//             </div>
//             <SidebarContent />
//           </aside>
//         )}

//         {!isWhatsAppFull && (
//           <aside className="hidden md:flex w-64 bg-[#101826] text-white">
//             <SidebarContent />
//           </aside>
//         )}

//         {/* 🎉 Welcome Modal */}
//         {showWelcomeModal && (
//           <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl min-h-[300px] p-8 sm:p-10 text-center flex flex-col justify-center items-center">
//               <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-4 leading-tight">
//                 🎉 Welcome To The World Of Richa AI
//               </h2>
//               <p className="text-gray-700 text-lg sm:text-xl mb-6 leading-relaxed">
//                 Your free trial demo has started.<br />
//                 You can make up to{" "}
//                 <span className="font-semibold text-blue-700 text-xl">
//                   {trialMinutes}
//                 </span>{" "}
//                 calls!
//               </p>
//               <button
//                 onClick={() => setShowWelcomeModal(false)}
//                 className="mt-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl font-semibold transition duration-300"
//               >
//                 Let's Get Started 🚀
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ⏳ Next Steps Modal */}
//         {showNextStepsModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
//             <div className="relative bg-white w-full max-w-md p-6 rounded-xl shadow-2xl text-center animate-fadeIn">
//               <button
//                 onClick={() => setShowNextStepsModal(false)}
//                 className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
//               >
//                 &times;
//               </button>

//               {remainingMinutes > 0 ? (
//                 <>
//                   <h2 className="text-2xl font-bold text-blue-600 mb-3">⏳ Remaining Minutes</h2>
//                   <p className="text-gray-700 text-lg">
//                     You have <strong className="text-blue-700">{remainingMinutes}</strong> free call minutes left.
//                   </p>
//                 </>
//               ) : (
//                 <>
//                   <h2 className="text-2xl font-bold text-red-600 mb-2">🚫 Trial Ended</h2>
//                   <p className="text-gray-700 text-base mb-1">Your free trial has ended.</p>
//                   <p className="text-gray-600 mb-4">Please choose one of the following options:</p>
//                   <div className="flex flex-col sm:flex-row gap-3 justify-center">
//                     <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-base font-medium transition">
//                       💳 Make Payment
//                     </button>
//                     <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-base font-medium transition">
//                       📞 Contact Channel Partner
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         )}

//         <main
//           className={`flex-1 overflow-auto ${
//             isWhatsAppFull ? "p-0" : "p-4 md:p-6"
//           }`}
//         >
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Sidebar;



// ✅ Sidebar.jsx - Fully updated with correct free trial logic

import React, { useEffect, useState } from "react";
import {
  Phone,
  MessageSquareText,
  PhoneForwarded,
  LogOut,
  Menu,
  X,
  Smartphone,
  User,
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { toast } from "react-hot-toast";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState("");
  const [twilioUser, setTwilioUser] = useState(0);

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [trialMinutes, setTrialMinutes] = useState(0);
  const [showNextStepsModal, setShowNextStepsModal] = useState(false);
  const [remainingMinutes, setRemainingMinutes] = useState();
  const [isSignupUser, setIsSignupUser] = useState(false);

  useEffect(() => {
    if (location.state?.showWelcome) {
      const minutes = location.state.trialMinutes || 10;
      setShowWelcomeModal(true);
      setTrialMinutes(minutes);
      setRemainingMinutes(minutes);
      setIsSignupUser(true);
      localStorage.setItem("userRemainingMinutes", minutes.toString());
      localStorage.setItem("isSignupUser", "true");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const storedMinutes = parseInt(localStorage.getItem("userRemainingMinutes") || "0");
    const signupFlag = localStorage.getItem("isSignupUser") === "true";
    setRemainingMinutes(storedMinutes);
    setIsSignupUser(signupFlag);
  }, []);

  useEffect(() => {
    const roleFromCookie = Cookies.get("role") || "";
    const twilioFromCookie = Cookies.get("twilio_user") || "true";
    setRole(roleFromCookie);
    setTwilioUser(Number(twilioFromCookie));
  }, []);

  const handleLogout = () => {
    setLoading(true);
    Cookies.remove("CallingAgent");
    Cookies.remove("role");
    Cookies.remove("twilio_user");
    localStorage.removeItem("userRemainingMinutes");
    localStorage.removeItem("isSignupUser");
    toast.success("Logged out successfully");
    navigate({ pathname: "/login", search: "?tab=login" });
    setLoading(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col justify-between h-full w-full">
      <div>
        <div className="border-b border-gray-600 w-full">
          <h2 className="text-xl font-bold text-center py-4">Dashboard</h2>
        </div>

        <ul className="mt-6 space-y-2 px-4">
          {(role === "admin" || twilioUser === 1) && (
            <li>
              <button
                onClick={() => {
                  navigate("/sendcall");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${location.pathname === "/sendcall"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                  }`}
              >
                <PhoneForwarded size={18} />
                Make a Call
              </button>
            </li>
          )}

          <li>
            <button
              onClick={() => {
                navigate("/calling");
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${location.pathname === "/calling"
                  ? "bg-gray-700 text-gray-300"
                  : "hover:bg-gray-700 text-gray-300"
                }`}
            >
              <Phone size={18} />
              Calls Log
            </button>
          </li>
          {twilioUser === 1 && (
            <li>
              <button
                onClick={() => setShowNextStepsModal(true)}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition hover:bg-gray-700 text-gray-300"
              >
                <User size={18} />
                Next Steps
              </button>
            </li>
          )}

          {(twilioUser === 0 && (role === "admin" || role !== "admin")) && (
            <>
              <li>
                <button
                  onClick={() => {
                    navigate("/whatsapp-logs");
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${location.pathname === "/whatsapp-logs"
                      ? "bg-gray-700 text-gray-300"
                      : "hover:bg-gray-700 text-gray-300"
                    }`}
                >
                  <MessageSquareText size={18} />
                  WhatsApp Logs
                </button>
              </li>

              {role === "admin" && (
                <li>
                  <button
                    onClick={() => {
                      navigate("/whats-app");
                      setMobileOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${location.pathname === "/whats-app"
                        ? "bg-gray-700 text-gray-300"
                        : "hover:bg-gray-700 text-gray-300"
                      }`}
                  >
                    <Smartphone size={18} />
                    WhatsApp
                  </button>
                </li>
              )}
            </>
          )}

          {role === "admin" && twilioUser === 0 && (
            <li>
              <button
                onClick={() => {
                  navigate("/sub-admin");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${location.pathname === "/sub-admin"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                  }`}
              >
                <User size={18} />
                Sub Admin
              </button>
            </li>
          )}
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

        {!isWhatsAppFull && (
          <aside className="hidden md:flex w-64 bg-[#101826] text-white">
            <SidebarContent />
          </aside>
        )}

        {/* 🎉 Welcome Modal */}
    {showWelcomeModal && !(role === 'admin' && twilioUser === 0) && (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl min-h-[300px] p-8 sm:p-10 text-center flex flex-col justify-center items-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-blue-600 mb-4 leading-tight">
        🎉 Welcome To The World Of Richa AI
      </h2>
      <p className="text-gray-700 text-lg sm:text-xl mb-6 leading-relaxed">
        Your free trial demo has started.<br />
        You can make up to{" "}
        <span className="font-semibold text-blue-700 text-xl">
          {trialMinutes}
        </span>{" "}
        calls!
      </p>
      <button
        onClick={() => setShowWelcomeModal(false)}
        className="mt-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl font-semibold transition duration-300"
      >
        Let's Get Started 🚀
      </button>
    </div>
  </div>
)}


        {/* ⏳ Next Steps Modal */}
        {showNextStepsModal  && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="relative bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl text-center animate-fadeIn">

              {/* Close Button */}
              <button
                onClick={() => setShowNextStepsModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              >
                &times;
              </button>

              {/* Remaining Minutes */}
              <h2 className="text-2xl font-semibold text-blue-600 mb-2 flex items-center justify-center gap-2">
                ⏳ <span>Remaining Minutes</span>
              </h2>

              <p className="text-gray-800 text-lg mb-4">
                You have <strong className="text-blue-700">{remainingMinutes}</strong> free call minutes left.
              </p>

              {/* Trial Ended */}
              {remainingMinutes === 0 && (
                <>
                  <h3 className="text-lg font-semibold text-red-600 flex items-center justify-center gap-2 mb-1">
                    ⛔ Your Free Trial Has Ended
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    To continue making calls, please choose one of the options below:
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <a
                      href="https://your-payment-link.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-md font-medium flex items-center gap-2 justify-center"
                    >
                      💳 Make Payment
                    </a>
                    <button
                      onClick={() => setShowContactForm(true)}
                      className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-md font-medium flex items-center gap-2 justify-center"
                    >
                      📞 Contact Channel Partner
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}





        <main className={`flex-1 overflow-auto ${isWhatsAppFull ? "p-0" : "p-4 md:p-6"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Sidebar;




