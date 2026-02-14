import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { sendPerplexityMessage } from "../../hooks/useAuth";
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";

export default function Perplexity() {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const PNF = PhoneNumberFormat;

  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("Hi, I'm Richa AI, India's first AI Business Assistant. How can I help you today?");
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState("IN");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Build countries list from google-libphonenumber metadata
  useEffect(() => {
    try {
      const regions = Array.from(phoneUtil.getSupportedRegions ? phoneUtil.getSupportedRegions() : []);
      const dn = new Intl.DisplayNames(["en"], { type: "region" });
      const list = regions
        .map((r) => {
          const cc = phoneUtil.getCountryCodeForRegion(r);
          return {
            code: r,
            name: dn.of(r) || r,
            countryCode: cc,
            label: `${dn.of(r) || r} (+${cc})`,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      setCountries(list);

      const hasIN = list.find((c) => c.code === "IN");
      setCountryCode(hasIN ? "IN" : (list[0]?.code || ""));
    } catch (err) {
      console.error("Error building country list from libphonenumber:", err);
      setCountries([{ code: "IN", name: "India", countryCode: 91, label: "India (+91)" }]);
      setCountryCode("IN");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: parse and validate a raw number (string). Returns E.164 string or null.
  const parseAndValidateToE164 = (rawNumber, defaultRegion) => {
    if (!rawNumber || typeof rawNumber !== "string") return null;
    const trimmed = rawNumber.trim();
    try {
      const numberObj = phoneUtil.parseAndKeepRawInput(trimmed, defaultRegion || countryCode);
      const isPossible = phoneUtil.isPossibleNumber(numberObj);
      const isValid = phoneUtil.isValidNumber(numberObj);
      if (isPossible && isValid) {
        const e164 = phoneUtil.format(numberObj, PNF.E164);
        return e164;
      } else {
        return null;
      }
    } catch (err) {
      return null;
    }
  };

  // Validate form
  const validate = () => {
    if (!mobile.trim()) {
      setError("Please enter a mobile number.");
      return false;
    }
    const e164 = parseAndValidateToE164(mobile, countryCode);
    if (!e164) {
      const selected = countries.find((c) => c.code === countryCode);
      const countryName = selected ? selected.name : countryCode;
      setError(`Enter a valid ${countryName} phone number.`);
      return false;
    }
    if (!message.trim()) {
      setError("Please enter a welcome message.");
      return false;
    }
    setError("");
    return true;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setError("");
    try {
      setSubmitting(true);

      let toNumber = mobile;
      if (!toNumber.startsWith("+")) {
        const e164 = parseAndValidateToE164(mobile, countryCode);
        if (!e164) {
          setError("Invalid phone number format.");
          setSubmitting(false);
          return;
        }
        toNumber = e164;
      }

      const payload = {
        to: toNumber,
        message: message.trim(),
      };

      const res = await sendPerplexityMessage(payload);
      console.log("outbound-call response:", res);
      toast.success("Call initiated successfully!");

      // Clear form
      setMobile("");
      setMessage("Hi, I'm Richa AI, India's first AI Business Assistant. How can I help you today?");
      setError("");
    } catch (err) {
      console.error("outbound-call error:", err);
      toast.error(err?.message || "Failed to initiate call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-sd bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">LLM</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <div className="flex gap-2">
              <div className="w-52">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="tel"
                placeholder="Enter phone number (national or +...)"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className={`flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  error ? "border-red-400 focus:ring-red-300" : "focus:ring-indigo-200"
                }`}
              />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
            <textarea
              placeholder="Enter welcome message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                error && !message.trim() ? "border-red-400 focus:ring-red-300" : "focus:ring-indigo-200"
              }`}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setMobile("");
                setMessage("Hi, I'm Richa AI, India's first AI Business Assistant. How can I help you today?");
                setError("");
                if (countries.find((c) => c.code === "IN")) setCountryCode("IN");
              }}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              disabled={submitting}
            >
              Clear
            </button>

            <button type="submit" disabled={submitting} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-60">
              {submitting ? "Sending..." : "Send Call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
