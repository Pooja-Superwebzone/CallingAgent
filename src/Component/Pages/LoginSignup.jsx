
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { login, signupTwillioUser } from "../../hooks/useAuth";

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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tab = queryParams.get("tab");
    if (tab === "login" || tab === "signup") {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setErrors({});
    navigate(`/login?tab=${tab}`);
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!loginData.email) newErrors.email = "Email is required";
    if (!loginData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!signupData.name) newErrors.name = "Name is required";
    if (!signupData.email) newErrors.email = "Email is required";
    if (!signupData.contact_no) newErrors.contact_no = "Contact number is required";
    if (!signupData.password) newErrors.password = "Password is required";
    if (signupData.password !== signupData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const res = await login({
        email: loginData.email,
        password: loginData.password,
      });

      const token = res?.token;
      const user = res?.data;

      if (token && user) {
        Cookies.set("CallingAgent", token, { expires: 365, secure: true, sameSite: "Strict" });
        Cookies.set("role", user?.role || "user", { expires: 365, secure: true, sameSite: "Strict" });
        Cookies.set("twilio_user", String(user?.twilio_user || "0"), {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });

        toast.success("Login successful");
        navigate("/calling");
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
      const payload = {
        name: signupData.name,
        email: signupData.email,
        contact_no: signupData.contact_no,
        password: signupData.password,
        minute: "10",
      };

      const res = await signupTwillioUser(payload);

      const token = res?.token;
      const user = res?.data;

      if (token && user) {
        Cookies.set("CallingAgent", token, { expires: 365, secure: true, sameSite: "Strict" });
        Cookies.set("role", user?.role || "user", { expires: 365, secure: true, sameSite: "Strict" });
        Cookies.set("twilio_user", String(user?.twilio_user || "0"), {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });

        toast.success("Signup successful!");
        navigate("/calling");
      } else {
        toast.success("Signup successful! Please log in.");
        setActiveTab("login");
        navigate("/login?tab=login");
      }
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen  px-4 py-8">
      {/* Left Side - Image (not full height) */}
      <div className="w-full sm:w-2/3 md:w-1/3 flex justify-center items-center h-auto sm:h-[50vh] md:h-[60vh] lg:h-[70vh] p-4">
        <img
          src="/Richa.png"
          alt="Login Visual"
          className="w-auto h-full max-h-[70vh] object-cover rounded-3xl shadow-lg"
        />
      </div>



      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex">
            <button
              onClick={() => handleTabClick("login")}
              className={`w-1/2 py-3 rounded-tl-2xl text-lg font-bold ${activeTab === "login"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-200 text-gray-700"
                }`}
            >
              Login
            </button>
            <button
              onClick={() => handleTabClick("signup")}
              className={`w-1/2 py-3 rounded-tr-2xl text-lg font-bold ${activeTab === "signup"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-200 text-gray-700"
                }`}
            >
              Signup
            </button>
          </div>

          <form
            onSubmit={
              activeTab === "login"
                ? handleLoginSubmit
                : handleSignupSubmit
            }
            className="p-8"
          >
            <h2 className="text-3xl font-extrabold text-center text-gray-700 mb-6">
              {activeTab === "login" ? "Login" : "Signup"}
            </h2>

            {/* Signup extra fields */}
            {activeTab === "signup" && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        name: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.name
                        ? "border-red-500 focus:ring-red-300"
                        : "focus:ring-blue-500"
                      }`}
                    placeholder="Enter your name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-1">
                    Contact No
                  </label>
                  <input
                    type="text"
                    value={signupData.contact_no}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setSignupData({
                          ...signupData,
                          contact_no: value,
                        });
                      }
                    }}
                    maxLength={10}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.contact_no
                        ? "border-red-500 focus:ring-red-300"
                        : "focus:ring-blue-500"
                      }`}
                    placeholder="Enter contact number"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                value={
                  activeTab === "login"
                    ? loginData.email
                    : signupData.email
                }
                onChange={(e) =>
                  activeTab === "login"
                    ? setLoginData({
                      ...loginData,
                      email: e.target.value,
                    })
                    : setSignupData({
                      ...signupData,
                      email: e.target.value,
                    })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.email
                    ? "border-red-500 focus:ring-red-300"
                    : "focus:ring-blue-500"
                  }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                value={
                  activeTab === "login"
                    ? loginData.password
                    : signupData.password
                }
                onChange={(e) =>
                  activeTab === "login"
                    ? setLoginData({
                      ...loginData,
                      password: e.target.value,
                    })
                    : setSignupData({
                      ...signupData,
                      password: e.target.value,
                    })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.password
                    ? "border-red-500 focus:ring-red-300"
                    : "focus:ring-blue-500"
                  }`}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            {activeTab === "signup" && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.confirmPassword
                      ? "border-red-500 focus:ring-red-300"
                      : "focus:ring-blue-500"
                    }`}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl w-full mt-2 ${loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent mx-auto" />
              ) : activeTab === "login" ? (
                "Login"
              ) : (
                "Sign-up"
              )}
            </button>

            {/* Switch Tabs */}
            <div className="text-center text-sm text-gray-600 mt-4">
              {activeTab === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabClick("signup")}
                    className="text-blue-600 font-semibold"
                  >
                    Click here to Signup
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabClick("login")}
                    className="text-blue-600 font-semibold"
                  >
                    Click here to Login
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );

}
