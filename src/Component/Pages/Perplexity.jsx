import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { startPerplexityCallExcel, startPlivoAgentflow } from "../../hooks/useAuth";
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import service from "../../api/axios";

export default function Perplexity() {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const PNF = PhoneNumberFormat;

  const [mobile, setMobile] = useState("");
  const [voiceAgents, setVoiceAgents] = useState([]);
  const [voiceAgentsLoading, setVoiceAgentsLoading] = useState(false);
  const [selectedVoiceAgentId, setSelectedVoiceAgentId] = useState("");
  const [selectedVoiceAgentKeyword, setSelectedVoiceAgentKeyword] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef(null);
  const [countries, setCountries] = useState([]);
  const [countryCode, setCountryCode] = useState("IN");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadVoiceAgents = async () => {
      setVoiceAgentsLoading(true);
      try {
        const res = await service.get("voice-perplexity-agents");
        const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
        const active = list.filter((a) => a?.is_active !== false);
        setVoiceAgents(active);
        const first = active[0];
        if (first?.id) {
          setSelectedVoiceAgentId(String(first.id));
          setSelectedVoiceAgentKeyword(String(first.keyword || "").trim());
        }
      } catch (e) {
        console.error("voice-perplexity-agents error:", e);
        toast.error(e?.response?.data?.message || e?.message || "Failed to load voice agents");
        setVoiceAgents([]);
      } finally {
        setVoiceAgentsLoading(false);
      }
    };
    loadVoiceAgents();
  }, []);

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
    
  }, []);


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


  const validate = () => {
    if (!selectedVoiceAgentKeyword) {
      setError("Please select an agent.");
      return false;
    }

    if (!excelFile && !mobile.trim()) {
      setError("Please enter a mobile number or upload an Excel file.");
      return false;
    }

    if (!mobile.trim()) {
      // ok if excel is present
    } else {
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

      if (excelFile) {
        const res = await startPerplexityCallExcel({
          file: excelFile,
          agent: selectedVoiceAgentKeyword,
        });
        console.log("start-call-excel response:", res);
        toast.success(res?.message || "Excel calls started successfully!");
        setExcelFile(null);
        setFileError("");
        setMobile("");
        setError("");
      } else {
        const res = await startPlivoAgentflow({
          keyword: selectedVoiceAgentKeyword,
          phone_number: toNumber,
        });
        console.log("agentflow response:", res);
        toast.success(res?.message || "Call started successfully!");
        setMobile("");
        setError("");
      }
    } catch (err) {
      console.error("perplexity start-call error:", err);
      toast.error(err?.message || "Failed to start call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-sd bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Send two way call</h2>
        </div>

        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">Note</span> - Kindly keep this window open and do not switch to another window until all calls have been completed.
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Agent</label>
            <select
              value={selectedVoiceAgentId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedVoiceAgentId(id);
                const selected = voiceAgents.find((a) => String(a?.id) === String(id));
                setSelectedVoiceAgentKeyword(String(selected?.keyword || "").trim());
              }}
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              disabled={voiceAgentsLoading}
            >
              <option value="">{voiceAgentsLoading ? "Loading agents..." : "-- Select an agent --"}</option>
              {voiceAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name || a.keyword || `Agent ${a.id}`}
                </option>
              ))}
            </select>
          </div>

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
            <div className="text-xs text-gray-500">
              Tip: If you upload Excel, the call will use the uploaded leads. Otherwise, it will call the mobile number above.
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setExcelFile(f);
                setFileError("");
              }}
              className="hidden"
              disabled={submitting}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-60"
              disabled={submitting}
            >
              Upload Excel
            </button>

            <button
              type="button"
              onClick={() => {
                setMobile("");
                setExcelFile(null);
                setFileError("");
                setError("");
                if (fileInputRef.current) fileInputRef.current.value = "";
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

          {(excelFile || fileError) && (
            <div className="flex items-center justify-between text-xs mt-2">
              <div className="text-gray-600 truncate">
                {fileError ? (
                  <span className="text-red-600">{fileError}</span>
                ) : excelFile ? (
                  <span>Selected Excel: <span className="font-semibold">{excelFile.name}</span></span>
                ) : null}
              </div>
              {excelFile && (
                <button
                  type="button"
                  onClick={() => {
                    setExcelFile(null);
                    setFileError("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                  disabled={submitting}
                >
                  Remove Excel
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
