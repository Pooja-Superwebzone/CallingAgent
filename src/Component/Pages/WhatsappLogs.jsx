
import React, { useEffect, useState } from "react";
import moment from "moment";
import { getWhatsappLogs } from "../../hooks/useAuth";

const WhatsappLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 15;

  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getWhatsappLogs()
      .then((data) => {
        const formatted = [];

        if (Array.isArray(data)) {
          data.forEach((item) => {
            const payloads = item?.payloads || [];
            payloads.forEach((payload, index) => {
              const fp = payload?.full_payload || {};
              formatted.push({
                id: `${item.call_sid}_${index}`,
                from: fp?.From || "-",
                to: fp?.To || "-",
                status: (fp?.MessageStatus || "-").toLowerCase(),
                time: payload?.timestamp || "-",
              });
            });
          });
        }

        setLogs(formatted);
      })
      .catch((err) => console.error("Failed to fetch logs", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs =
    statusFilter === "all"
      ? logs
      : logs.filter((log) => log.status === statusFilter);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <div className="p-7">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <h2 className="text-2xl font-bold text-gray-700">WhatsApp Logs</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="sent">Sent</option>
          <option value="delivered">Delivered</option>
          <option value="undelivered">Undelivered</option>
          <option value="read">Read</option>
        </select>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-md">
          <thead className="bg-gray-100 text-left text-gray-600">
            <tr>
              <th className="px-4 py-2 text-nowrap">Sr No.</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : currentLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  No logs found
                </td>
              </tr>
            ) : (
              currentLogs.map((log, index) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{indexOfFirstLog + index + 1}</td>
                  <td className="px-4 py-2">{log.from}</td>
                  <td className="px-4 py-2">{log.to}</td>
                  <td className="px-4 py-2 capitalize">{log.status}</td>
                  <td className="px-4 py-2 text-nowrap">
                    {moment(log.time).format("MMM DD, YYYY, hh:mm A")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {/* {!loading && filteredLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstLog + 1} to{" "}
            {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
            {filteredLogs.length} results
          </div>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 border rounded ${currentPage === idx + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white"
                  }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )} */}
      {/* Pagination */}
{!loading && filteredLogs.length > 0 && (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4">
    <div className="text-sm text-gray-600">
      Showing {indexOfFirstLog + 1} to{" "}
      {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
      {filteredLogs.length} results
    </div>

    <div className="flex items-center flex-wrap gap-1">
      {/* Prev Button */}
      <button
        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        Prev
      </button>

      {/* First Page */}
      <button
        className={`px-3 py-1 border rounded ${currentPage === 1 ? "bg-blue-600 text-white" : ""}`}
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>

      {/* Left dots */}
      {currentPage > 3 && <span className="px-2">...</span>}

      {/* Pages near current */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(
          (page) =>
            page !== 1 &&
            page !== totalPages &&
            Math.abs(currentPage - page) <= 1
        )
        .map((page) => (
          <button
            key={page}
            className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-600 text-white" : ""}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

      {/* Right dots */}
      {currentPage < totalPages - 2 && <span className="px-2">...</span>}

      {/* Last Page */}
      {totalPages > 1 && (
        <button
          className={`px-3 py-1 border rounded ${currentPage === totalPages ? "bg-blue-600 text-white" : ""}`}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      )}

      {/* Next Button */}
      <button
        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
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

export default WhatsappLogs;
