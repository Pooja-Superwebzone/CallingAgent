import React, { useEffect, useState } from "react";
import moment from "moment";
import { getCallLogss, getCallTranscript } from "../../hooks/useAuth";

const CallLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  useEffect(() => {
    getCallLogss()
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map((item) => ({
            id: item.id,
            callId: item.call_id,
            from: item.from_number_id,
            to: item.to_number,
            status: item.call_status,
            duration: item.duration,
            time: item.created_at,
          }));
          setLogs(formatted);
        }
      })
      .catch((err) => console.error("Failed to fetch call logs", err))
      .finally(() => setLoading(false));
  }, []);

  const fetchTranscript = async (callId) => {
    setTranscriptLoading(true);
    try {
      const data = await getCallTranscript(callId);
      setSelectedTranscript({
        callId,
        transcript: data.transcript || [],
      });
    } catch (err) {
      console.error("Transcript fetch failed:", err);
      setSelectedTranscript({
        callId,
        transcript: [{ speaker: "system", text: "Failed to load transcript." }],
      });
    } finally {
      setTranscriptLoading(false);
    }
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  if (selectedTranscript) {
    return (
      <div className="w-100%">
        <button
          onClick={() => setSelectedTranscript(null)}
          className="mb-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900"
        >
          ← Back to Call Logs
        </button>

        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Call Transcript
        </h2>

        {/* Full width chat container */}
        <div className="border rounded-xl shadow bg-white p-4 w-full">
          {transcriptLoading ? (
            <p>Loading transcript...</p>
          ) : selectedTranscript.transcript.length === 0 ? (
            <p>No transcript available</p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto w-full">
              {selectedTranscript.transcript.map((line, i) => (
                <div
                  key={i}
                  className={`flex ${
                    line.speaker === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg shadow ${
                      line.speaker === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-line">{line.text}</p>
                    <div className="text-xs opacity-75 mt-1 text-right">
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

  // Default: Call logs table
  return (
    <div className="p-7 w-full">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Call Logs</h2>

      <div className="overflow-x-auto rounded-xl shadow w-full">
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
                <td colSpan="6" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : currentLogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6">
                  No logs found
                </td>
              </tr>
            ) : (
              currentLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{indexOfFirstLog + idx + 1}</td>
                  <td className="px-4 py-2">{log.to}</td>
                  <td className="px-4 py-2 capitalize">{log.status}</td>
                  <td className="px-4 py-2">{log.duration}</td>
                  <td className="px-4 py-2">
                    {moment(log.time).format("MMM DD, YYYY, hh:mm A")}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => fetchTranscript(log.callId)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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

      {/* Pagination */}
      {!loading && logs.length > 0 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <div>
            Showing {indexOfFirstLog + 1} to{" "}
            {Math.min(indexOfLastLog, logs.length)} of {logs.length}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallLogs;
