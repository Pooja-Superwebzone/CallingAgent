import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  sendWhatsappText,
  sendWhatsappTemplate,
  getPlivoTemplates,
  normalizePhone,
  isValidE164,
} from "../../../api/whatsappApi";

export default function WhatsAppSend() {
  const [activeTab, setActiveTab] = useState("text");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingTemplates(true);
      try {
        const res = await getPlivoTemplates({ approvedOnly: true });
        const list = Array.isArray(res?.data) ? res.data : res?.templates ?? [];
        setTemplates(list.filter((t) => (t.status || "").toUpperCase() === "APPROVED" || !t.status));
      } catch (err) {
        toast.error(err.message || "Failed to load templates");
      } finally {
        setLoadingTemplates(false);
      }
    };
    load();
  }, []);

  const validatePhone = () => {
    const normalized = normalizePhone(phone);
    if (!isValidE164(normalized)) {
      toast.error("Enter a valid phone number with country code (e.g. +918309532104)");
      return null;
    }
    return normalized;
  };

  const handleSendText = async (e) => {
    e.preventDefault();
    const to = validatePhone();
    if (!to) return;
    if (!message.trim()) {
      toast.error("Message is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendWhatsappText({ to, message: message.trim() });
      toast.success(res?.message || "Message sent successfully");
      setMessage("");
    } catch (err) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendTemplate = async (e) => {
    e.preventDefault();
    const normalized = validatePhone();
    if (!normalized) return;
    if (!templateId) {
      toast.error("Please select a template");
      return;
    }

    setSubmitting(true);
    try {
      const res = await sendWhatsappTemplate({
        phone: normalized,
        template_id: templateId,
      });
      toast.success(res?.message || "Template message sent");
      setPhone("");
      setTemplateId("");
    } catch (err) {
      toast.error(err.message || "Failed to send template");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTemplate = templates.find(
    (t) => String(t.template_id || t.id) === String(templateId)
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Send WhatsApp Message</h2>
        <p className="text-sm text-gray-500 mb-6">Plivo · E.164 format (+91...)</p>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === "text"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Free Text (Session)
          </button>
          <button
            onClick={() => setActiveTab("template")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === "template"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Template Message
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          {/* Phone field shared */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+918309532104"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="text-xs text-gray-400 mt-1">Include country code (+91 for India)</p>
          </div>

          {activeTab === "text" ? (
            <form onSubmit={handleSendText} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                Free text works only within the 24-hour session window after the user last messaged you.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-60 text-sm"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSendTemplate} className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                Template messages work outside the 24-hour window (Meta-approved templates only).
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  disabled={loadingTemplates}
                >
                  <option value="">
                    {loadingTemplates ? "Loading templates..." : "-- Select approved template --"}
                  </option>
                  {templates.map((t) => (
                    <option key={t.id || t.template_id} value={t.template_id || t.id}>
                      {t.name} ({t.template_id || t.id})
                    </option>
                  ))}
                </select>
              </div>
              {selectedTemplate && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-1">Preview</p>
                  <p>{selectedTemplate.body_text || selectedTemplate.body || "—"}</p>
                </div>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || loadingTemplates}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60 text-sm"
                >
                  {submitting ? "Sending..." : "Send Template"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
