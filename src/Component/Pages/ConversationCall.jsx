import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { startPlivoCallAndLog } from "../../api/plivoCall";

const DEFAULT_KEYWORD = "richa";

function formatPhoneE164(mobile) {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  if (String(mobile).trim().startsWith("+")) return String(mobile).trim();
  return digits ? `+${digits}` : "";
}

export default function ConversationCall() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const digits = mobile.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid 10-digit mobile number");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const phone_number = formatPhoneE164(mobile);
    if (!/^\+\d{10,15}$/.test(phone_number)) {
      setError("Enter a valid phone number with country code");
      return;
    }

    try {
      setSubmitting(true);
      const { logError } = await startPlivoCallAndLog({
        keyword: DEFAULT_KEYWORD,
        phone_number,
      });
      if (logError) {
        toast.error(logError?.message || "Call started but failed to save call log.");
      } else {
        toast.success("Conversation call triggered!");
      }
      setMobile("");
    } catch (err) {
      toast.error(err.message || "Failed to trigger call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-sd bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Conversation Call
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="Enter 10 digit number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                error ? "border-red-400 focus:ring-red-300" : "focus:ring-indigo-200"
              }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setMobile("")}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              disabled={submitting}
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-60"
            >
              {submitting ? "Calling..." : "Send Call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
