import React from "react";
import Cookies from "js-cookie";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AssignedPhoneNumbersTab from "./AssignedPhoneNumbersTab";
import UserAssignedNumbersTab from "./UserAssignedNumbersTab";
import BuyNumberTab from "./BuyNumberTab";
import NumberPurchasesTab from "./NumberPurchasesTab";

export const PARAG_ADMIN_EMAIL = "paragshah.devac@gmail.com";

export function isParagAdmin() {
  const role = String(Cookies.get("role") || "").trim().toLowerCase();
  const email = String(Cookies.get("email") || "").trim().toLowerCase();
  return role === "admin" && email === PARAG_ADMIN_EMAIL;
}

export function isAdminUser() {
  const role = String(Cookies.get("role") || "").trim().toLowerCase();
  if (role === "admin") return true;
  return role.split(/[,|/\s]+/).filter(Boolean).includes("admin");
}

/** All admins can open Assigned Numbers; parag vs others see different tabs */
export function canAccessAssignedNumbers() {
  return isAdminUser();
}

export default function AssignedNumbersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const paragAdmin = isParagAdmin();

  if (!canAccessAssignedNumbers()) {
    return <Navigate to="/agents_page" replace />;
  }

  const activeTab = (() => {
    if (location.pathname === "/settings/user-assigned-numbers") return "assignments";
    if (location.pathname === "/settings/buy-number") return "buy";
    if (location.pathname === "/settings/number-purchases") return "purchases";
    return "phones";
  })();

  const setTab = (tab) => {
    if (tab === "assignments") navigate("/settings/user-assigned-numbers");
    else if (tab === "buy") navigate("/settings/buy-number");
    else if (tab === "purchases") navigate("/settings/number-purchases");
    else navigate("/settings/assigned-numbers");
  };

  // Non-parag admin lands on Buy Number by default
  if (!paragAdmin && location.pathname === "/settings/assigned-numbers") {
    return <Navigate to="/settings/buy-number" replace />;
  }
  if (!paragAdmin && location.pathname === "/settings/user-assigned-numbers") {
    return <Navigate to="/settings/buy-number" replace />;
  }
  if (!paragAdmin && location.pathname === "/settings/number-purchases") {
    return <Navigate to="/settings/buy-number" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5">
          <h2 className="text-[24px] font-bold tracking-tight text-gray-700 sm:text-3xl">
            Assigned Numbers
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {paragAdmin
              ? "Manage Plivo caller numbers and user assignments."
              : "Search and select available Plivo numbers to rent."}
          </p>
        </div>

        <div className="mb-6 flex gap-2 border-b border-slate-200">
          {paragAdmin && (
            <>
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
              <button
                type="button"
                onClick={() => setTab("buy")}
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
                  activeTab === "buy"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Buy Number
              </button>
              <button
                type="button"
                onClick={() => setTab("purchases")}
                className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
                  activeTab === "purchases"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Number Purchases
              </button>
            </>
          )}
          {!paragAdmin && (
            <button
              type="button"
              onClick={() => setTab("buy")}
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
                activeTab === "buy"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Buy Number
            </button>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
          {activeTab === "phones" && paragAdmin && (
            <AssignedPhoneNumbersTab onAddNumber={() => setTab("buy")} />
          )}
          {activeTab === "assignments" && paragAdmin && <UserAssignedNumbersTab />}
          {activeTab === "buy" && <BuyNumberTab />}
          {activeTab === "purchases" && paragAdmin && <NumberPurchasesTab />}
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar:
 * - parag admin → Assigned Numbers (/settings/assigned-numbers); Add Number opens Buy Number tab
 * - other admin → Buy Number (/settings/buy-number)
 */
