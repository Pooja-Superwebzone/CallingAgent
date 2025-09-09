import React, { useEffect, useState } from "react";
import moment from "moment";
import { getCallLogs } from "../../hooks/useAuth";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import * as XLSX from "xlsx";

const Calling = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); 
  const logsPerPage = 15;

  useEffect(() => {
    setLoading(true);
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
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      String(log.customer_name || "").toLowerCase().includes(term) ||
      String(log.customer_email || "").toLowerCase().includes(term) ||
      String(log.customer_phone || "").toLowerCase().includes(term)
    );
  });

  
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));
  const currentLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderStatus = (value) =>
    value === "1" ? (
      <FaCheckCircle className="text-green-600 text-xl" />
    ) : (
      <FaTimesCircle className="text-red-500 text-xl" />
    );

  const renderCallDay = (call_day) => {
    if (call_day === null || call_day === undefined) return "-";
    if (call_day === 0) return 1;
    return call_day;
  };

  
  const downloadExcel = () => {
    
    let exportLogs = [...filteredLogs];

    
    if (filter === "accepted") {
      exportLogs = exportLogs.filter((l) => String(l.call_status) === "1");
    } else if (filter === "rejected") {
      exportLogs = exportLogs.filter((l) => String(l.call_status) !== "1");
    }

    

    if (!exportLogs || exportLogs.length === 0) {
      alert("No records found for the selected filter / page.");
      return;
    }


    const exportData = exportLogs.map((log) => ({
      "Full Name": log.customer_name || "-",
      Email: log.customer_email || "-",
      Phone: log.customer_phone || "-",
      wp_status: log.wp_status ?? "-",
      status: log.status ?? "-",
      email_status: log.email_status ?? "-",
      duration: log.duration ?? "-",
    }));


    const worksheet = XLSX.utils.json_to_sheet(exportData, { header: [
      "Full Name", "Email", "Phone", "wp_status", "status", "email_status", "duration"
    ]});
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Call Logs");

    try {
      const maxWidths = [];
      const sheetRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      sheetRows.forEach((row) => {
        row.forEach((cell, idx) => {
          const len = cell ? String(cell).length : 0;
          maxWidths[idx] = Math.max(maxWidths[idx] || 10, len + 2);
        });
      });
      worksheet["!cols"] = maxWidths.map((w) => ({ wch: w }));
    } catch (e) {

    }

    
    XLSX.writeFile(workbook, "call_logs.xlsx");
  };

  return (
    <div className="p-4 sm:p-6">
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <h2 className="text-2xl font-bold text-gray-700 text-nowrap">Call Logs</h2>

        <div className="flex gap-3 w-full md:w-auto flex-wrap items-center">
          <input
            type="text"
            placeholder="Search by name, email or phone"
            className="border border-gray-300 rounded px-4 py-2 flex-grow md:w-80"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            className="border border-gray-300 rounded px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter calls"
          >
            <option value="all">All Calls</option>
            <option value="accepted">Accepted Calls</option>
            <option value="rejected">Rejected Calls</option>
          </select>


          <button
            onClick={downloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Download Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-md text-gray-700 text-left">
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
                <td colSpan={12} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : currentLogs.length === 0 ? (
              <tr>
                <td colSpan={12} className="text-center py-6">
                  No logs found
                </td>
              </tr>
            ) : (
              currentLogs.map((log, idx) => (
                <tr
                  key={log.id ?? `${idx}-${log.customer_phone}`}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-2">
                    {(currentPage - 1) * logsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-2">
                    <div>{log.customer_name || "-"}</div>
                    <div className="text-xs italic text-gray-400">
                      {log.lead_id ? "Automatically" : "Manually"}
                    </div>
                  </td>
                  <td className="px-4 py-2">{log.customer_email || "-"}</td>
                  <td className="px-4 py-2">{log.customer_phone || "-"}</td>
                  <td className="px-4 py-2">{log.brand || "-"}</td>
                  <td className="px-4 py-2">{log.status ?? "-"}</td>
                  <td className="px-4 py-2">{renderCallDay(log.call_day)}</td>
                  <td className="px-4 py-2">{renderStatus(String(log.call_status))}</td>
                  <td className="px-4 py-2">{renderStatus(String(log.wp_status))}</td>
                  <td className="px-4 py-2">{renderStatus(String(log.email_status))}</td>
                  <td className="px-4 py-2">{log.duration ?? "-"}</td>
                  <td className="px-4 py-2">
                    {log.lead?.date ? moment(log.lead.date).format("DD/MM/YYYY") : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="text-sm">
            Showing {(currentPage - 1) * logsPerPage + 1} to{" "}
            {Math.min(currentPage * logsPerPage, filteredLogs.length)} of{" "}
            {filteredLogs.length} results
          </div>

          <div className="flex items-center space-x-1">
            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <button
              className={`px-3 py-1 border rounded ${currentPage === 1 ? "bg-blue-500 text-white" : ""}`}
              onClick={() => goToPage(1)}
            >
              1
            </button>

            {currentPage > 3 && <span className="px-2">...</span>}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page !== 1 && page !== totalPages && Math.abs(currentPage - page) <= 1)
              .map((page) => (
                <button
                  key={page}
                  className={`px-3 py-1 border rounded ${currentPage === page ? "bg-blue-500 text-white" : ""}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              ))}

            {currentPage < totalPages - 2 && <span className="px-2">...</span>}

            {totalPages > 1 && (
              <button
                className={`px-3 py-1 border rounded ${currentPage === totalPages ? "bg-blue-500 text-white" : ""}`}
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </button>
            )}

            <button
              className="px-3 py-1 border rounded disabled:opacity-50"
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
