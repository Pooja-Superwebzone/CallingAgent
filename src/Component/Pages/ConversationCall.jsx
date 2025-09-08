import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { sendConversationCall } from "../../hooks/useAuth";

const AGENT_ID = "28194";       
const FROM_NUMBER_ID = "396";

export default function ConversationCall() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    if (!/^\d{10,}$/.test(mobile.trim())) {
      setError("Enter a valid 10+ digit mobile number");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      agent_id: AGENT_ID,
      to: `+91${mobile.trim()}`,  
      from_number_id: FROM_NUMBER_ID,
    };

    try {
      setSubmitting(true);
      await sendConversationCall(payload);
      toast.success("Conversation call triggered!");
      setMobile("");
    } catch (err) {
      toast.error(err.message || "Failed to trigger call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6  ">
      <div className="mx-auto max-w-sd bg-white rounded-xl shadow p-6 ">
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
          //     className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              {submitting ? "Calling..." : "Send Call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
