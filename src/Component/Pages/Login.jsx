
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { login } from "../../hooks/useAuth"; // make sure this file exists

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    setLoading(true);
    try {
      const res = await login({ email, password }); // API call
      toast.success("Login successful");

      navigate("/"); // change route after login
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">
          Login
        </h2>

        <div className="mb-5">
          <label className="block text-lg text-left font-semibold text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none  focus:ring-2 ${errors.email
              ? "border-red-500 focus:ring-red-300"
              : "focus:ring-blue-500"
              }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div className="mb-5">
          <label className="block text-left text-lg font-semibold text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.password
              ? "border-red-500 focus:ring-red-300"
              : "focus:ring-blue-500"
              }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition w-full h-12 flex items-center justify-center ${loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-7 w-7 border-4 border-white border-t-transparent"></div>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}

export default Login;

