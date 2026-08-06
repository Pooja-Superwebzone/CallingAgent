import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";
import { Download, Upload } from "lucide-react";
import { sendWhatsappBulkExcel, getPlivoTemplates } from "../../../api/whatsappApi";

const MAX_ROWS = 200;

export default function WhatsAppBulkSend() {
  const [mode, setMode] = useState("text");
  const [message, setMessage] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      setLoadingTemplates(true);
      try {
        const res = await getPlivoTemplates({ approvedOnly: true });
        const list = Array.isArray(res?.data) ? res.data : res?.templates ?? [];
        setTemplates(list);
      } catch (err) {
        toast.error(err.message || "Failed to load templates");
      } finally {
        setLoadingTemplates(false);
      }
    };
    load();
  }, []);

  const downloadSample = (sampleMode) => {
    let data;
    if (sampleMode === "template") {
      data = [["phone"], ["+918309532104"], ["+917623846723"]];
    } else if (message.trim()) {
      data = [["phone"], ["+918309532104"], ["+917623846723"]];
    } else {
      data = [
        ["phone", "message"],
        ["+918309532104", "Hi John"],
        ["+917623846723", "Hi Jane"],
      ];
    }
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
    XLSX.writeFile(wb, `whatsapp_bulk_${sampleMode}_sample.xlsx`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (![".xlsx", ".xls", ".csv"].includes(ext)) {
      toast.error("Please upload .xlsx, .xls, or .csv file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const rowCount = Math.max(0, rows.length - 1);
        if (rowCount > MAX_ROWS) {
          toast.error(`Maximum ${MAX_ROWS} rows allowed. Your file has ${rowCount} rows.`);
          if (fileRef.current) fileRef.current.value = "";
          return;
        }
        setSelectedFile(file);
        toast.success(`${rowCount} row(s) detected`);
      } catch {
        toast.error("Could not read file. Check the format.");
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please upload an Excel/CSV file");
      return;
    }
    if (mode === "text" && !message.trim()) {
      toast.error("Enter a message (or include a message column in Excel)");
      return;
    }
    if (mode === "template" && !templateId) {
      toast.error("Please select a template");
      return;
    }
    if (delaySeconds < 1 || delaySeconds > 30) {
      toast.error("Delay must be between 1 and 30 seconds");
      return;
    }

    const formData = new FormData();
    formData.append("excel", selectedFile);
    formData.append("delay_seconds", String(delaySeconds));
    formData.append("mode", mode);

    if (mode === "text") {
      formData.append("message", message.trim());
    } else {
      formData.append("template_id", templateId);
    }

    setSubmitting(true);
    setResults(null);
    try {
      const res = await sendWhatsappBulkExcel(formData);
      setResults(res);
      toast.success(res?.message || "Bulk send completed");
    } catch (err) {
      toast.error(err.message || "Bulk send failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Bulk WhatsApp Send</h2>
        <p className="text-sm text-gray-500 mb-6">Upload Excel/CSV · Plivo · Max {MAX_ROWS} rows</p>

        <div className="bg-white rounded-xl shadow p-6 space-y-5">
          {/* Mode toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Send Mode</label>
            <div className="flex gap-3">
              {["text", "template"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    mode === m
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {m === "text" ? "Text Message" : "Template Message"}
                </button>
              ))}
            </div>
          </div>

          {mode === "text" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (same for all rows, or use message column in Excel)
              </label>
              <textarea
                rows={3}
                placeholder="Hi, this is a message for all contacts..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Leave blank if each row has its own message column (message, text, body, msg)
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                disabled={loadingTemplates}
              >
                <option value="">
                  {loadingTemplates ? "Loading..." : "-- Select approved template --"}
                </option>
                {templates.map((t) => (
                  <option key={t.id || t.template_id} value={t.template_id || t.id}>
                    {t.name} ({t.template_id || t.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delay between messages (seconds)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
              className="w-32 border rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Recommended: 3–5 seconds</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel / CSV
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 cursor-pointer text-sm">
                <Upload size={16} />
                Choose File
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => downloadSample(mode)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                <Download size={16} />
                Download Sample
              </button>
            </div>
            {selectedFile && (
              <p className="text-sm text-green-700 mt-2">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Phone column headers: phone, number, mobile, contact, whatsapp
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-60 text-sm"
            >
              {submitting ? "Sending..." : "Start Bulk Send"}
            </button>
          </div>
        </div>

        {/* Results table */}
        {results && (
          <div className="mt-6 bg-white rounded-xl shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-800">Send Results</h3>
              <p className="text-sm text-gray-500 mt-1">
                {results.message ||
                  `${results.sent ?? 0} sent, ${results.failed ?? 0} failed`}
                {results.delay_seconds != null && ` · ${results.delay_seconds}s delay`}
              </p>
            </div>
            {Array.isArray(results.results) && results.results.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Row</th>
                      <th className="px-4 py-2 text-left">Phone</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{row.row ?? i + 1}</td>
                        <td className="px-4 py-2 font-mono text-xs">{row.phone}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              row.success
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.success ? "Success" : "Failed"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-gray-500">
                          {row.success
                            ? row.message_uuid || "Queued"
                            : row.message || "Error"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="p-4 text-sm text-gray-500">No row-level results returned.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
