
import React, { useState, useRef, useEffect } from "react";
import { HiUpload } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { sendManualCall } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import service from "../../api/axios";

function Sendcall() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [file, setFile] = useState(null);
  const [brand, setBrand] = useState("");
  const [script, setScript] = useState("");
  const [selectedLang, setSelectedLang] = useState("en");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [minute, setMinute] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTwilioUser, setIsTwilioUser] = useState(false);
  const [useStaticScript, setUseStaticScript] = useState(false);
  const [role, setRole] = useState("");


  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const brandList = [
    { id: "SMLK", name: "SMLK" },
    { id: "IBCRM", name: "IBCRM" },
    { id: "IBHRMS", name: "IBHRMS" },
  ];



  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await service.get("Profile", {
          headers: {
            Authorization: `Bearer ${Cookies.get("CallingAgent")}`,
          },
        });

        const userMinute = res.data?.data?.twilio_user_minute?.minute || "0";
        const adminFlag = res.data?.data?.twilio_user_is_admin === 1;
        const twilioUserFlag =
          res.data?.data?.twilio_user === 1 ||
          Cookies.get("twilio_user") === "1";
        const userRole = res.data?.data?.role || "";

        setRole(userRole.toLowerCase());
        setMinute(Number(userMinute));
        setIsAdmin(adminFlag);
        setIsTwilioUser(twilioUserFlag);

        // ✅ Store in localStorage
        localStorage.setItem("userRemainingMinutes", userMinute);
      } catch (error) {
        console.error("❌ Failed to fetch profile:", error);
        toast.error("Failed to load user profile");
      }
    }

    fetchProfile();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required.";

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Enter a valid email address.";
    }

    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10,}$/.test(mobile.trim())) {
      newErrors.mobile = "Enter a valid 10+ digit mobile number.";
    }

    // ✅ ALLOW any one option
    const isScriptFilled = !!script.trim();
    const isStaticChecked = useStaticScript;
    const isBrandSelected = !!brand;

    if (!isScriptFilled && !isStaticChecked && !isBrandSelected) {
      newErrors.script = "Please provide a script, OR select static script, OR choose a brand.";
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
      };

      if (useStaticScript) {
        payload.static = 1;

      } else if (script.trim()) {
        payload.script = script.trim();
      } else if (brand) payload.brand = brand;

      console.log("📤 API Payload:", payload);
      const token = Cookies.get("CallingAgent");
      console.log("🪪 Token:", token);
      await sendManualCall(payload);
      toast.success("Call triggered successfully");
    } catch (error) {
      console.error("❌ sendManualCall error:", error);
      toast.error(
        error?.response?.data?.message || error.message || "Call failed"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.body.appendChild(script);
    window.googleTranslateElementInit = googleTranslateElementInit;

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const translateText = async () => {
      if (!script.trim() || selectedLang === "en") return;
      try {
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${selectedLang}&dt=t&q=${encodeURIComponent(
            script
          )}`
        );
        const result = await response.json();
        const translatedText = result[0].map((item) => item[0]).join(" ");
        setScript(translatedText);
      } catch (err) {
        toast.error("Translation failed");
      }
    };

    translateText();
  }, [selectedLang]);

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl relative"
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Send Call</h2>
          <div className="text-sm font-semibold text-blue-600">
            Remaining Minutes: {minute}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.name ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"}`} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"}`} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">  Contact  Number</label>
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter mobile number"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${errors.mobile ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"}`} />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>



            {/* SCRIPT TEXTAREA - only show if no brand is selected */}
            {!brand && (!useStaticScript || (!script.trim() && !useStaticScript)) && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Language</label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="border mb-2 px-4 py-2 rounded w-full"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>

                <textarea
                  rows="5"
                  className="w-full border rounded-xl px-4 py-3"
                  value={script}
                  onChange={(e) => {
                    const value = e.target.value;
                    setScript(value);
                    if (value.trim()) {
                      // Clear brand and uncheck static mode if user starts typing
                      setBrand("");
                      setUseStaticScript(false);
                    }
                  }}
                  placeholder="Write your script here..."
                />
                {errors.script && (
                  <p className="text-red-500 text-sm mt-1">{errors.script}</p>
                )}
              </div>
            )}

            {/* STATIC SCRIPT TOGGLE - only show if no script and no brand selected */}
            {!script.trim() && !brand && !(role === "admin" && isTwilioUser == "1") && (
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={useStaticScript}
                    onChange={() => {
                      setUseStaticScript((prev) => {
                        const next = !prev;
                        if (!next) setBrand("");
                        return next;
                      });
                    }}
                  />
                  Use static script
                </label>
              </div>
            )}

            {/* BRAND DROPDOWN - only show if script is empty */}
            {!script.trim() && !useStaticScript && role === "admin" && !isTwilioUser && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-1">Select Brand</label>
                <select
                  value={brand}
                  onChange={(e) => {
                    const newBrand = e.target.value;
                    if (brand !== newBrand) {
                      setBrand(newBrand);
                      if (newBrand) {
                        setScript("");
                        setUseStaticScript(false);
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a brand</option>
                  {brandList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                )}
              </div>
            )}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition w-full sm:w-auto" disabled={loading}>
              {loading ? "Sending..." : "Make a Call"}
            </button>
          </div>

          <div className="flex flex-col justify-start">
            <label className="block font-semibold text-gray-700 mb-2">📂 Upload Excel File (.xlsx)</label>
            <div className={`relative border-2 border-dashed p-6 rounded-xl text-center ${errors.file ? "border-red-400 hover:border-red-500" : "border-gray-300 hover:border-blue-400"}`}>
              <HiUpload className="text-4xl mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-gray-500 truncate">{file ? file.name : "No file selected"}</p>
            </div>
            <input type="file" accept=".xls,.xlsx" ref={fileInputRef} onChange={(e) => { setFile(e.target.files[0]); setErrors((prev) => ({ ...prev, file: "" })); }} className="hidden" />
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button type="button" onClick={handleFileClick} className="bg-gray-700 hover:bg-gray-900 text-white py-2 px-4 rounded-xl transition">Select File</button>
              {file && (
                <a href={URL.createObjectURL(file)} download={file.name} className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl transition">Download Selected File</a>
              )}
            </div>
            {errors.file && <p className="text-red-500 text-sm mt-2">{errors.file}</p>}
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






