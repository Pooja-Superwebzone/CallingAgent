
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  login,
  signupTwillioUser,
  verifyEmailOtp,
  resendTwillioOtp,
} from "../../hooks/useAuth";

export default function LoginSignup() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    contact_no: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [loginUnverified, setLoginUnverified] = useState(false);



  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab === "login" || tab === "signup") setActiveTab(tab);
  }, [location.search]);


  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setLoginUnverified(false);
    navigate(`/login?tab=${tab}`);
  };

  const validateLogin = () => {
    const errs = {};
    if (!loginData.email) errs.email = "Email is required";
    if (!loginData.password) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSignup = () => {
    const errs = {};
    if (!signupData.name) errs.name = "Name is required";
    if (!signupData.email) errs.email = "Email is required";
    if (!signupData.contact_no) errs.contact_no = "Contact number is required";
    if (!signupData.password) errs.password = "Password is required";
    if (signupData.password !== signupData.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
 
const handleLoginSubmit = async (e) => {
  e.preventDefault();
  if (!validateLogin()) return;
  setLoading(true);
  setLoginUnverified(false);

  try {
    const res = await login(loginData);
    const { token, data: user } = res;

    const isAdminWithTwilioZero = user?.role === "admin" && String(user?.twilio_user) === "0";

    if (!user?.email_verified_at && !isAdminWithTwilioZero) {
      toast.error("Email not verified. OTP sent to your email.");
      setSignupData((prev) => ({ ...prev, email: loginData.email }));
      await resendTwillioOtp({ email: loginData.email });

      // ✅ Force cookie to reflect email is unverified
      Cookies.set("email_verified", "false", { expires: 365 });

      setLoginUnverified(true);
      setShowOtpModal(true);
      return;
    }

    if (token && user) {
      Cookies.set("CallingAgent", token, { expires: 365 });
      Cookies.set("role", user?.role || "user", { expires: 365 });
      Cookies.set("twilio_user", String(user?.twilio_user || "0"), { expires: 365 });
      Cookies.set("email_verified", user?.email_verified_at ? "true" : "false", { expires: 365 });
      Cookies.set("email", user?.email ? user?.email : "", { expires: 365 });

      toast.success("Login successful");
      navigate("/sendcall");
    } else {
      toast.error("Invalid login response");
    }
  } catch (error) {
    toast.error(error.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setLoading(true);
    try {
      const payload = { ...signupData, minute: "10" };
      const res = await signupTwillioUser(payload);
      const { token, data: user } = res;

      if (token && user) {
        Cookies.set("CallingAgent", token, { expires: 365 });
        Cookies.set("role", user?.role || "user", { expires: 365 });
        Cookies.set("twilio_user", String(user?.twilio_user || "0"), { expires: 365 });
        Cookies.set("email_verified", user?.email_verified_at ? "true" : "false", { expires: 365 });
        setShowOtpModal(true);
      } else {
        toast.success("Signup successful! Please verify your email.");
        setShowOtpModal(true);
      }
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

const handleOtpVerify = async () => {
  if (otp.length !== 6) {
    toast.error("Please enter a valid 6-digit OTP");
    return;
  }

  setLoading(true);
  try {
    const res = await verifyEmailOtp({ email: signupData.email, otp });

    const isVerified =
      res?.verified === true ||
      res?.status === "success" ||
      res?.message?.toLowerCase().includes("verified");

    if (isVerified) {
      toast.success("OTP verified successfully");
      setShowOtpModal(false);

      setTimeout(() => {
        if (activeTab === "login") {
          setLoginData((prev) => ({ ...prev, email: "" }));
        } else {
          setSignupData((prev) => ({ ...prev, email: "" }));
        }
      }, 3000);

      if (res.token && res.data) {
        Cookies.set("CallingAgent", res.token, { expires: 365 });
        Cookies.set("role", res.data?.role || "user", { expires: 365 });
        Cookies.set("twilio_user", String(res.data?.twilio_user || "0"), { expires: 365 });

        // ✅ Now mark email as verified
        Cookies.set("email_verified", "true", { expires: 365 });
      } else {
        const token = Cookies.get("CallingAgent");
        if (!token) {
          toast.error("User session missing. Please login again.");
          navigate("/login?tab=login");
          return;
        }
      }

      // ✅ Navigate with welcome popup
      navigate("/sendcall", {
        state: {
          showWelcome: true,
          trialMinutes: "10",
        },
        replace: true,
      });
    } else {
      toast.error("Invalid OTP");
    }
  } catch (error) {
    toast.error(error.message || "OTP verification failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl relative">

            {/* Close Button in Top-Right */}
            <button
              onClick={() => {
                setShowOtpModal(false);
                setOtp(""); // Clear OTP input
                toast("Signup incomplete. OTP not verified.");
              }}
              className="absolute top-0  right-3 text-gray-500 hover:text-red-600 text-4xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-7 mt-5 text-center">
              {activeTab === "login"
                ? "Verify Your Email to Continue"
                : "OTP Verification"}
            </h2>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="w-full px-4 py-2 border rounded-md mb-4 text-center text-xl tracking-widest"
              placeholder="------"
            />

            <button
              onClick={handleOtpVerify}
              className="bg-blue-600 text-white w-full py-2 rounded-md font-bold hover:bg-blue-700"
            >
              Verify OTP
            </button>
          </div>
        </div>

      )}

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full sm:w-2/3 md:w-1/3 flex justify-center items-center h-auto sm:h-[50vh] md:h-[60vh] lg:h-[70vh] p-4">
          <img
            src="/Richa.png"
            alt="Login Visual"
            className="w-auto h-full max-h-[70vh] object-cover rounded-3xl shadow-lg"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex">
              <button
                onClick={() => handleTabClick("login")}
                className={`w-1/2 py-3 rounded-tl-2xl text-lg font-bold ${activeTab === "login" ? "bg-blue-600 text-white" : "bg-blue-200 text-gray-700"
                  }`}
              >
                Login
              </button>
              <button
                onClick={() => handleTabClick("signup")}
                className={`w-1/2 py-3 rounded-tr-2xl text-lg font-bold ${activeTab === "signup" ? "bg-blue-600 text-white" : "bg-blue-200 text-gray-700"
                  }`}
              >
                Signup
              </button>
            </div>

            <form onSubmit={activeTab === "login" ? handleLoginSubmit : handleSignupSubmit} className="p-8">
              <h2 className="text-3xl font-extrabold text-center text-gray-700 mb-6">
                {activeTab === "login" ? "Login" : "Signup"}
              </h2>

              {activeTab === "signup" && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Business Name</label>
                    <input
                      type="text"
                      value={signupData.name}
                      onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                        }`}
                      placeholder="Enter your name"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-1">Contact No</label>
                    <input
                      type="text"
                      value={signupData.contact_no}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) setSignupData({ ...signupData, contact_no: value });
                      }}
                      maxLength={10}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.contact_no ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                        }`}
                      placeholder="Enter contact number"
                    />
                    {errors.contact_no && <p className="text-red-500 text-sm">{errors.contact_no}</p>}
                  </div>
                </>
              )}

              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={activeTab === "login" ? loginData.email : signupData.email}
                  onChange={(e) =>
                    activeTab === "login"
                      ? setLoginData({ ...loginData, email: e.target.value })
                      : setSignupData({ ...signupData, email: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                    }`}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={activeTab === "login" ? loginData.password : signupData.password}
                  onChange={(e) =>
                    activeTab === "login"
                      ? setLoginData({ ...loginData, password: e.target.value })
                      : setSignupData({ ...signupData, password: e.target.value })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                    }`}
                  placeholder="Enter password"
                />

              </div>


              {/* Confirm Password */}
              {activeTab === "signup" && (
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.confirmPassword ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                      }`}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl w-full mt-2 ${loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent mx-auto" />
                ) : activeTab === "login" ? "Login" : "Sign-up"}
              </button>

              <div className="text-center text-sm text-gray-600 mt-4">
                {activeTab === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => handleTabClick("signup")} className="text-blue-600 font-semibold">
                      Click here to Signup
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => handleTabClick("login")} className="text-blue-600 font-semibold">
                      Click here to Login
                    </button>
                  </>
                )}
              </div>

              {/* Tutorial Link */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate("/tutorial")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Learn How It Works - View Tutorial</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        
      </div>
      {/* Richa AI Training Program Information */}
      <div className="w-full mx-auto mt-12 px-4 pb-12">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 rounded-2xl p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                Richa AI – Complete Generative AI Training Program
              </h2>
              <p className="text-xl text-gray-700 font-semibold mb-1">Learn AI the Smart Way</p>
              <p className="text-sm text-gray-600">
                Powered by Infinity Brains | www.richa.infinitybrains.com
              </p>
            </div>

            {/* Course Overview */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Overview</h3>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">What This Training Covers:</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Understanding AI and Generative AI fundamentals
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Introduction to Richa AI platform
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Practical use cases and applications
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Hands-on learning and skill development
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Career opportunities and future prospects
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Who Should Attend:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    College & university students
                  </div>
                  <div className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Working professionals (IT, marketing, HR, operations)
                  </div>
                  <div className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Educators & trainers
                  </div>
                  <div className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Business owners & freelancers
                  </div>
                </div>
              </div>
            </div>

            {/* What is AI */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What is Artificial Intelligence (AI)?</h3>
              <p className="text-gray-700 mb-4">
                Artificial Intelligence (AI) is technology that enables machines to learn, think, and make decisions like humans. 
                It's the science of making computers smart enough to perform tasks that typically require human intelligence.
              </p>
              
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Examples of AI in Daily Life:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Google Maps navigation and route optimization
                  </div>
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Netflix recommendations based on your preferences
                  </div>
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Chatbots on websites for customer support
                  </div>
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Voice assistants like Siri, Alexa, and Google Assistant
                  </div>
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Email spam filters and auto-correct features
                  </div>
                </div>
              </div>

              <p className="text-gray-700 italic">
                <strong>AI vs Human Intelligence:</strong> AI complements human capabilities by processing vast amounts of data quickly, 
                while humans provide creativity, empathy, and strategic thinking.
              </p>
            </div>

            {/* Evolution of AI */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Evolution of AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Traditional Software</h4>
                  <p className="text-sm text-gray-600">Rule-based programs following fixed instructions</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Machine Learning</h4>
                  <p className="text-sm text-gray-600">Systems that learn from data and improve over time</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Deep Learning</h4>
                  <p className="text-sm text-gray-600">Neural networks that mimic the human brain</p>
                </div>
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Generative AI</h4>
                  <p className="text-sm text-gray-600">AI that creates new content - text, images, videos, code</p>
                </div>
              </div>
            </div>

            {/* What is Generative AI */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What is Generative AI?</h3>
              <p className="text-gray-700 mb-4">
                Generative AI is a type of artificial intelligence that can create new, original content rather than just analyzing 
                or processing existing data. It generates text, images, videos, code, and more based on patterns it has learned.
              </p>
              
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Types of Generation:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <strong>Text Generation:</strong> Articles, emails, stories, code
                  </div>
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <strong>Image Generation:</strong> Art, designs, photos
                  </div>
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <strong>Video Generation:</strong> Animated content, presentations
                  </div>
                  <div className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <strong>Code Generation:</strong> Programming code, scripts
                  </div>
                </div>
              </div>

              <p className="text-gray-700">
                <strong>Popular Examples:</strong> ChatGPT (text), DALL·E (images), Midjourney (art), GitHub Copilot (code)
              </p>
            </div>

            {/* Introduction to Richa AI */}
            <div className="bg-gradient-to-r from-indigo-50 to-fuchsia-50 rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Introduction to Richa AI</h3>
              <p className="text-gray-700 mb-4">
                <strong>What is Richa AI:</strong> Richa AI is a comprehensive generative AI platform designed specifically for 
                Indian users and businesses. It's an intelligent assistant that helps with learning, productivity, content creation, 
                and business growth.
              </p>
              
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Vision & Purpose</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    To make advanced AI accessible, affordable, and practical for everyone - from students to entrepreneurs
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <strong>Built for India:</strong> Designed with Indian context, languages, and business needs in mind. 
                    Localized solutions for local challenges
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Why Richa AI Was Created</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-red-700 mb-2">Problems with Existing AI Tools</h5>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• High costs and subscription fees</li>
                      <li>• Language barriers and limited localization</li>
                      <li>• Complex interfaces difficult for beginners</li>
                      <li>• Limited focus on practical learning</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-green-700 mb-2">How Richa AI Solves Them</h5>
                    <ul className="space-y-1 text-sm text-gray-700">
                      <li>• Affordable pricing for Indian market</li>
                      <li>• Multi-language support and Indian context</li>
                      <li>• Simple, user-friendly interface</li>
                      <li>• Focus on education and skill development</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-3">How Richa AI Works</h4>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="bg-indigo-100 rounded-lg p-3 mb-2">
                      <strong className="text-indigo-700">Input</strong>
                    </div>
                    <p className="text-sm text-gray-600">Your question or request</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="bg-purple-100 rounded-lg p-3 mb-2">
                      <strong className="text-purple-700">AI Processing</strong>
                    </div>
                    <p className="text-sm text-gray-600">Advanced algorithms analyze</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="text-center flex-1 min-w-[150px]">
                    <div className="bg-fuchsia-100 rounded-lg p-3 mb-2">
                      <strong className="text-fuchsia-700">Output</strong>
                    </div>
                    <p className="text-sm text-gray-600">Intelligent response</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center">
                  <strong>Data Security & Reliability:</strong> Your data is processed securely with privacy protection. 
                  Richa AI uses reliable infrastructure to ensure consistent performance.
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Features of Richa AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-2xl mb-2">💬</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Conversational AI</h4>
                  <p className="text-sm text-gray-700">Natural language conversations for learning, problem-solving, and assistance</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="text-2xl mb-2">✍️</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Content Creation</h4>
                  <p className="text-sm text-gray-700">Generate articles, emails, social media posts, and creative content</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                  <div className="text-2xl mb-2">📚</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Learning & Productivity</h4>
                  <p className="text-sm text-gray-700">Study assistance, research help, and productivity tools for students and professionals</p>
                </div>
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-lg p-4">
                  <div className="text-2xl mb-2">💼</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Business & Career</h4>
                  <p className="text-sm text-gray-700">Business strategy, marketing ideas, career guidance, and professional development</p>
                </div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Use Cases of Richa AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">👨‍🎓</div>
                  <h4 className="font-semibold text-gray-800 mb-2">For Students</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Homework help and study assistance</li>
                    <li>• Essay and assignment writing</li>
                    <li>• Exam preparation and practice</li>
                    <li>• Research and information gathering</li>
                    <li>• Learning new concepts</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">💼</div>
                  <h4 className="font-semibold text-gray-800 mb-2">For Working Professionals</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Email drafting and communication</li>
                    <li>• Report writing and documentation</li>
                    <li>• Data analysis and insights</li>
                    <li>• Presentation creation</li>
                    <li>• Skill development and upskilling</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">👩‍🏫</div>
                  <h4 className="font-semibold text-gray-800 mb-2">For Teachers & Trainers</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Lesson plan creation</li>
                    <li>• Educational content development</li>
                    <li>• Assessment and quiz generation</li>
                    <li>• Student feedback and evaluation</li>
                    <li>• Teaching material preparation</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-2xl mb-2">🚀</div>
                  <h4 className="font-semibold text-gray-800 mb-2">For Entrepreneurs & Startups</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Business plan development</li>
                    <li>• Marketing content creation</li>
                    <li>• Customer communication</li>
                    <li>• Market research and analysis</li>
                    <li>• Productivity and automation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Why Learn Richa AI */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Students Should Learn Richa AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                  <div className="text-xl mb-2">🎯</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Skill Development</h4>
                  <p className="text-sm text-gray-700">Build future-ready skills that employers value. AI literacy is becoming essential in every field.</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-xl mb-2">💼</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Career Readiness</h4>
                  <p className="text-sm text-gray-700">Stand out in job applications. AI skills give you a competitive edge in the job market.</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="text-xl mb-2">⚡</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Productivity Improvement</h4>
                  <p className="text-sm text-gray-700">Complete assignments faster, learn more effectively, and manage time better with AI assistance.</p>
                </div>
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-lg p-4">
                  <div className="text-xl mb-2">🔮</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Future Job Relevance</h4>
                  <p className="text-sm text-gray-700">AI is transforming industries. Learning AI now prepares you for tomorrow's job market.</p>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4 mt-6">Why Working Professionals Need Richa AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                  <div className="text-xl mb-2">⏱️</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Time-Saving</h4>
                  <p className="text-sm text-gray-700">Automate repetitive tasks, draft emails faster, and focus on high-value work that matters.</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                  <div className="text-xl mb-2">🧠</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Smart Decision-Making</h4>
                  <p className="text-sm text-gray-700">Get data-driven insights and analysis to make better business decisions quickly.</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-4">
                  <div className="text-xl mb-2">📈</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Upskilling & Reskilling</h4>
                  <p className="text-sm text-gray-700">Stay relevant in your career by learning AI tools and adapting to technological changes.</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-4">
                  <div className="text-xl mb-2">🏆</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Competitive Advantage</h4>
                  <p className="text-sm text-gray-700">Use AI to outperform competitors, deliver better results, and advance your career faster.</p>
                </div>
              </div>
            </div>

            {/* Richa AI for Businesses */}
            <div className="bg-gradient-to-r from-indigo-50 to-fuchsia-50 rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Richa AI for Businesses & Startups</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-xl mb-2">📢</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Marketing & Content</h4>
                  <p className="text-sm text-gray-700">Create engaging social media posts, blog articles, and marketing campaigns without hiring expensive agencies.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-xl mb-2">💬</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Customer Support</h4>
                  <p className="text-sm text-gray-700">Provide 24/7 customer assistance, answer queries instantly, and improve customer satisfaction.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-xl mb-2">⚙️</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Operations & Automation</h4>
                  <p className="text-sm text-gray-700">Automate routine tasks, streamline workflows, and reduce manual work for your team.</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-xl mb-2">💰</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Cost Efficiency</h4>
                  <p className="text-sm text-gray-700">Reduce operational costs, minimize hiring needs, and maximize ROI with AI-powered solutions.</p>
                </div>
              </div>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Learning Richa AI – Course Modules</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
                  <div className="text-2xl mb-2">📚</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Module 1: Basics</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Understanding AI fundamentals</li>
                    <li>• Introduction to Richa AI platform</li>
                    <li>• Setting up your account</li>
                    <li>• Navigating the interface</li>
                  </ul>
                </div>
                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <div className="text-2xl mb-2">🖐️</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Module 2: Hands-on Usage</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Creating your first AI conversation</li>
                    <li>• Using different features</li>
                    <li>• Best practices and tips</li>
                    <li>• Common use cases</li>
                  </ul>
                </div>
                <div className="border-2 border-fuchsia-200 rounded-lg p-4 bg-fuchsia-50">
                  <div className="text-2xl mb-2">💡</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Module 3: Prompting Skills</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Writing effective prompts</li>
                    <li>• Getting better results</li>
                    <li>• Advanced techniques</li>
                    <li>• Optimizing outputs</li>
                  </ul>
                </div>
                <div className="border-2 border-teal-200 rounded-lg p-4 bg-teal-50">
                  <div className="text-2xl mb-2">🌍</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Module 4: Real-world Applications</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Academic projects and assignments</li>
                    <li>• Business and professional tasks</li>
                    <li>• Creative content creation</li>
                    <li>• Problem-solving scenarios</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Career Opportunities */}
            <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Opportunities After Learning Richa AI</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="text-xl mb-2">🤖</div>
                  <h4 className="font-semibold text-gray-800 mb-2">AI-Powered Roles</h4>
                  <p className="text-sm text-gray-700">AI Specialist, Prompt Engineer, AI Content Creator, AI Consultant roles in various industries</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="text-xl mb-2">💼</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Freelancing & Consulting</h4>
                  <p className="text-sm text-gray-700">Offer AI services, content creation, and consulting to businesses as a freelancer</p>
                </div>
                <div className="bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-lg p-4">
                  <div className="text-xl mb-2">🚀</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Entrepreneurship</h4>
                  <p className="text-sm text-gray-700">Start your own AI-powered business, create AI tools, or build AI-based solutions</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4">
                  <div className="text-xl mb-2">📈</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Corporate Growth</h4>
                  <p className="text-sm text-gray-700">Advance in your current role by leveraging AI skills, leading to promotions and better opportunities</p>
                </div>
              </div>
            </div>

            {/* Certification */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Certification & Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🎓</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Course Completion Certificate</h4>
                  <p className="text-sm text-gray-700">Receive a recognized certificate upon completing the training program</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Skill Validation</h4>
                  <p className="text-sm text-gray-700">Validate your AI skills through assessments and practical exercises</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">💼</div>
                  <h4 className="font-semibold text-gray-800 mb-2">Resume & LinkedIn Value</h4>
                  <p className="text-sm text-gray-700">Add certification to your resume and LinkedIn profile to showcase your AI expertise</p>
                </div>
              </div>
            </div>

            {/* Course Summary */}
            <div className="bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 rounded-xl p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Summary & Key Takeaways</h3>
              
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">What You Learned:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Fundamentals of AI and Generative AI
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Introduction to Richa AI platform and features
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Practical use cases for students, professionals, and businesses
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    Career opportunities and future prospects
                  </li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Why Richa AI Matters:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Affordable and accessible AI for everyone
                  </li>
                  <li className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Designed specifically for Indian users
                  </li>
                  <li className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Focus on education and skill development
                  </li>
                  <li className="flex items-start">
                    <span className="text-fuchsia-600 mr-2">•</span>
                    Practical tool for real-world applications
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Next Steps:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Start using Richa AI for your daily tasks
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Practice with different features and use cases
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Complete the exam to get certified
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Share your learning with others
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
