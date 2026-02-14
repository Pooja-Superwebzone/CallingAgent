import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import service from "../../api/axios";

export default function CertificatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0 });

  useEffect(() => {
    const fetchExamResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get email from cookie
        const email = Cookies.get("email");

        // Check if email matches the required email
        if (email !== "paragshah.devac@gmail.com") {
          setError("Access denied. This page is only available for authorized users.");
          setLoading(false);
          return;
        }

        // Step 1: Login API call
        console.log("Step 1: Calling login API with email:", email);
        const loginResponse = await service.post("login", {
          email: email,
          password: "12345678"
        });

        console.log("Login response:", loginResponse.data);

        // Store token if received
        if (loginResponse.data?.token) {
          Cookies.set("CallingAgent", loginResponse.data.token, {
            expires: 365,
            secure: true,
            sameSite: "Strict",
          });
          localStorage.setItem("ibcrmtoken", loginResponse.data.token);
        }

        // Step 2: Call exam-results API
        console.log("Step 2: Calling exam-results API");
        const examResultsResponse = await service.get("exam-results");

        // Console.log the data
        console.log("Exam Results Data:", examResultsResponse.data);

        // Store the data
        if (examResultsResponse.data?.data && Array.isArray(examResultsResponse.data.data)) {
          setExamResults(examResultsResponse.data.data);
          setSummary({
            total: examResultsResponse.data.total || examResultsResponse.data.data.length,
            passed: examResultsResponse.data.passed || 0,
            failed: examResultsResponse.data.failed || 0
          });
        }

      } catch (err) {
        console.error("Error fetching exam results:", err);
        setError(err.response?.data?.message || "Failed to fetch exam results. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchExamResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-12">
        <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-slate-600">Loading certificate data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 px-6 py-12">
        <div className="mx-auto max-w-7xl flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-4 text-red-700 max-w-md">
              <p className="font-semibold mb-2">Error</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => navigate("/sendcall")}
                className="mt-4 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/sendcall")}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              aria-label="Go back to dashboard"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Exam Results & Certificates
              </h1>
              <p className="text-slate-600 mt-1">
                View all exam attempts and results
              </p>
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Attempts</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{summary.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Passed</p>
                <p className="text-3xl font-bold text-emerald-900 mt-1">{summary.passed}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Failed</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{summary.failed}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Results Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Exam Results</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">User Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Attempt</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Exam Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {examResults.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      No exam results found
                    </td>
                  </tr>
                ) : (
                  examResults.map((result) => (
                    <tr key={result.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        #{result.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {result.user_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {result.user_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                        {result.marks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          result.status === "1" || result.status_text === "Passed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {result.status_text || (result.status === "1" ? "Passed" : "Failed")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        Attempt #{result.attempt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {formatDate(result.exam_date || result.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

