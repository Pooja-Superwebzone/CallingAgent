import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getAgents, sendOmniCall } from "../../hooks/useAuth";

const FROM_NUMBER_ID = "396";
const COUNTRY_PREFIX = "+91";

export default function SendOmniCall() {
  const navigate = useNavigate();

  const [agents, setAgents] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAgents = async () => {
      setFetching(true);
      try {
        const list = await getAgents();
        setAgents(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load agents:", err);
        toast.error(err?.message || "Failed to load agents");
      } finally {
        setFetching(false);
      }
    };
    loadAgents();
  }, []);

  const validate = () => {
    const digits = mobile.trim().replace(/\D/g, "");
    if (!selectedAgentId) {
      setError("Please select an agent.");
      return false;
    }
    if (!/^\d{10}$/.test(digits)) {
      setError("Enter a valid 10-digit mobile number");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const digits = mobile.trim().replace(/\D/g, "").slice(0, 10);
    const payload = {
      agent_id: String(selectedAgentId),
      to: `${COUNTRY_PREFIX}${digits}`, 
      from_number_id: FROM_NUMBER_ID,
    };

    try {
      setSubmitting(true);
      const res = await sendOmniCall(payload);
      console.log("omni/call response:", res);
      toast.success("Omni call dispatched!");
      setMobile("");
  
      navigate("/agents_page");
    } catch (err) {
      console.error("omni/call error:", err);
      toast.error(err?.message || "Failed to trigger call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-sd bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Send Call</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agent
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                error && !selectedAgentId
                  ? "border-red-400 focus:ring-red-300"
                  : "focus:ring-indigo-200"
              }`}
              disabled={fetching}
              required
            >
              <option value="">{fetching ? "Loading agents..." : "-- Select an agent --"}</option>
              {agents.map((a) => (
                <option key={a.id} value={a.agent_id}>
                  {a.agent_id} — {a.name || `Agent ${a.agent_id}`}
                </option>
              ))}
            </select>
          </div>

  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              type="tel"
              placeholder="Enter 10 digit number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                error ? "border-red-400 focus:ring-red-300" : "focus:ring-indigo-200"
              }`}
            />
          
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setMobile("");
                setSelectedAgentId("");
                setError("");
               
              }}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              disabled={submitting}
            >
              Clear
            </button>

            <button
              type="submit"
              disabled={submitting}
            //  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
               className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              {submitting ? "Sending..." : "Send Call"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
