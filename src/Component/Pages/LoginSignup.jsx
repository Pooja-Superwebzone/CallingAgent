
// import React from "react";
// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import Cookies from "js-cookie";
// import toast from "react-hot-toast";
// import { login, signupTwillioUser, verifyEmailOtp } from "../../hooks/useAuth";

// export default function LoginSignup() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [activeTab, setActiveTab] = useState("login");
//   const [loginData, setLoginData] = useState({ email: "", password: "" });
//   const [signupData, setSignupData] = useState({
//     name: "",
//     email: "",
//     contact_no: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [otp, setOtp] = useState("");

//   useEffect(() => {
//     const tab = new URLSearchParams(location.search).get("tab");
//     if (tab === "login" || tab === "signup") setActiveTab(tab);
//   }, [location.search]);

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//     setErrors({});
//     navigate(`/login?tab=${tab}`);
//   };

//   const validateLogin = () => {
//     const errs = {};
//     if (!loginData.email) errs.email = "Email is required";
//     if (!loginData.password) errs.password = "Password is required";
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const validateSignup = () => {
//     const errs = {};
//     if (!signupData.name) errs.name = "Name is required";
//     if (!signupData.email) errs.email = "Email is required";
//     if (!signupData.contact_no) errs.contact_no = "Contact number is required";
//     if (!signupData.password) errs.password = "Password is required";
//     if (signupData.password !== signupData.confirmPassword)
//       errs.confirmPassword = "Passwords do not match";
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleLoginSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateLogin()) return;
//     setLoading(true);
//     try {
//       const res = await login(loginData);
//       const { token, data: user } = res;

//       if (token && user) {
//         Cookies.set("CallingAgent", token, { expires: 365 });
//         Cookies.set("role", user?.role || "user", { expires: 365 });
//         Cookies.set("twilio_user", String(user?.twilio_user || "0"), { expires: 365 });

//         toast.success("Login successful");
//         navigate("/sendcall");
//       } else {
//         toast.error("Invalid login response");
//       }
//     } catch (error) {
//       toast.error(error.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSignupSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateSignup()) return;
//     setLoading(true);
//     try {
//       const payload = { ...signupData, minute: "10" };
//       const res = await signupTwillioUser(payload);
//       const { token, data: user } = res;

//       if (token && user) {
//         Cookies.set("CallingAgent", token, { expires: 365 });
//         Cookies.set("role", user?.role || "user", { expires: 365 });
//         Cookies.set("twilio_user", String(user?.twilio_user || "0"), { expires: 365 });

//         setShowOtpModal(true); // Show OTP Modal
//       } else {
//         toast.success("Signup successful! Please verify your email.");
//         setShowOtpModal(true);
//       }
//     } catch (error) {
//       toast.error(error.message || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleOtpVerify = async () => {
//     if (otp.length !== 6) {
//       toast.error("Please enter a valid 6-digit OTP");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await verifyEmailOtp({ email: signupData.email, otp });

//       if (
//         res?.verified === true ||
//         res?.status === "success" ||
//         res?.message?.toLowerCase().includes("verified")
//       ) {
//         toast.success("OTP verified successfully");
//         setShowOtpModal(false);

//         // ✅ Set token and user info manually if not returned in OTP response
//         if (res.token && res.data) {
//           Cookies.set("CallingAgent", res.token, { expires: 365 });
//           Cookies.set("role", res.data?.role || "user", { expires: 365 });
//           Cookies.set("twilio_user", String(res.data?.twilio_user || "0"), { expires: 365 });
//         } else {
//           // fallback - reuse from signup
//           const token = Cookies.get("CallingAgent");
//           if (!token) {
//             toast.error("User session missing. Please login again.");
//             navigate("/login?tab=login");
//             return;
//           }
//         }

//         // ✅ Navigate with state to trigger welcome popup in Sidebar
//         navigate("/sendcall", {
//           state: {
//             showWelcome: true,
//             trialMinutes: "10",
//           },
//           replace: true,
//         });
//       } else {
//         toast.error("Invalid OTP");
//       }
//     } catch (error) {
//       toast.error(error.message || "OTP verification failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* OTP Modal */}
//       {showOtpModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-xl">
//             <h2 className="text-2xl font-bold mb-4 text-center">OTP Verification</h2>
//             <input
//               type="text"
//               maxLength={6}
//               value={otp}
//               onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
//               className="w-full px-4 py-2 border rounded-md mb-4 text-center text-xl tracking-widest"
//               placeholder="------"
//             />
//             <button
//               onClick={handleOtpVerify}
//               className="bg-blue-600 text-white w-full py-2 rounded-md font-bold hover:bg-blue-700"
//             >
//               Verify OTP
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Main Layout */}
//       <div className="flex flex-col md:flex-row items-center justify-center min-h-screen px-4 py-8">
//         <div className="w-full sm:w-2/3 md:w-1/3 flex justify-center items-center h-auto sm:h-[50vh] md:h-[60vh] lg:h-[70vh] p-4">
//           <img
//             src="/Richa.png"
//             alt="Login Visual"
//             className="w-auto h-full max-h-[70vh] object-cover rounded-3xl shadow-lg"
//           />
//         </div>

//         <div className="w-full md:w-1/2 flex items-center justify-center p-6">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
//             <div className="flex">
//               <button
//                 onClick={() => handleTabClick("login")}
//                 className={`w-1/2 py-3 rounded-tl-2xl text-lg font-bold ${activeTab === "login" ? "bg-blue-600 text-white" : "bg-blue-200 text-gray-700"
//                   }`}
//               >
//                 Login
//               </button>
//               <button
//                 onClick={() => handleTabClick("signup")}
//                 className={`w-1/2 py-3 rounded-tr-2xl text-lg font-bold ${activeTab === "signup" ? "bg-blue-600 text-white" : "bg-blue-200 text-gray-700"
//                   }`}
//               >
//                 Signup
//               </button>
//             </div>

