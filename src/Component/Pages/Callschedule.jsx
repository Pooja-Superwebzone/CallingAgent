import React, { useEffect, useState } from "react";
import { getCallSchedule, submitCallSchedule } from "../../hooks/useAuth";

export default function Callschedule() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    day: "",
    call_script: "",
    static_script: "",
    email_script: "",
  });
  const [errors, setErrors] = useState({});


const fetchSchedules = async () => {
  setLoading(true);
  try {
    const res = await getCallSchedule();

    const extracted =
      (Array.isArray(res) && res) ||
      (Array.isArray(res?.data) && res.data) ||
      (Array.isArray(res?.schedules) && res.schedules) ||
      (Array.isArray(res?.results) && res.results) ||
      (Array.isArray(res?.data?.items) && res.data.items) ||
      [];

    console.log("RAW getCallSchedule response:", res);
    console.log("EXTRACTED rows:", extracted);

    const safeParseWhatsappBody = (item) => {

      if (item?.static_script) return item.static_script;

      let content = item?.whatsapp_template?.content;
      if (!content) return "";

      try {

        let parsed = typeof content === "string" ? JSON.parse(content) : content;
        if (typeof parsed === "string") {
         
          parsed = JSON.parse(parsed);
        }
        const types = parsed?.types || parsed?.content?.types;
        const body =
          types?.["twilio/text"]?.body ?? types?.twilio?.text?.body ??
     "";

        return body || "";
      } catch (err) {
        console.error("❌ Failed to parse whatsapp_template.content", err, content);
        return "";
      }
    };

    const mapped = extracted.map((item) => ({
      id: item.id,
      day: item.day,
      call_script: item.calling_script ?? item.call_script ?? "",
      static_script: safeParseWhatsappBody(item),
      email_script: item.email_script ?? "",
    }));

    setRows(mapped);
    console.log( mapped);
  } catch (e) {
    console.error("❌ Failed to fetch call schedules:", e);
    setRows([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSchedules();
  }, []);

 
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setShowModal(false);
    if (showModal) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const validate = () => {
    const e = {};
    const dayNum = Number(form.day);
    if (!form.day || Number.isNaN(dayNum) || dayNum < 1)
      e.day = "Day must be a number ≥ 1.";
    if (!form.call_script.trim()) e.call_script = "Call script is required.";
    if (!form.static_script.trim())
      e.static_script = "WhatsApp script is required.";
    if (!form.email_script.trim()) e.email_script = "Email script is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await submitCallSchedule({
        day: Number(form.day),
        calling_script: form.call_script.trim(),
        email_script: form.email_script.trim(),
        static_script: form.static_script.trim(),
        
      });
      
      setShowModal(false);
      setForm({ day: "", call_script: "", static_script: "", email_script: "" });
      setErrors({});
      fetchSchedules();
    } catch (err) {
      console.error("❌ Failed to submit schedule:", err);
      alert(err.message || "Failed to submit schedule");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
     
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-700">Call Schedule</h2>
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          onClick={() => setShowModal(true)}
        >
          Add Schedule
        </button>
      </div>

 
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Day</th>
              <th className="px-4 py-2">Call Script</th>
              <th className="px-4 py-2">WhatsApp Script</th>
              <th className="px-4 py-2">Email Script</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center">
                  No schedules found
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 align-top">
                  <td className="px-4 py-2 font-medium">{r.day}</td>

                  <td className="px-4 py-2 max-w-[250px] whitespace-pre-wrap break-words">
                    {r.call_script}
                  </td>

                  <td className="px-4 py-2 max-w-[250px] whitespace-pre-wrap break-words">
                    {r.static_script}
                  </td>

                  <td className="px-4 py-2 max-w-[250px] whitespace-pre-wrap break-words">
                    {r.email_script}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

  
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
        
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setShowModal(false)}
            aria-hidden
          />

          <div className="relative bg-white border rounded-xl shadow-2xl p-4 w-full max-w-lg mt-16">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Add Schedule</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
        
              <div>
                <label className="block text-sm mb-1">Day</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g., 1"
                  value={form.day}
                  onChange={(e) => setForm({ ...form, day: e.target.value })}
                  className={`w-full border rounded px-3 py-2 text-sm ${
                    errors.day ? "border-red-400" : ""
                  }`}
                  required
                />
                {errors.day && (
                  <p className="text-xs text-red-500 mt-1">{errors.day}</p>
                )}
              </div>

              {/* Call Script */}
              <div>
                <label className="block text-sm mb-1">Call Script</label>
                <textarea
                  rows={4}
                  placeholder="Write the call script here..."
                  value={form.call_script}
                  onChange={(e) =>
                    setForm({ ...form, call_script: e.target.value })
                  }
                  className={`w-full border rounded px-3 py-2 text-sm ${
                    errors.call_script ? "border-red-400" : ""
                  }`}
                  required
                />
                {errors.call_script && (
                  <p className="text-xs text-red-500 mt-1">{errors.call_script}</p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-1">WhatsApp Script</label>
                <textarea
                  rows={4}
                  placeholder="Write the WhatsApp script here..."
                  value={form.static_script}
                  onChange={(e) =>
                    setForm({ ...form, static_script: e.target.value })
                  }
                  className={`w-full border rounded px-3 py-2 text-sm ${
                    errors.static_script ? "border-red-400" : ""
                  }`}
                  required
                />
                {errors.static_script && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.static_script}
                  </p>
                )}
              </div>

              {/* Email Script */}
              <div>
                <label className="block text-sm mb-1">Email Script</label>
                <textarea
                  rows={4}
                  placeholder="Write the email script here..."
                  value={form.email_script}
                  onChange={(e) =>
                    setForm({ ...form, email_script: e.target.value })
                  }
                  className={`w-full border rounded px-3 py-2 text-sm ${
                    errors.email_script ? "border-red-400" : ""
                  }`}
                  required
                />
                {errors.email_script && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.email_script}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-sm bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
