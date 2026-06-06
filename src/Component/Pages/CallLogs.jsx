import React, { useEffect, useState } from "react";
import moment from "moment";
import { getCallLogss, getCallTranscript } from "../../hooks/useAuth";
import service from "../../api/axios";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

const CallLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [fromEntry, setFromEntry] = useState(0);
  const [toEntry, setToEntry] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);

    getCallLogss(currentPage)
      .then((data) => {
        const pageData = Array.isArray(data?.data) ? data.data : [];
        const formatted = pageData.map((item) => ({
          id: item.id,
          callId: item.call_id,
          from: item.from_number_id,
          to: item.to_number,
          status: item.call_status,
          duration: item.duration,
          time: item.created_at,
        }));

        setLogs(formatted);
        setTotalLogs(Number(data?.total) || 0);
        setFromEntry(Number(data?.from) || 0);
        setToEntry(Number(data?.to) || 0);
        setLastPage(Number(data?.last_page) || 1);
      })
      .catch((err) => {
        console.error("Failed to fetch call logs", err);
        setLogs([]);
        setTotalLogs(0);
        setFromEntry(0);
        setToEntry(0);
        setLastPage(1);
      })
      .finally(() => setLoading(false));
  }, [currentPage]);

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = {};
      if (exportStartDate) params.start_date = exportStartDate;
      if (exportEndDate) params.end_date = exportEndDate;

      const res = await service.get("ai-call/transcripts-export", {
        params,
        responseType: "blob",
        headers: {
          Accept: "text/csv",
        },
      });

      const contentDisposition = res?.headers?.["content-disposition"] || "";
      let filename = "transcripts_export.csv";
      const match = /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i.exec(contentDisposition);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      } else {
        const suffix =
          exportStartDate || exportEndDate
            ? `_${exportStartDate || "all"}_${exportEndDate || "all"}`
            : "_all";
        filename = `transcripts_export${suffix}.csv`;
      }

      const contentType = String(res?.headers?.["content-type"] || "").toLowerCase();
      const isCsv =
        contentType.includes("text/csv") || String(filename).toLowerCase().endsWith(".csv");

      if (isCsv) {
        downloadBlob(res.data, filename);
      } else {
        // API returned XLSX or other binary; convert first sheet to CSV
        const ab = await res.data.arrayBuffer();
        const wb = XLSX.read(ab, { type: "array" });
        const sheetName = wb.SheetNames?.[0];
        const ws = sheetName ? wb.Sheets[sheetName] : null;
        if (!ws) throw new Error("No sheet found in export file");
        const csv = XLSX.utils.sheet_to_csv(ws);
        const csvBlob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const csvName = String(filename).replace(/\.xlsx$/i, ".csv");
        downloadBlob(csvBlob, csvName);
      }

      toast.success("Transcript export downloaded");
      setShowExportModal(false);
    } catch (err) {
      console.error("Transcript export failed:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to export transcripts");
    } finally {
      setExporting(false);
    }
  };

  const fetchTranscript = async (logId) => {
    setTranscriptLoading(true);
    try {
      const data = await getCallTranscript(logId);
      const messages = Array.isArray(data?.data?.messages) ? data.data.messages : [];
      setSelectedTranscript({
        callId: logId,
        transcript: messages.map((m) => ({
          speaker: m?.role || "system",
          text: m?.content || "",
          time: m?.created_at || "",
        })),
      });
    } catch (err) {
      console.error("Transcript fetch failed:", err);
      setSelectedTranscript({
        callId: logId,
        transcript: [{ speaker: "system", text: "Failed to load transcript." }],
      });
    } finally {
      setTranscriptLoading(false);
    }
  };

  if (selectedTranscript) {
    return (
      <div className="w-full">
        <button
          onClick={() => setSelectedTranscript(null)}
          className="mb-4 rounded bg-gray-700 px-4 py-2 text-white hover:bg-gray-900"
        >
          Back to Call Logs
        </button>

        <h2 className="mb-4 text-2xl font-bold text-gray-700">Call Transcript</h2>

        <div className="w-full rounded-xl border bg-white p-4 shadow">
          {transcriptLoading ? (
            <p>Loading transcript...</p>
          ) : selectedTranscript.transcript.length === 0 ? (
            <p>No transcript available</p>
          ) : (
            <div className="max-h-[600px] w-full space-y-3 overflow-y-auto">
              {selectedTranscript.transcript.map((line, i) => (
                <div
                  key={i}
                  className={`flex ${
                    line.speaker === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 shadow ${
                      line.speaker === "user"
                        ? "rounded-br-none bg-blue-600 text-white"
                        : "rounded-bl-none bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="whitespace-pre-line">{line.text}</p>
                    <div className="mt-1 text-right text-xs opacity-75">
                      {line.time && moment(line.time).format("hh:mm A")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-7">
      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-700">Call Logs</h2>
        <button
          type="button"
          onClick={() => setShowExportModal(true)}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
          disabled={exporting}
        >
          {exporting ? "Preparing..." : "Download Transcript"}
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-md">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2">Sr No</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Duration (s)</th>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="py-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-6 text-center">
                  No logs found
                </td>
              </tr>
            ) : (
              logs.map((log, idx) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{fromEntry + idx}</td>
                  <td className="px-4 py-2">{log.to}</td>
                  <td className="px-4 py-2 capitalize">{log.status}</td>
                  <td className="px-4 py-2">{log.duration}</td>
                  <td className="px-4 py-2">
                    {moment(log.time).format("MMM DD, YYYY, hh:mm A")}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => fetchTranscript(log.id)}
                      className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalLogs > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {fromEntry} to {toEntry} of {totalLogs}
          </div>
          <div className="flex items-center gap-2">
            <span>
              Page {currentPage} of {lastPage}
            </span>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={currentPage === lastPage}
              onClick={() =>
                setCurrentPage((page) => Math.min(page + 1, lastPage))
              }
              className="rounded border px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {showExportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={(e) => e.target === e.currentTarget && !exporting && setShowExportModal(false)}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="text-lg font-semibold text-gray-800">Download Transcript</div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={exporting}
              >
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              <div className="text-sm text-gray-600">
                Note: If you do not select Start Date and End Date, it will export all data.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    disabled={exporting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    disabled={exporting}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setExportStartDate("");
                  setExportEndDate("");
                }}
                className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
                disabled={exporting}
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-60"
                disabled={exporting}
              >
                {exporting ? "Downloading..." : "Download"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallLogs;
