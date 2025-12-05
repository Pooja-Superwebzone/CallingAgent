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
import {
  FiClock,
  FiAlertCircle,
  FiCreditCard,
  FiPhoneCall,
  FiSmile,
  FiArrowRight,
  FiX,
  FiGift,
  FiCheckCircle,
  FiPhone,
  FiUser,
  FiMail,
} from "react-icons/fi";
import ContactFormModal from "./ContactFormModal";
import { BiLogoWhatsapp } from "react-icons/bi";
import { IoCallOutline } from "react-icons/io5";
import { BiPhoneCall } from "react-icons/bi";
import { FaUsers } from "react-icons/fa";
import { FaMagento } from "react-icons/fa6";
import { MdCallMade } from "react-icons/md";
import { MdCallReceived } from "react-icons/md";
import { TbCloudDataConnection } from "react-icons/tb";
import { FiUsers } from "react-icons/fi";
import { MdOutlineEmail } from "react-icons/md";
import { BsChatTextFill } from "react-icons/bs";

import service from "../../api/axios";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState("");
  const [twilioUser, setTwilioUser] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [trialMinutes, setTrialMinutes] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState();
  const [isSignupUser, setIsSignupUser] = useState(false);
  const [showNextStepsModal, setShowNextStepsModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // ONE-WAY and TWO-WAY minutes
  const [oneWayMinutes, setOneWayMinutes] = useState(0);
  const [twoWayMinutes, setTwoWayMinutes] = useState(10);
  const [loadingMinutes, setLoadingMinutes] = useState(false);

  const onClose = () => setShowContactForm(false);

  useEffect(() => {
    const showWelcome = location.state?.showWelcome;
    const trial = location.state?.trialMinutes || "10";

    if (showWelcome) {
      setShowWelcomeModal(true);
      setTrialMinutes(trial);
      setRemainingMinutes(trial);
      setIsSignupUser(true);

      localStorage.setItem("userRemainingMinutes", trial.toString());
      localStorage.setItem("isSignupUser", "true");

      window.history.replaceState({}, document.title);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  useEffect(() => {
    const storedMinutes = parseInt(localStorage.getItem("userRemainingMinutes") || "0");
    const signupFlag = localStorage.getItem("isSignupUser") === "true";
    setRemainingMinutes(storedMinutes);
    setIsSignupUser(signupFlag);

    setOneWayMinutes(storedMinutes);
  }, []);

  useEffect(() => {
    const roleFromCookie = Cookies.get("role") || "";
    const twilioFromCookie = Cookies.get("twilio_user") || "0";
    const emailVerifiedFromCookie = Cookies.get("email_verified") === "true";
    setRole(roleFromCookie);
    setTwilioUser(Number(twilioFromCookie));
    setEmailVerified(emailVerifiedFromCookie);
  }, []);

  useEffect(() => {
    const fetchProfileMinutes = async () => {
      setLoadingMinutes(true);
      try {
        const res = await service.get("Profile", {
          headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
        });
        const mins = res?.data?.data?.twilio_user_minute || {};

        const one = Number(mins.one_way ?? mins.minute ?? 0);
        const two = Number(mins.two_way ?? 10);
        setOneWayMinutes(one);
        setTwoWayMinutes(two);
        setRemainingMinutes(one);
        localStorage.setItem("userRemainingMinutes", String(one));
      } catch (err) {
        console.warn("Could not fetch profile minutes:", err);
      } finally {
        setLoadingMinutes(false);
      }
    };

    fetchProfileMinutes();
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

        {/* ---------- MENU ---------- */}
        <ul className="mt-6 space-y-2 px-4">
          {/* ---------------------------
              If Twilio user === 1 AND role === "admin" show this exact set
             --------------------------- */}
          {twilioUser === 1 && role === "admin" && (
            <>
             
              <li>
                <button
                  onClick={() => {
                    navigate("/agents_page");
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                    location.pathname === "/agents_page"
                      ? "bg-gray-700 text-gray-300"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <FaMagento size={18} />
                  Agents
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    navigate("/email-template");
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                    location.pathname === "/email-template"
                      ? "bg-gray-700 text-gray-300"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <MdOutlineEmail size={18} />
                  Email Template
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
                  Whatsapp Logs
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    navigate("/call-logs");
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                    location.pathname === "/call-logs"
                      ? "bg-gray-700 text-gray-300"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <MdCallReceived size={18} />
                  Call log
                </button>
              </li>

              <li>
                <button
                  onClick={() => {
                    navigate("/agent-Connection");
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                    location.pathname === "/agent-Connection"
                      ? "bg-gray-700 text-gray-300"
                      : "hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  <TbCloudDataConnection size={18} />
                  Agents Connection
                </button>
              </li>
            </>
          )}

          {/* ---------------------------
              Rest of the menu (fallback / other users)
              Do not show duplicates if twilioUser===1 && role==='admin'
             --------------------------- */}

          {/* Make one way Call (show if NOT the combined-admin-twilio block) */}
          
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
                Make one way Call
              </button>
            </li>


          {/* Calls Log (always visible as fallback) */}
          {!(twilioUser === 1 && role === "admin") && (
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
          )}

          {/* Whatsapp Template */}
          <li>
            <button
              className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition hover:bg-gray-700 text-gray-300"
              onClick={() => {
                navigate("/whatsapp-temp");
                setMobileOpen(false);
              }}
            >
              <BiLogoWhatsapp size={18} />
              Whatsapp Template
            </button>
          </li>

          {/* Email Template (originally only for twilioUser===0 && role==='admin') - keep that behaviour but hide if combined block above shown */}
          {!(twilioUser === 1 && role === "admin") && twilioUser === 0 && role === "admin" && (
            <li>
              <button
                onClick={() => navigate("/email-template")}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition hover:bg-gray-700 text-gray-300"
              >
                <MdOutlineEmail size={18} />
                Email Template
              </button>
            </li>
          )}

          {/* Next Steps (twilioUser === 1) */}
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

          {/* Call Schedule (twilioUser === 1) */}
          {twilioUser === 1 && (
            <li>
              <button
                onClick={() => navigate("/call-schedule")}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition hover:bg-gray-700 text-gray-300"
              >
                <IoCallOutline size={18} />
                Call Schedule
              </button>
            </li>
          )}

          {/* Send Conversation call (non-admin twilioUser===0) */}
          {twilioUser === 0 && role !== "admin" && (
            <li>
              <button
                onClick={() => navigate("/call-coversation")}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition hover:bg-gray-700 text-gray-300"
              >
                <BiPhoneCall size={18} />
                Send Conversation call
              </button>
            </li>
          )}

          {/* Whatsapp Logs (originally shown for twilioUser===0), hide when combined block present */}
          {!(twilioUser === 1 && role === "admin") && (twilioUser === 0 && (
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
          ))}

          {/* WhatsApp main (admin-only, original) */}
          {role === "admin" && !(twilioUser === 1 && role === "admin") && (
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
          )}

          {/* Sub Admin (admin & twilioUser===0 original) */}
          {role === "admin" && twilioUser === 0 && (
            <li>
              <button
                onClick={() => {
                  navigate("/sub-admin");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                  location.pathname === "/sub-admin"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <User size={18} />
                Sub Admin
              </button>
            </li>
          )}

          {/* Channel partner (admin & twilioUser===0 original) */}
          {twilioUser === 0 && role === "admin" && (
            <li>
              <button
                onClick={() => {
                  navigate("/channel-partner");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                  location.pathname === "/channel-partner"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <FaUsers size={18} />
                channel partner
              </button>
            </li>
          )}

          {/* Agents (admin & twilioUser===0 original) - hidden if combined block */}
          {twilioUser === 0 && role === "admin" && (
            <li>
              <button
                onClick={() => {
                  navigate("/agents_page");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                  location.pathname === "/agents_page"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <FaMagento size={18} />
                Agents
              </button>
            </li>
          )}

          {/* Agents for Users (admin & twilioUser===0 original) */}
          {twilioUser === 0 && role === "admin" && (
            <li>
              <button
                onClick={() => {
                  navigate("/agent-user");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                  location.pathname === "/agent-user"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <FiUsers size={18} />
                Agents for Users
              </button>
            </li>
          )}

          {/* Agents Connection (admin & twilioUser===0 original) */}
          {twilioUser === 0 && role === "admin" && (
            <li>
              <button
                onClick={() => {
                  navigate("/agent-Connection");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                  location.pathname === "/agent-Connection"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <TbCloudDataConnection size={18} />
                Agents Connection
              </button>
            </li>
          )}

          {/* Send a Call (send-omni) - keep original but hide if combined block already shows Send a call */}
        
            <li>
              <button
                onClick={() => {
                  navigate("/send-omni");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                  location.pathname === "/send-omni"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <MdCallMade size={18} />
          Make Two way call
              </button>
            </li>
       

          {/* Call Log (admin & twilioUser===0 original) - hidden if combined block */}
          {twilioUser === 0 && role === "admin" && (
            <li>
              <button
                onClick={() => {
                  navigate("/call-logs");
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                  location.pathname === "/call-logs"
                    ? "bg-gray-700 text-gray-300"
                    : "hover:bg-gray-700 text-gray-300"
                }`}
              >
                <MdCallReceived size={18} />
                Call Log
              </button>
            </li>
          )}




          <li>
            <button
              onClick={() => {
                navigate("/whatsapp-send-message");
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                location.pathname === "/whatsapp-send-message"
                  ? "bg-gray-700 text-gray-300"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <BsChatTextFill size={18} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Whatsapp Send Message</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => {
                navigate("/perplexity");
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-md transition ${
                location.pathname === "/perplexity"
                  ? "bg-gray-700 text-gray-300"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <BsChatTextFill size={18} className="flex-shrink-0" />
              <span className="whitespace-nowrap">Perplexity</span>
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
          {/* Compact minutes display on small header (mobile) */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-white mr-2">
              <div className="text-xs">
                One-way: <span className="font-semibold">{oneWayMinutes}</span>m
              </div>
              <div className="text-xs">
                Two-way: <span className="font-semibold">{twoWayMinutes}</span>m
              </div>
            </div>
            <button
              onClick={() => setShowNextStepsModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              Top up
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {!isWhatsAppFull && mobileOpen && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
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
               <aside className="hidden md:flex w-64 bg-[#101826] text-white md:fixed md:top-0 md:left-0 md:h-screen overflow-y-auto">
            <SidebarContent />
          </aside>
        )}

        {showWelcomeModal && role === "admin" && twilioUser === 1 && emailVerified && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="relative w-full max-w-3xl min-h-[350px] p-10 sm:p-16 rounded-3xl shadow-2xl text-center animate-fadeIn overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-200">
              <svg
                className="absolute top-[-60px] left-[-60px] w-72 h-72 opacity-10 text-blue-300 pointer-events-none"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <circle cx="50" cy="50" r="50" />
              </svg>
              <svg
                className="absolute bottom-[-60px] right-[-60px] w-72 h-72 opacity-10 text-green-300 pointer-events-none"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <circle cx="50" cy="50" r="50" />
              </svg>

              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              >
                <FiX />
              </button>

              <h2 className="text-3xl font-bold text-blue-700 mb-4 leading-snug flex items-center justify-center gap-3">
                <FiGift size={32} className="text-blue-600" />
                Welcome To The World Of Richa AI
              </h2>

              <p className="text-gray-800 text-lg sm:text-2xl mb-6 leading-relaxed flex flex-col items-center">
                <span>Your free trial demo has started.</span>
                <span className="flex items-center justify-center gap-2 mt-3">
                  <FiCheckCircle className="text-green-600" size={24} />
                  You can make up to{" "}
                  <span className="font-bold text-blue-800 text-2xl">{trialMinutes}</span> calls!
                </span>
              </p>

              <div className="w-full flex justify-center">
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg rounded-xl font-semibold transition duration-300 flex items-center gap-3"
                >
                  Let's Get Started <FiArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {showNextStepsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div className="relative w-full max-w-3xl min-h-[400px] p-20 rounded-3xl shadow-2xl text-center animate-fadeIn overflow-hidden bg-gradient-to-br from-blue-100 via-white to-blue-200">
              <svg
                className="absolute top-[-40px] left-[-40px] w-64 h-64 opacity-10 text-blue-300 pointer-events-none"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <circle cx="50" cy="50" r="50" />
              </svg>
              <svg
                className="absolute bottom-[-40px] right-[-40px] w-64 h-64 opacity-10 text-green-300 pointer-events-none"
                viewBox="0 0 100 100"
                fill="currentColor"
              >
                <circle cx="50" cy="50" r="50" />
              </svg>

              <button
                onClick={() => setShowNextStepsModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl font-bold"
              >
                &times;
              </button>

              <h2 className="text-4xl font-extrabold text-blue-700 mb-4 flex items-center justify-center gap-3">
                <FiClock size={30} />
                Remaining Minutes
              </h2>

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-center gap-8 items-center">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">One-way minutes</div>
                    <div className="text-3xl font-bold text-blue-800">
                      {loadingMinutes ? "..." : oneWayMinutes}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Used for outbound voice messages</div>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-gray-600">Two-way minutes</div>
                    <div className="text-3xl font-bold text-blue-700">
                      {loadingMinutes ? "..." : twoWayMinutes}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Used for interactive calls</div>
                  </div>
                </div>
              </div>

              <p className="text-gray-800 text-xl mb-6">
                You have{" "}
                <strong className="text-blue-800 text-2xl">{remainingMinutes ?? oneWayMinutes}</strong>{" "}
                free call minutes left.
              </p>

              <h3 className="text-2xl font-semibold text-red-600 flex items-center justify-center gap-2 mb-3">
                <FiAlertCircle size={24} />
                Your Free Trial
              </h3>

              <p className="text-gray-700 mb-8 text-base">
                To continue making calls, please choose one of the options below:
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <a
                  href="https://your-payment-link.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3 rounded-lg font-semibold flex items-center gap-3 justify-center"
                >
                  <FiCreditCard size={30} />
                  Make Payment
                </a>
                <button
                  onClick={() => {
                    setShowNextStepsModal(false);
                    setShowContactForm(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-6 py-3 rounded-lg font-semibold flex items-center gap-3 justify-center"
                >
                  <FiPhoneCall size={30} />
                  Contact Channel Partner
                </button>
              </div>
            </div>
          </div>
        )}

        {showContactForm && (
          <ContactFormModal showContactForm={showContactForm} setShowContactForm={setShowContactForm} />
        )}

        <main className={`flex-1 overflow-auto ${isWhatsAppFull ? "p-0" : "p-4 md:p-6"} ${isWhatsAppFull ? "" : "md:ml-64"}`} style={{ maxHeight: "100vh" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Sidebar;




