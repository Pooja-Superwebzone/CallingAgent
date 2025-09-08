import React, { useState, useRef, useEffect } from "react";
import { HiUpload } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { sendManualCall, getWhatsappTemplates } from "../../hooks/useAuth";
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
  const [rows, setRows] = useState([]);
  const [twilioUser, setTwilioUser] = useState(0);


  const [selectedTemplate, setSelectedTemplate] = useState("");     
  const [selectedTemplateName, setSelectedTemplateName] = useState("");

  const isAdminTwilio = isTwilioUser && role === "admin";
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const brandList = [
    { id: "SMLK", name: "SMLK" },
    { id: "IBCRM", name: "IBCRM" },
    { id: "IBHRMS", name: "IBHRMS" },
  ];

  // Language options as in the code
  const languageOptions = [
    { value: "en", label: "English", key: "english" },
    { value: "hi", label: "Hindi", key: "hindi" },
    { value: "gu", label: "Gujarati", key: "gujarati" },
    { value: "mr", label: "Marathi", key: "marathi" },
    { value: "ta", label: "Tamil", key: "tamil" },
  ];

  // For mapping language value to the key used in the backend/files
  const langValueToKey = {
    en: "english",
    hi: "hindi",
    gu: "gujarati",
    mr: "marathi",
    ta: "tamil",
  };

  // For mapping language key to file name (example, for SMLK)
  const brandLangFiles = {
    SMLK: {
      english: "SMLK_ENGLISH.mp3",
      hindi: "SMLK_HINDI.mp3",
      marathi: "SMLK_MARATHI.mp3",
      gujarati: "SMLK_GUJARTI.mp3",
    },
    // Add other brands if needed
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getWhatsappTemplates(); 
      setRows(Array.isArray(res?.templates) ? res.templates : []);
    } catch (e) {
      console.error("❌ Fetch templates failed:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch Profile
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await service.get("Profile", {
          headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
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

    if (isAdminTwilio) {
      if (!useStaticScript) newErrors.script = "Please tick the static script checkbox.";
    } else {
      const isScriptFilled = !!script.trim();
      const isStaticChecked = useStaticScript;
      const isBrandSelected = !!brand;
      if (!isScriptFilled && !isStaticChecked && !isBrandSelected) {
        newErrors.script = "Please provide a script, OR select static script, OR choose a brand.";
      }
    }

    if (!name.trim()) newErrors.name = "Name is required.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      newErrors.email = "Enter a valid email address.";
    if (!mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!/^\d{10,}$/.test(mobile.trim()))
      newErrors.mobile = "Enter a valid 10+ digit mobile number.";

    const isScriptFilled = !!script.trim();
    const isStaticChecked = useStaticScript;
    const isBrandSelected = !!brand;
    if (!isScriptFilled && !isStaticChecked && !isBrandSelected) {
      newErrors.script = "Please provide a script, OR select static script, OR choose a brand.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileClick = () => fileInputRef.current?.click();

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

      if (selectedTemplate) payload.whatsapp_id  = selectedTemplate;

      if (useStaticScript) {
        payload.static = 1;
      } else if (script.trim()) {
        payload.script = script.trim();
      } else if (brand) {
        payload.brand = brand;
        // Add lang key if brand is selected
        payload.lang = langValueToKey[selectedLang] || "english";
      }

      console.log("📤 API Payload:", payload);
      const token = Cookies.get("CallingAgent");
      console.log("🪪 Token:", token);

      await sendManualCall(payload);
      toast.success("Call triggered successfully");
    } catch (error) {
      console.error("❌ sendManualCall error:", error);
      toast.error(error?.response?.data?.message || error.message || "Call failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", includedLanguages: "en,hi", autoDisplay: false },
        "google_translate_element"
      );
    };
    const scriptTag = document.createElement("script");
    scriptTag.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    scriptTag.async = true;
    document.body.appendChild(scriptTag);
    window.googleTranslateElementInit = googleTranslateElementInit;
    return () => { document.body.removeChild(scriptTag); };
  }, []);

  useEffect(() => {
    const translateText = async () => {
      if (!script.trim() || selectedLang === "en") return;
      try {
        const response = await fetch(
          `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${selectedLang}&dt=t&q=${encodeURIComponent(script)}`
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

  const getTemplateBody = (tpl) => tpl?.content?.types?.["twilio/text"]?.body || "";

  // For showing audio file for brand+lang
  const getBrandAudioFile = () => {
    if (!brand) return null;
    const langKey = langValueToKey[selectedLang] || "english";
    if (brandLangFiles[brand] && brandLangFiles[brand][langKey]) {
      return `/audio/${brandLangFiles[brand][langKey]}`;
    }
    return null;
  };

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="bg-white shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-5xl relative">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Send Call</h2>
          <div className="text-sm font-semibold text-blue-600">Remaining Minutes: {minute}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.name ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.email ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div className="mb-5">
              <label className="block font-semibold text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter mobile number"
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.mobile ? "border-red-500 focus:ring-red-300" : "focus:ring-blue-500"
                }`}
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  const id = e.target.value; 
                  const name = e.target.options[e.target.selectedIndex]?.text || "";
                  setSelectedTemplate(id);
                  setSelectedTemplateName(name);

                  const tpl = rows.find((r) => String(r.id) === String(id));
                  setScript(tpl?.content?.types?.["twilio/text"]?.body || "");

                  if (id) {
                    setBrand("");
                    setUseStaticScript(false);
                  }
                }}
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a template</option>
                {rows.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || `Template ${r.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Show language select and textarea if NOT admin-twilio, NOT brand, NOT static script */}
            {!isAdminTwilio && !brand && !useStaticScript && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Language</label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="border mb-2 px-4 py-2 rounded w-full"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>

                <textarea
                  rows="5"
                  className="w-full border rounded-xl px-4 py-3"
                  value={script}
                  onChange={(e) => {
                    const value = e.target.value;
                    setScript(value);
                    if (value.trim()) {
                      setBrand("");
                      setUseStaticScript(false);
                    }
                  }}
                  placeholder="Write your script here..."
                />
                {errors.script && <p className="text-red-500 text-sm mt-1">{errors.script}</p>}
              </div>
            )}

  
            {!isAdminTwilio && !script.trim() && !brand && (
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={useStaticScript}
                    onChange={() => setUseStaticScript((prev) => !prev)}
                  />
                  Use static script
                </label>
              </div>
            )}

            {isAdminTwilio && (
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={useStaticScript}
                    onChange={() => {
                      setUseStaticScript((prev) => !prev);
                      setBrand("");
                    }}
                  />
                  Static Script
                </label>
                {!useStaticScript && (
                  <p className="text-orange-600 text-sm mt-1">Please tick this to proceed.</p>
                )}
                {errors.script && <p className="text-red-500 text-sm mt-1">{errors.script}</p>}
              </div>
            )}

            {/* Show brand select if NOT script, NOT static script, role=admin, NOT twilio user */}
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
                {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
              </div>
            )}

            {/* Show language select if brand is selected and not admin-twilio */}
            {!isAdminTwilio && brand  && twilioUser === 0 && role === "admin"&& (
              <div className="mb-4">
                <label className="block font-semibold text-gray-700 mb-1">Select Language</label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="border mb-2 px-4 py-2 rounded w-full"
                >
                  {languageOptions.map((lang) => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? "Sending..." : "Make a Call"}
            </button>
          </div>

          <div className="flex flex-col justify-start">
            <label className="block font-semibold text-gray-700 mb-2">📂 Upload Excel File (.xlsx)</label>
            <div
              className={`relative border-2 border-dashed p-6 rounded-xl text-center ${
                errors.file ? "border-red-400 hover:border-red-500" : "border-gray-300 hover:border-blue-400"
              }`}
            >
              <HiUpload className="text-4xl mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-gray-500 truncate">{file ? file.name : "No file selected"}</p>
            </div>
            <input
              type="file"
              accept=".xls,.xlsx"
              ref={fileInputRef}
              onChange={(e) => {
                setFile(e.target.files[0] || null);
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
            <div className="mt-8">
              <label className="block font-semibold text-gray-700 mb-2">🎧 Audio Message</label>
              {/* Show brand+lang audio if brand is selected, else fallback */}
              {brand && getBrandAudioFile() ? (
                <audio controls className="w-full">
                  <source src={getBrandAudioFile()} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              ) : (
                <audio controls className="w-full">
                  <source src="/Hindi.wav" type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {brand && getBrandAudioFile()
                  ? `Audio for ${brand} in ${languageOptions.find(l => l.value === selectedLang)?.label || "English"}`
                  : "This audio will be used in the call."}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Sendcall;
 
