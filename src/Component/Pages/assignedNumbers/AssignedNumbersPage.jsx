import React from "react";
import Cookies from "js-cookie";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AssignedPhoneNumbersTab from "./AssignedPhoneNumbersTab";
import UserAssignedNumbersTab from "./UserAssignedNumbersTab";

export const PARAG_ADMIN_EMAIL = "paragshah.devac@gmail.com";

export function canAccessAssignedNumbers() {
  const role = String(Cookies.get("role") || "").trim().toLowerCase();
  const email = String(Cookies.get("email") || "").trim().toLowerCase();
  return role === "admin" && email === PARAG_ADMIN_EMAIL;
}

export default function AssignedNumbersPage() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!canAccessAssignedNumbers()) {
    return <Navigate to="/agents_page" replace />;
  }

  const activeTab =
    location.pathname === "/settings/user-assigned-numbers"
      ? "assignments"
      : "phones";

  const setTab = (tab) => {
    if (tab === "assignments") {
      navigate("/settings/user-assigned-numbers");
    } else {
      navigate("/settings/assigned-numbers");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <h2 className="text-[24px] font-bold tracking-tight text-gray-700 sm:text-3xl">
            Assigned Numbers
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage Plivo caller numbers and user assignments.
          </p>
        </div>

        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setTab("phones")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
              activeTab === "phones"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Phone Numbers
          </button>
          <button
            type="button"
            onClick={() => setTab("assignments")}
            className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
              activeTab === "assignments"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            User Assignments
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          {activeTab === "phones" ? (
            <AssignedPhoneNumbersTab />
          ) : (
            <UserAssignedNumbersTab />
          )}
        </div>
      </div>
    </div>
  );
}
