import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import service from "../../api/axios";
import { startPlivoCallAndLog, resolveCurrentUserAssignment } from "../../api/plivoCall";

const BULK_CALL_DELAY_MS = 2000;
const PHONE_HEADERS = ["phone", "number", "mobile", "contact", "whatsapp"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  const [twoWayMinutes, setTwoWayMinutes] = useState(0);
  const [loadingMinutes, setLoadingMinutes] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);
  const [assignedNumber, setAssignedNumber] = useState("");
  const [transferNumber, setTransferNumber] = useState("");
  const [loadingAssignment, setLoadingAssignment] = useState(true);

  const isSalesPerson = useMemo(() => {
    const role = String(Cookies.get("role") || "").trim().toLowerCase();
    const twilioUser = Number(Cookies.get("twilio_user") || "0");
    return twilioUser === 0 && role !== "admin" && role !== "channelpartner";
  }, []);

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
    const loadAssignment = async () => {
      setLoadingAssignment(true);
      try {
        const ctx = await resolveCurrentUserAssignment();
        setAssignedNumber(ctx?.assigned_number?.phone_no || "");
        setTransferNumber(ctx?.transfer_number || "");
      } catch (err) {
        console.warn("Could not load assigned number:", err);
        setAssignedNumber("");
        setTransferNumber("");
      } finally {
        setLoadingAssignment(false);
      }
    };
    loadAssignment();
  }, []);

  useEffect(() => {
    if (!isSalesPerson) return;

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

        setTwoWayMinutes(Number.isFinite(two) ? two : 0);
      } catch (err) {
        console.warn("Could not fetch profile minutes:", err);
        setTwoWayMinutes(0);
      } finally {
        setLoadingMinutes(false);
      }
    };

    fetchProfileMinutes();
  }, [isSalesPerson]);

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


  const formatPhoneFallback = (raw) => {
    const digits = String(raw || "").replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (String(raw || "").trim().startsWith("+")) return String(raw).trim();
    return digits.length >= 10 ? `+${digits}` : null;
  };

  const normalizePhoneFromCell = (cell) => {
    const raw = String(cell ?? "").trim();
    if (!raw) return null;
    return parseAndValidateToE164(raw, countryCode) || formatPhoneFallback(raw);
  };

  const parsePhonesFromExcel = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          if (!rows.length) {
            reject(new Error("Excel file is empty"));
            return;
          }

          const headers = (rows[0] || []).map((h) => String(h || "").trim().toLowerCase());
          let colIdx = headers.findIndex((h) => PHONE_HEADERS.includes(h));
          if (colIdx < 0) colIdx = 0;

          const phones = [];
          for (let i = 1; i < rows.length; i++) {
            const phone = normalizePhoneFromCell(rows[i]?.[colIdx]);
            if (phone) phones.push(phone);
          }

          if (!phones.length) {
            reject(
              new Error(
                "No valid phone numbers found. Use a column named phone, number, mobile, contact, or whatsapp."
              )
            );
            return;
          }

          resolve(phones);
        } catch (err) {
          reject(new Error(err?.message || "Failed to read Excel file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read Excel file"));
      reader.readAsArrayBuffer(file);
    });

  const runBulkCallsFromExcel = async (file, keyword, assignmentContext, agentUserId) => {
    const phones = await parsePhonesFromExcel(file);
    let success = 0;
    let failed = 0;
    let logFailed = 0;

    setBulkProgress({ current: 0, total: phones.length });

    for (let i = 0; i < phones.length; i++) {
      setBulkProgress({ current: i + 1, total: phones.length });
      try {
        const { logError } = await startPlivoCallAndLog({
          keyword,
          phone_number: phones[i],
          assignmentContext,
          agentUserId,
        });
        success++;
        if (logError) logFailed++;
      } catch (err) {
        failed++;
        console.error(`Bulk call failed for ${phones[i]}:`, err);
      }

      if (i < phones.length - 1) {
        await sleep(BULK_CALL_DELAY_MS);
      }
    }

    return { total: phones.length, success, failed, logFailed };
  };

  const validate = () => {
    if (!selectedVoiceAgentKeyword) {
      setError("Please select an agent.");
      return false;
    }

    if (excelFile) {
      setError("");
      return true;
    }

    if (!mobile.trim()) {
      setError("Please enter a mobile number or upload an Excel file.");
      return false;
    }

    const e164 = parseAndValidateToE164(mobile, countryCode);
    if (!e164) {
      const selected = countries.find((c) => c.code === countryCode);
      const countryName = selected ? selected.name : countryCode;
      setError(`Enter a valid ${countryName} phone number.`);
      return false;
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

      const assignmentContext = await resolveCurrentUserAssignment();
      const selectedAgent = voiceAgents.find(
        (a) => String(a?.id) === String(selectedVoiceAgentId)
      );
      const agentUserId = selectedAgent?.user_id ?? null;

      if (excelFile) {
        const result = await runBulkCallsFromExcel(
          excelFile,
          selectedVoiceAgentKeyword,
          assignmentContext,
          agentUserId
        );
        const logNote =
          result.logFailed > 0 ? ` (${result.logFailed} call log(s) failed to save)` : "";
        toast.success(
          `Bulk calls finished: ${result.success} started, ${result.failed} failed (${result.total} total).${logNote}`
        );
        setExcelFile(null);
        setFileError("");
        setMobile("");
        setError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      let toNumber = mobile.trim();
      if (!toNumber.startsWith("+")) {
        const e164 = parseAndValidateToE164(mobile, countryCode);
        if (!e164) {
          setError("Invalid phone number format.");
          return;
        }
        toNumber = e164;
      }

      const { logError } = await startPlivoCallAndLog({
        keyword: selectedVoiceAgentKeyword,
        phone_number: toNumber,
        assignmentContext,
        agentUserId,
      });
      if (logError) {
        toast.error(
          logError?.message || "Call started but failed to save call log."
        );
      } else {
        toast.success("Call started successfully!");
      }
      setMobile("");
      setError("");
    } catch (err) {
      console.error("perplexity start-call error:", err);
      toast.error(err?.message || "Failed to start call");
    } finally {
      setSubmitting(false);
      setBulkProgress(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-sd bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800">Send two way call</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
              <span className="text-sm font-medium text-gray-700">Assigned Number</span>
              <span className="text-base font-bold text-gray-900">
                {loadingAssignment ? "..." : assignedNumber || "Not assigned"}
              </span>
            </div>
            {transferNumber && !loadingAssignment && (
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                <span className="text-sm font-medium text-gray-700">Transfer</span>
                <span className="text-base font-semibold text-gray-900">{transferNumber}</span>
              </div>
            )}
            {isSalesPerson && (
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">Remaining Minutes</span>
                <span className="text-xl font-bold text-gray-900">
                  {loadingMinutes ? "..." : `${twoWayMinutes} minutes`}
                </span>
              </div>
            )}
          </div>
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

          {!excelFile && (
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

          {excelFile && error && (
            <p className="text-xs text-red-500">{error}</p>
          )}

          <div>
            <div className="text-xs text-gray-500">
              {excelFile
                ? "Excel uploaded — each row will call Plivo Agent Flow with a 2 second gap between numbers."
                : "Tip: Upload Excel to call multiple numbers, or enter one mobile number above."}
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
                setError("");
                if (f) setMobile("");
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
              {submitting && bulkProgress
                ? `Calling ${bulkProgress.current}/${bulkProgress.total}...`
                : submitting
                  ? "Sending..."
                  : "Send Call"}
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
