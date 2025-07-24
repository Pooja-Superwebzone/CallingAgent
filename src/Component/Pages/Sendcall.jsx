
import React, { useState, useRef } from "react";
import { HiUpload } from "react-icons/hi";
import { useNavigate } from "react-router-dom";


function Sendcall() {
  const [mobile, setMobile] = useState("");
  const [script, setScript] = useState("");
  const [file, setFile] = useState(null);
  const [brandsList, setBrandsList] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [brand, setBrand] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unique brands from API
  const fetchBrands = async () => {
    try {
      const res = await getCallLogs();
      const extracted = res?.data || res;
      if (Array.isArray(extracted)) {
        const uniqueBrands = [
          ...new Set(extracted.map((item) => item.brand).filter(Boolean)),
        ];
        setBrandsList(uniqueBrands);
      }
    } catch (error) {
      console.error("Error loading brands:", error.message);
    }
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

    if (!brand) {
      newErrors.brand = "Please select a brand.";
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
      console.log("Brand:", brand);
      console.log("File:", file.name);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl"
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 mb-8 text-nowrap">
          Send Call
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* LEFT */}
          <div>
            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1 text-nowrap">
                Mobile Number
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-nowrap ${errors.mobile
                    ? "border-red-500 focus:ring-red-300"
                    : "focus:ring-blue-500"
                  }`}
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1 text-nowrap">
                  {errors.mobile}
                </p>
              )}
            </div>

            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1 text-nowrap">
                Message Script
              </label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Enter your message"
                rows="5"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 text-nowrap ${errors.script
                    ? "border-red-500 focus:ring-red-300"
                    : "focus:ring-blue-500"
                  }`}
              />
              {errors.script && (
                <p className="text-red-500 text-sm mt-1 text-nowrap">
                  {errors.script}
                </p>
              )}
            </div>

           <div className="mb-5">
  <label className="block font-semibold text-gray-700 mb-1 text-nowrap">
    Select Brand
  </label>
  <select
    value={brand}
    onChange={(e) => setBrand(e.target.value)}
    className="border px-4 py-2 rounded w-full"
  >
    <option value="">Select a brand</option>
    <option value="SMLK">SMLK</option>
    <option value="IBCRM">IBCRM</option>
    <option value="IBHRMS">IBHRMS</option>
  </select>
</div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition w-full sm:w-auto text-nowrap"
              disabled={loading}
            >
              {loading ? "Sending..." : "Make a Call"}
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-start">
            <label className="block font-semibold text-gray-700 mb-2 text-nowrap">
              📂 Upload Excel File (.xlsx)
            </label>

            <div
              className={`relative border-2 border-dashed p-6 rounded-xl text-center transition text-nowrap ${errors.file
                  ? "border-red-400 hover:border-red-500"
                  : "border-gray-300 hover:border-blue-400"
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

            <div className="flex flex-col sm:flex-row gap-4 mt-4 flex-wrap items-center">
              <button
                type="button"
                onClick={handleFileClick}
                className="bg-gray-700 hover:bg-gray-900 text-white py-2 px-4 rounded-xl transition w-full sm:w-auto text-nowrap"
              >
                Select File
              </button>

              {file && (
                <a
                  href={URL.createObjectURL(file)}
                  download={file.name}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl transition w-full sm:w-auto text-nowrap"
                >
                  Download Selected File
                </a>
              )}
            </div>

            {errors.file && (
              <p className="text-red-500 text-sm mt-2 text-nowrap">
                {errors.file}
              </p>
            )}

            {/* Audio Preview */}
            <div className="mt-8">
              <label className="block font-semibold text-gray-700 mb-2 text-nowrap">
                🎧 Audio Message
              </label>
              <audio controls className="w-full">
                <source src="/Hindi.wav" type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <p className="text-sm text-gray-500 mt-1 text-nowrap">
                This audio will be used in the call.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Sendcall;
