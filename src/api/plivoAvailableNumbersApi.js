import service from "./axios";
import { clearUserAssignmentCache } from "./assignedNumbersApi";

export const BUY_NUMBER_BASE_PRICE = 499;
const CGST_RATE = 0.09;
const SGST_RATE = 0.09;

export function calculateBuyNumberPricing(basePrice = BUY_NUMBER_BASE_PRICE) {
  const base = Number(basePrice);
  const cgst = Number((base * CGST_RATE).toFixed(2));
  const sgst = Number((base * SGST_RATE).toFixed(2));
  const totalWithTax = Number((base + cgst + sgst).toFixed(2));
  return { base, cgst, sgst, totalWithTax };
}

/**
 * @typedef {Object} PlivoAvailableNumber
 * @property {string} number
 * @property {string} number_e164
 * @property {string} prefix
 * @property {string} region
 * @property {string} city
 * @property {string} type
 * @property {string} country
 * @property {boolean} voice_enabled
 * @property {boolean} sms_enabled
 * @property {boolean} mms_enabled
 * @property {string} monthly_rental_rate
 * @property {string} setup_rate
 * @property {string} currency
 */

/**
 * @typedef {Object} PlivoAvailableNumbersMeta
 * @property {number} limit
 * @property {number} offset
 * @property {number} total_count
 */

/**
 * @typedef {Object} FetchPlivoAvailableNumbersParams
 * @property {string} [country_iso]
 * @property {string} [type]
 * @property {string} [services]
 * @property {string} [pattern]
 * @property {string} [region]
 * @property {string} [city]
 * @property {number} [limit]
 * @property {number} [offset]
 */

/**
 * Search Plivo inventory for numbers available to rent.
 * GET /api/plivo/available-numbers
 *
 * @param {FetchPlivoAvailableNumbersParams} params
 * @returns {Promise<{ data: PlivoAvailableNumber[]; meta: PlivoAvailableNumbersMeta | null; message: string }>}
 */
export async function fetchPlivoAvailableNumbers(params = {}) {
  const query = {};
  if (params.country_iso) query.country_iso = params.country_iso;
  if (params.type) query.type = params.type;
  if (params.services) query.services = params.services;
  if (params.pattern) query.pattern = params.pattern;
  if (params.region) query.region = params.region;
  if (params.city) query.city = params.city;
  if (params.limit != null) query.limit = params.limit;
  if (params.offset != null) query.offset = params.offset;

  const res = await service.get("plivo/available-numbers", {
    params: query,
    headers: { Accept: "application/json" },
  });

  const body = res?.data ?? {};
  return {
    data: Array.isArray(body.data) ? body.data : [],
    meta: body.meta ?? null,
    message: body.message || "Available numbers retrieved successfully.",
    status: body.status !== false,
  };
}

export function getPlivoAvailableNumbersError(err, fallback = "Failed to load available numbers") {
  const data = err?.response?.data;
  if (data?.message) return String(data.message);
  if (err?.response?.status === 401) return "Session expired. Please log in again.";
  if (err?.response?.status === 502) {
    return data?.message || "Plivo search is temporarily unavailable.";
  }
  return err?.message || fallback;
}

/**
 * Record a Plivo number purchase after successful payment.
 * POST /api/plivo/number-purchases
 */
export async function createPlivoNumberPurchase({
  user_id,
  phone_no,
  amount,
  currency = "INR",
  payment_status = "paid",
  payment_reference,
  notes,
}) {
  const payload = {
    user_id: Number(user_id),
    phone_no: String(phone_no || "").trim(),
    amount: Number(Number(amount).toFixed(2)),
    currency: String(currency || "INR").trim(),
    payment_status: String(payment_status || "paid").trim(),
    payment_reference: String(payment_reference || "").trim(),
  };
  if (notes) payload.notes = String(notes).trim();

  const res = await service.post("plivo/number-purchases", payload, {
    headers: { Accept: "application/json" },
  });

  clearUserAssignmentCache();

  const body = res?.data ?? {};
  return {
    data: body.data ?? body ?? null,
    message: body.message || "Number purchase recorded successfully.",
    status: body.status !== false,
  };
}

/** @deprecated Use createPlivoNumberPurchase */
export async function purchasePlivoNumber(payload) {
  return createPlivoNumberPurchase(payload);
}

/**
 * List Plivo number purchases (paginated).
 * GET /api/plivo/number-purchases
 */
export async function fetchPlivoNumberPurchases(params = {}) {
  const query = {};
  if (params.user_id != null && params.user_id !== "") {
    query.user_id = params.user_id;
  }
  if (params.payment_status) query.payment_status = params.payment_status;
  if (params.per_page != null) query.per_page = params.per_page;
  if (params.page != null) query.page = params.page;

  const res = await service.get("plivo/number-purchases", {
    params: query,
    headers: { Accept: "application/json" },
  });

  const body = res?.data ?? {};
  const data = Array.isArray(body.data)
    ? body.data
    : Array.isArray(body?.data?.data)
      ? body.data.data
      : [];

  const meta =
    body.meta ??
    body?.data?.meta ??
    (body.current_page != null
      ? {
          current_page: body.current_page,
          last_page: body.last_page,
          per_page: body.per_page,
          total: body.total,
        }
      : null);

  return {
    data,
    meta,
    message: body.message || "Number purchases retrieved successfully.",
    status: body.status !== false,
  };
}

export function buildNumberPurchaseNotes(row) {
  if (!row || typeof row !== "object") return "";
  const parts = [row.city, row.region, row.type].filter(Boolean);
  return parts.join(", ");
}

export function getPlivoPurchaseError(err, fallback = "Failed to purchase number") {
  const data = err?.response?.data;
  if (data?.message) return String(data.message);
  if (err?.response?.status === 401) return "Session expired. Please log in again.";
  if (err?.response?.status === 422) return data?.message || "Invalid number or request.";
  if (err?.response?.status === 409) return data?.message || "This number is no longer available.";
  return err?.message || fallback;
}

/** Format E.164 Indian numbers for display, e.g. +918031826527 → +91 80 3182 6527 */
export function formatIndianPhoneDisplay(e164) {
  const raw = String(e164 || "").replace(/\D/g, "");
  if (raw.startsWith("91") && raw.length >= 12) {
    const national = raw.slice(2);
    if (national.length === 10) {
      return `+91 ${national.slice(0, 2)} ${national.slice(2, 6)} ${national.slice(6)}`;
    }
  }
  const withPlus = String(e164 || "").trim();
  return withPlus.startsWith("+") ? withPlus : `+${raw}`;
}