//             <form onSubmit={activeTab === "login" ? handleLoginSubmit : handleSignupSubmit} className="p-8">
//               <h2 className="text-3xl font-extrabold text-center text-gray-700 mb-6">
//                 {activeTab === "login" ? "Login" : "Signup"}
//               </h2>

//               {activeTab === "signup" && (
//                 <>
//                   <div className="mb-4">
//                     <label className="block text-gray-700 font-medium mb-1">Business Name</label>
//                     <input
//                       type="text"
//                       value={signupData.name}
//                       onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
//                       className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
//                         }`}
//                       placeholder="Enter your name"
//                     />
//                     {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
//                   </div>
//                   <div className="mb-4">
//                     <label className="block text-gray-700 font-medium mb-1">Contact No</label>
//                     <input
//                       type="text"
//                       value={signupData.contact_no}
//                       onChange={(e) => {
//                         const value = e.target.value.replace(/\D/g, "");
//                         if (value.length <= 10) setSignupData({ ...signupData, contact_no: value });
//                       }}
//                       maxLength={10}
//                       className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.contact_no ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
//                         }`}
//                       placeholder="Enter contact number"
//                     />
//                     {errors.contact_no && <p className="text-red-500 text-sm">{errors.contact_no}</p>}
//                   </div>
//                 </>
//               )}

//               {/* Email */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 font-medium mb-1">Email</label>
//                 <input
//                   type="email"
//                   value={activeTab === "login" ? loginData.email : signupData.email}
//                   onChange={(e) =>
//                     activeTab === "login"
//                       ? setLoginData({ ...loginData, email: e.target.value })
//                       : setSignupData({ ...signupData, email: e.target.value })
//                   }
//                   className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
//                     }`}
//                   placeholder="you@example.com"
//                 />
//                 {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
//               </div>

//               {/* Password */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 font-medium mb-1">Password</label>
//                 <input
//                   type="password"
//                   value={activeTab === "login" ? loginData.password : signupData.password}
//                   onChange={(e) =>
//                     activeTab === "login"
//                       ? setLoginData({ ...loginData, password: e.target.value })
//                       : setSignupData({ ...signupData, password: e.target.value })
//                   }
//                   className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
//                     }`}
//                   placeholder="Enter password"
//                 />
//                 {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
//               </div>

//               {/* Confirm Password */}
//               {activeTab === "signup" && (
//                 <div className="mb-4">
//                   <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
//                   <input
//                     type="password"
//                     value={signupData.confirmPassword}
//                     onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
//                     className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.confirmPassword ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
//                       }`}
//                     placeholder="Re-enter password"
//                   />
//                   {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl w-full mt-2 ${loading ? "opacity-60 cursor-not-allowed" : ""
//                   }`}
//               >
//                 {loading ? (
//                   <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent mx-auto" />
//                 ) : activeTab === "login" ? "Login" : "Sign-up"}
//               </button>

//               <div className="text-center text-sm text-gray-600 mt-4">
//                 {activeTab === "login" ? (
//                   <>
//                     Don&apos;t have an account?{" "}
//                     <button type="button" onClick={() => handleTabClick("signup")} className="text-blue-600 font-semibold">
//                       Click here to Signup
//                     </button>
//                   </>
//                 ) : (
//                   <>
//                     Already have an account?{" "}
//                     <button type="button" onClick={() => handleTabClick("login")} className="text-blue-600 font-semibold">
//                       Click here to Login
//                     </button>
//                   </>
//                 )}
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

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
  const [showVerifyText, setShowVerifyText] = useState(false);


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
    setShowVerifyText(false); // reset

    try {
      const res = await login(loginData);
      const { token, data: user } = res;

      const isAdminWithTwilioZero = user?.role === "admin" && String(user?.twilio_user) === "0";

      if (!user?.email_verified_at && !isAdminWithTwilioZero) {
        toast.error("Email not verified. OTP sent to your email.");
        setSignupData((prev) => ({ ...prev, email: loginData.email }));
        await resendTwillioOtp({ email: loginData.email });
        setLoginUnverified(true);
        setShowVerifyText(true);

        return;
      }

      if (token && user) {
        Cookies.set("CallingAgent", token, { expires: 365 });
        Cookies.set("role", user?.role || "user", { expires: 365 });
        Cookies.set("twilio_user", String(user?.twilio_user || "0"), { expires: 365 });
        Cookies.set("email_verified", user?.email_verified_at ? "true" : "false", { expires: 365 });
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

      if (
        res?.verified === true ||
        res?.status === "success" ||
        res?.message?.toLowerCase().includes("verified")
      ) {
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
          Cookies.set("email_verified", user?.email_verified_at ? "true" : "false", { expires: 365 });
        } else {
          const token = Cookies.get("CallingAgent");
          if (!token) {
            toast.error("User session missing. Please login again.");
            navigate("/login?tab=login");
            return;
          }
        }

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
              className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-4 mt-2 text-center">
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

                {/* Show only if login page and user is unverified */}
                {activeTab === "login" && loginUnverified && showVerifyText && (
                  <p
                    onClick={() => {
                      setShowOtpModal(true);
                      setShowVerifyText(false); // Hide link after clicking
                    }}
                    className="text-lg text-red-700  font-semibold cursor-pointer hover:underline mb-4"
                  >
                    Please verify your email
                  </p>
                )}


                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
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
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

