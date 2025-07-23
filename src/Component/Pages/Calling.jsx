
import { useRef, useState } from "react";
import { HiUpload } from "react-icons/hi";
import React from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
 import { toast } from 'react-hot-toast';

function Calling() {
  const [mobile, setMobile] = useState("");
  const [script, setScript] = useState("");
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
 

const handleLogout = () => {
  setLoading(true);

  setTimeout(() => {
    const token = Cookies.get("CallingAgent");

    if (token) {
      Cookies.remove("CallingAgent");
      Cookies.remove("role");
      toast.success("Logout successful");
    } else {
      toast.error("You're already logged out");
    }
    navigate("/login");
    setLoading(false);
  }, 1000);
};

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const validate = () => {
    const newErrors = {};

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10,}$/.test(mobile.trim())) {
      newErrors.mobile = "Enter a valid 10+ digit mobile number.";
    }

    if (!script.trim()) {
      newErrors.script = "Message script is required.";
    } else if (script.trim().length < 10) {
      newErrors.script = "Message must be at least 10 characters.";
    }

    if (!file) {
      newErrors.file = "Excel file is required.";
    } else if (!/\.(xls|xlsx)$/i.test(file.name)) {
      newErrors.file = "Only .xls or .xlsx files are allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    setTimeout(() => {
      console.log("✅ Valid form:");
      console.log("Mobile:", mobile);
      console.log("Script:", script);
      console.log("File:", file.name);
      setLoading(false);
    }, 2000);
  };

  return (
    <>
      {/* Logout Button Fixed Outside */}
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`fixed top-4 right-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-md z-50 flex items-center justify-center gap-2 ${loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
      >
        {loading && (
          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
        )}
        {loading ? " " : "Logout"}
      </button>

      <div className="min-h-screen flex w-full  items-center justify-center p-4 sm:p-6 relative">

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 mb-8">
            Send Call
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* LEFT */}
            <div>
              <div className="mb-5">
                <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="Enter mobile number"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.mobile
                    ? "border-red-500 focus:ring-red-300"
                    : "focus:ring-blue-500"
                    }`}
                />
                {errors.mobile && (
                  <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-1">
                  Message Script
                </label>
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Enter your message"
                  rows="5"
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.script
                    ? "border-red-500 focus:ring-red-300"
                    : "focus:ring-blue-500"
                    }`}
                />
                {errors.script && (
                  <p className="text-red-500 text-sm mt-1">{errors.script}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition w-full sm:w-auto"
                disabled={loading}
              >
                Make a call
              </button>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col justify-start">
              <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
                📂 Upload Excel File (.xlsx)
              </label>

              <div
                className={`relative border-2 border-dashed p-6 rounded-xl text-center transition ${errors.file
                  ? "border-red-400 hover:border-red-500"
                  : "border-gray-300 hover:border-blue-400"
                  }`}
              >
                <HiUpload className="text-4xl mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-gray-500">
                  {file ? file.name : "No file selected"}
                </p>
              </div>

              <input
                type="file"
                accept=".xls,.xlsx"
                ref={fileInputRef}
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setErrors((prev) => ({ ...prev, file: "" }));
                }}
                className="hidden"
              />

              <div className="flex gap-4 mt-4 flex-col sm:flex-row items-center w-full flex-wrap">
                <button
                  type="button"
                  onClick={handleFileClick}
                  className="bg-gray-700 hover:bg-gray-900 text-white py-2 px-4 rounded-xl transition w-full sm:w-auto"
                >
                  Select File
                </button>

                {file && (
                  <a
                    href={URL.createObjectURL(file)}
                    download={file.name}
                    className="bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-xl transition w-full sm:w-auto"
                  >
                    Download Selected File
                  </a>
                )}
              </div>

              {errors.file && (
                <p className="text-red-500 text-sm mt-2">{errors.file}</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default Calling;


