import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { getWhatsappTemplates, sendWhatsappPersonalMessage } from "../../hooks/useAuth";
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import * as XLSX from "xlsx";
import Cookies from "js-cookie";
import service from "../../api/axios";

export default function WhatsappSendMsg() {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const PNF = PhoneNumberFormat;

  const [rows, setRows] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobile, setMobile] = useState("");
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState("IN");
  const [error, setError] = useState("");
  const [uploadedNumbers, setUploadedNumbers] = useState([]);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Minutes state
  const [twoWayMinutes, setTwoWayMinutes] = useState(0);
  const [internationalMinutes, setInternationalMinutes] = useState(0);
  const [loadingMinutes, setLoadingMinutes] = useState(false);

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

  // Fetch minutes
  useEffect(() => {
    const fetchProfileMinutes = async () => {
      setLoadingMinutes(true);
      try {
        const res = await service.get("Profile", {
          headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
        });

        const minuteObj = res?.data?.data?.twilio_user_minute || {};
        const twoWayMinuteObj = res?.data?.data?.twilio_two_way_user_minute || {};

        let two = 0;
        if (twoWayMinuteObj && typeof twoWayMinuteObj === "object") {
          two = Number(twoWayMinuteObj.minute ?? 0);
        } else {
          two = Number(
            minuteObj?.two_way ??
              minuteObj?.twoWay ??
              minuteObj?.inbound ??
              minuteObj?.inbound_minute ??
              0
          );
        }

        const international = Number(
          minuteObj?.international ?? minuteObj?.international_minute ?? minuteObj?.intl ?? 0
        );

        setTwoWayMinutes(two);
        setInternationalMinutes(international);
      } catch (err) {
        console.warn("Could not fetch profile minutes:", err);
      } finally {
        setLoadingMinutes(false);
      }
    };

    fetchProfileMinutes();
  }, []);

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

  // Handle Excel upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));
    if (!validExtensions.includes(fileExtension)) {
      setFileError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setFileError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length === 0) {
          setFileError("Excel file is empty");
          return;
        }

        const headers = jsonData[0];
        if (!headers || !headers.map((h) => String(h).toLowerCase()).includes("number")) {
          setFileError("Excel file must have 'Number' column header");
          return;
        }

        const indexOfNumber = headers.map((h) => String(h).toLowerCase()).indexOf("number");

        const normalized = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const cell = row && row[indexOfNumber];
          if (!cell) continue;
          const cellStr = String(cell).trim();
          const e164 = parseAndValidateToE164(cellStr, countryCode);
          if (e164) {
            normalized.push(e164);
          } else {
            // skip invalid numbers silently
            continue;
          }
        }

        if (normalized.length === 0) {
          const sel = countries.find((c) => c.code === countryCode);
          setFileError(`No valid ${sel ? sel.name : countryCode} numbers found in the file`);
          return;
        }

        setUploadedNumbers(normalized);
        toast.success(`Successfully loaded ${normalized.length} numbers from Excel file`);
      } catch (error) {
        console.error("Error reading Excel file:", error);
        setFileError("Error reading Excel file. Please check the file format.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Download template
  const handleDownloadTemplate = () => {
    const data = [["Number"], ["9876543210"]];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 0 });
      const cell = ws[cellAddress];
      if (cell) {
        cell.t = "s";
        cell.v = String(cell.v);
      }
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "whatsapp_message_template.xlsx");
  };

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
    if (!selectedTemplate) {
      setError("Please select a template.");
      return false;
    }
    if (!mobile && uploadedNumbers.length === 0) {
      setError("Please enter a mobile number or upload an Excel file.");
      return false;
    }
    if (uploadedNumbers.length === 0 && mobile) {
      const e164 = parseAndValidateToE164(mobile, countryCode);
      if (!e164) {
        const selected = countries.find((c) => c.code === countryCode);
        const countryName = selected ? selected.name : countryCode;
        setError(`Enter a valid ${countryName} phone number.`);
        return false;
      }
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

      const numbersToProcess = uploadedNumbers.length > 0 ? uploadedNumbers : [mobile];

      if (uploadedNumbers.length === 0 && !mobile.trim()) {
        setError("Please enter a mobile number or upload an Excel file.");
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const raw of numbersToProcess) {
        try {
          let toNumber = raw;
          if (!toNumber.startsWith("+")) {
            const e164 = parseAndValidateToE164(raw, countryCode);
            if (!e164) {
              throw new Error("Invalid number after parsing");
            }
            toNumber = e164;
          }

          const payload = {
            customer_phone: toNumber,
            template_id: selectedTemplate,
          };

          const res = await sendWhatsappPersonalMessage(payload);
          console.log("send-message-personal response:", res);
          successCount++;
        } catch (err) {
          console.error("send-message-personal error for number", raw, ":", err);
          errorCount++;
        }
      }

      if (successCount > 0) toast.success(`Successfully sent ${successCount} message(s)!`);
      if (errorCount > 0) toast.error(`${errorCount} message(s) failed. Please check the logs.`);

      // Clear form
      setMobile("");
      setUploadedNumbers([]);
      setSelectedTemplate("");
      setError("");
      setFileError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("send-message-personal error:", err);
      toast.error(err?.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-sd bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Send WhatsApp Message</h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-gray-700 mr-2">Remaining Minutes</div>
              <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-200">
                <div className="flex flex-col items-center px-3">
                  <span className="text-xs text-gray-600">Two-way</span>
                  <span className="text-base font-semibold text-gray-800">{loadingMinutes ? "..." : twoWayMinutes}</span>
                </div>

                <div className="h-6 w-[1px] bg-gray-300" />

                <div className="flex flex-col items-center px-3">
                  <span className="text-xs text-gray-600">International</span>
                  <span className="text-base font-semibold text-gray-800">{loadingMinutes ? "..." : internationalMinutes}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <label className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 cursor-pointer">
                Upload Excel
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
              </label>
              <button onClick={handleDownloadTemplate} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl transition">
                Download Excel
              </button>
            </div>
          </div>
        </div>

        {fileError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {fileError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => {
                const id = e.target.value;
                const name = e.target.options[e.target.selectedIndex]?.text || "";
                setSelectedTemplate(id);
                setSelectedTemplateName(name);
              }}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                error && !selectedTemplate ? "border-red-400 focus:ring-red-300" : "focus:ring-indigo-200"
              }`}
              disabled={loading}
            >
              <option value="">{loading ? "Loading templates..." : "-- Select a template --"}</option>
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name || `Template ${r.id}`}
                </option>
              ))}
            </select>
          </div>

          {uploadedNumbers.length === 0 && (
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
          )}

          {uploadedNumbers.length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <div className="text-sm text-gray-700">
                Loaded <span className="font-semibold">{uploadedNumbers.length}</span> numbers (normalized to E.164).
              </div>
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUploadedNumbers([]);
                    setFileError("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                >
                  Remove uploaded numbers
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setMobile("");
                setSelectedTemplate("");
                setError("");
                setUploadedNumbers([]);
                setFileError("");
                if (fileInputRef.current) fileInputRef.current.value = "";
                if (countries.find((c) => c.code === "IN")) setCountryCode("IN");
              }}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              disabled={submitting}
            >
              Clear
            </button>

            <button type="submit" disabled={submitting} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-60">
              {submitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
