import React, { useEffect, useState } from "react";
import moment from "moment";
import { getCallLogss, getCallTranscript } from "../../hooks/useAuth";

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
      <h2 className="mb-4 text-2xl font-bold text-gray-700">Call Logs</h2>

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
                      onClick={() => fetchTranscript(log.callId)}
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
    </div>
  );
};

export default CallLogs;
