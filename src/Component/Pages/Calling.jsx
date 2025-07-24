
import React, { useEffect, useState } from "react";
import moment from "moment";
import { getCallLogs } from "../../hooks/useAuth";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const Calling = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const logsPerPage = 15;

  useEffect(() => {
    getCallLogs()
      .then((res) => {
        const extracted = res?.data || res;
        if (Array.isArray(extracted)) {
          setLogs(extracted);
        } else {
          setLogs([]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch logs", err);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.customer_name?.toLowerCase().includes(term) ||
      log.customer_email?.toLowerCase().includes(term) ||
      log.customer_phone?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderStatus = (value) => {
    return value === 1 ? (
      <FaCheckCircle className="text-green-600 text-xl" />
    ) : (
      <FaTimesCircle className="text-red-500 text-xl" />
    );
  };

  const renderCallDay = (call_day) => {
    if (call_day === null || call_day === undefined) return "-";
    if (call_day === 0) return 1;
    return call_day;
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <h2 className="text-2xl font-bold text-gray-700 text-nowrap">
          Call Logs
        </h2>
        <input
          type="text"
          placeholder="Search by name, email or phone"
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-80"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-md text-gray-700 text-left text-nowrap">
            <tr>
              <th className="px-4 py-2">Sr No.</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Brand</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Call Day</th>
              <th className="px-4 py-2">Call Status</th>
              <th className="px-4 py-2">WhatsApp Status</th>
              <th className="px-4 py-2">Email Status</th>
              <th className="px-4 py-2">Duration (s)</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="text-center py-6 text-nowrap">
                  Loading...
                </td>
              </tr>
            ) : currentLogs.length === 0 ? (
              <tr>
                <td colSpan="12" className="text-center py-6 text-nowrap">
                  No logs found
                </td>
              </tr>
            ) : (
              currentLogs.map((log, index) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-300 text-gray-600 hover:bg-gray-50 text-nowrap"
                >
                  <td className="px-4 py-2">
                    {(currentPage - 1) * logsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-2">
                    <span>{log.customer_name || "-"}</span>{" "}
                    <span className="text-xs italic text-gray-400">
                      ({log.lead_id ? "Automatically" : "Manually"})
                    </span>
                  </td>
                  <td className="px-4 py-2">{log.customer_email || "-"}</td>
                  <td className="px-4 py-2">{log.customer_phone || "-"}</td>
                  <td className="px-4 py-2">{log.brand || "-"}</td>
                  <td className="px-4 py-2">{log.status || "-"}</td>
                  <td className="px-4 py-2">{renderCallDay(log.call_day)}</td>
                  <td className="px-4 py-2">{renderStatus(log.call_status)}</td>
                  <td className="px-4 py-2">{renderStatus(log.wp_status)}</td>
                  <td className="px-4 py-2">{renderStatus(log.email_status)}</td>
                  <td className="px-4 py-2">{log.duration || "-"}</td>
                  <td className="px-4 py-2">
                    {log.lead?.date
                      ? moment(log.lead.date).format("DD/MM/YYYY")
                      : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="text-sm text-nowrap">
            Showing {(currentPage - 1) * logsPerPage + 1} to{" "}
            {Math.min(currentPage * logsPerPage, filteredLogs.length)} of{" "}
            {filteredLogs.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50 text-nowrap"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                className={`px-3 py-1 border rounded text-nowrap ${currentPage === idx + 1
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                  }`}
                onClick={() => goToPage(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}
            <button
              className="px-3 py-1 border rounded disabled:opacity-50 text-nowrap"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calling;
