import React, { useState } from "react";
import { toast } from "react-hot-toast";

const PLIVO_AGENT_FLOW_URL =
  "https://agentflow.plivo.com/v1/account/MAZDGWYZRMMZCTYJA2YS/flow/4d00448a-7504-450a-8fae-4f2351a9c203";
const DEFAULT_KEYWORD = "richa";

async function startPlivoAgentFlowCall({ keyword, phone_number }) {
  const res = await fetch(PLIVO_AGENT_FLOW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword,
      phone_number,
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      `Failed to start call (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return payload;
}

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
      await startPlivoAgentFlowCall({
        keyword: DEFAULT_KEYWORD,
        phone_number,
      });
      toast.success("Conversation call triggered!");
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
