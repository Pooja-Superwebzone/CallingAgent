import React, { useState, useRef } from "react";
import { HiUpload } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { sendManualCall } from "../../hooks/useAuth";

function Sendcall() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [file, setFile] = useState(null);
  const [brand, setBrand] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10,}$/.test(mobile.trim())) {
      newErrors.mobile = "Enter a valid 10+ digit mobile number.";
    }

    if (!brand) {
      newErrors.brand = "Please select a brand.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: `+91${mobile.trim()}`,
        brand,
      };
      const response = await sendManualCall(payload);
      console.log("✅ Call triggered successfully", response);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 mb-8">
          Send Call
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* LEFT FORM */}
          <div>
            {/* Name */}
            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                  }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email (Optional) */}
            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                  }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.mobile ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                  }`}
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            {/* Brand */}
            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Select Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="border px-4 py-2 rounded w-full"
              >
                <option value="">Select a brand</option>
                <option value="IBCRM">IBCRM</option>
                <option value="IBHRMS">IBHRMS</option>
                <option value="SMLK">SMLK</option>
              </select>
              {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Sending..." : "Make a Call"}
            </button>
          </div>

          {/* RIGHT FILE UPLOAD */}
          <div className="flex flex-col justify-start">
            <label className="block font-semibold text-gray-700 mb-2">
              📂 Upload Excel File (.xlsx)
            </label>

            <div
              className={`relative border-2 border-dashed p-6 rounded-xl text-center ${errors.file ? "border-red-400 hover:border-red-500" : "border-gray-300 hover:border-blue-400"
                }`}
            >
              <HiUpload className="text-4xl mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-gray-500 truncate">
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

            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                type="button"
                onClick={handleFileClick}
                className="bg-gray-700 hover:bg-gray-900 text-white py-2 px-4 rounded-xl transition"
              >
                Select File
              </button>

              {file && (
                <a
                  href={URL.createObjectURL(file)}
                  download={file.name}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl transition"
                >
                  Download Selected File
                </a>
              )}
            </div>

            {errors.file && <p className="text-red-500 text-sm mt-2">{errors.file}</p>}

            {/* Audio Preview */}
            <div className="mt-8">
              <label className="block font-semibold text-gray-700 mb-2">🎧 Audio Message</label>
              <audio controls className="w-full">
                <source src="/Hindi.wav" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-sm text-gray-500 mt-1">This audio will be used in the call.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Sendcall;
