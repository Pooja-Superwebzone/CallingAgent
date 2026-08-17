import Cookies from "js-cookie";
import service from "./axios";

/**
 * @template T
 * @typedef {{ status?: boolean; message?: string; data: T }} ApiResponse
 */

/**
 * @typedef {{ id: number; phone_no: string; created_at: string; updated_at: string }} AssignedNumber
 */

/**
 * @typedef {{ id: number; user_id: number; transfer_number: string; assigned_number_id: number; created_at: string; updated_at: string; user?: { id: number; name: string; email: string; contact_no: string | null }; assigned_number?: { id: number; phone_no: string } }} UserAssignedNumber
 */

/**
 * @typedef {{ user_id: number; transfer_number: string; assigned_number_id: number }} UserAssignedNumberPayload
 */

/** Default Plivo caller ID when admin has no assigned number */
export const DEFAULT_ASSIGNED_PHONE = "+918035016814";

function unwrapList(res) {
  const body = res?.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
}

function unwrapOne(res) {
  const body = res?.data;
  return body?.data ?? body ?? null;
}

function unwrapMessage(res) {
  return res?.data?.message || "Success";
}

function isAdminRole() {
  const role = String(Cookies.get("role") || "").trim().toLowerCase();
  if (!role) return false;
  if (role === "admin") return true;
  // e.g. "admin,channelpartner" / "admin|sales" / admin with another role
  return role.split(/[,|/\s]+/).filter(Boolean).includes("admin");
}

function profileTransferNumber(profile) {
  return normalizePhoneInput(
    profile?.contact_no ??
      profile?.phone_no ??
      profile?.mobile ??
      profile?.transfer_number ??
      ""
  );
}

// --- Assigned Numbers (Module 1) ---

export async function getAssignedNumbers(phoneNo) {
  const params = phoneNo ? { phone_no: String(phoneNo).trim() } : undefined;
  const res = await service.get("assigned-numbers", { params });
  return { data: unwrapList(res), message: unwrapMessage(res) };
}

export async function getAssignedNumber(id) {
  const res = await service.get(`assigned-numbers/${id}`);
  return { data: unwrapOne(res), message: unwrapMessage(res) };
}

export async function createAssignedNumber(phone_no) {
  const res = await service.post("assigned-numbers", { phone_no });
  return { data: unwrapOne(res), message: unwrapMessage(res) };
}

export async function updateAssignedNumber(id, phone_no) {
  const res = await service.put(`assigned-numbers/${id}`, { phone_no });
  return { data: unwrapOne(res), message: unwrapMessage(res) };
}

export async function deleteAssignedNumber(id) {
  const res = await service.delete(`assigned-numbers/${id}`);
  return { message: unwrapMessage(res) };
}

// --- User Assigned Numbers (Module 2) ---

export async function getUserAssignedNumbers(params = {}) {
  const query = {};
  if (params.user_id) query.user_id = params.user_id;
  if (params.assigned_number_id) query.assigned_number_id = params.assigned_number_id;
  const res = await service.get("user-assigned-numbers", { params: query });
  return { data: unwrapList(res), message: unwrapMessage(res) };
}

export async function getUserAssignedNumber(id) {
  const res = await service.get(`user-assigned-numbers/${id}`);
  return { data: unwrapOne(res), message: unwrapMessage(res) };
}

export async function createUserAssignedNumber(payload) {
  const res = await service.post("user-assigned-numbers", payload);
  return { data: unwrapOne(res), message: unwrapMessage(res) };
}

export async function updateUserAssignedNumber(id, payload) {
  const res = await service.put(`user-assigned-numbers/${id}`, payload);
  return { data: unwrapOne(res), message: unwrapMessage(res) };
}

export async function deleteUserAssignedNumber(id) {
  const res = await service.delete(`user-assigned-numbers/${id}`);
  return { message: unwrapMessage(res) };
}

/**
 * Resolve Plivo call context for the logged-in user from user-assigned-numbers.
 * Matches assignment by Profile user id (all roles).
 * Admin (incl. admin with another role) with no assigned number:
 * - from/assigned defaults to +918035016814
 * - transfer_number from Profile contact
 */
let assignmentCache = { at: 0, value: undefined };

export async function resolveCurrentUserAssignment() {
  const now = Date.now();
  if (assignmentCache.at && now - assignmentCache.at < 60_000) {
    return assignmentCache.value;
  }

  const profileRes = await service.get("Profile");
  const profile = profileRes?.data?.data || profileRes?.data || {};
  const userId =
    profile?.id ??
    profile?.user_id ??
    profile?.twilio_create_id ??
    null;

  const transferFromProfile = profileTransferNumber(profile);

  if (!userId) {
    if (isAdminRole()) {
      const fallback = {
        user_id: null,
        transfer_number: transferFromProfile,
        assigned_number: { id: null, phone_no: DEFAULT_ASSIGNED_PHONE },
        from_number: DEFAULT_ASSIGNED_PHONE,
        is_default_assigned: true,
      };
      assignmentCache = { at: now, value: fallback };
      return fallback;
    }
    assignmentCache = { at: now, value: null };
    return null;
  }

  let assignment = null;
  try {
    const res = await getUserAssignedNumbers({ user_id: Number(userId) });
    const list = Array.isArray(res.data) ? res.data : [];
    assignment =
      list.find((row) => Number(row.user_id) === Number(userId)) || list[0] || null;
  } catch (err) {
    console.warn("Could not load user-assigned-numbers:", err);
    assignment = null;
  }

  const assignedNumber = assignment?.assigned_number || {};
  const phoneNo = String(assignedNumber.phone_no || "").trim();

  if (phoneNo) {
    const result = {
      user_id: Number(userId),
      transfer_number:
        String(assignment.transfer_number || "").trim() || transferFromProfile,
      assigned_number: {
        id: assignedNumber.id ?? assignment.assigned_number_id,
        phone_no: phoneNo,
      },
      from_number: phoneNo,
      is_default_assigned: false,
    };
    assignmentCache = { at: now, value: result };
    return result;
  }

  // No assigned number: admin (or admin with another role) uses default Plivo number
  if (isAdminRole()) {
    const fallback = {
      user_id: Number(userId),
      transfer_number: transferFromProfile,
      assigned_number: { id: null, phone_no: DEFAULT_ASSIGNED_PHONE },
      from_number: DEFAULT_ASSIGNED_PHONE,
      is_default_assigned: true,
    };
    assignmentCache = { at: now, value: fallback };
    return fallback;
  }

  assignmentCache = { at: now, value: null };
  return null;
}

export function clearUserAssignmentCache() {
  assignmentCache = { at: 0, value: undefined };
}

export function getApiErrorMessage(err, fallback = "Request failed") {
  const data = err?.response?.data;
  if (data?.message) return String(data.message);
  const errors = data?.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
    if (typeof first === "string") return first;
  }
  if (err?.response?.status === 404) return "Record not found";
  if (err?.response?.status === 422) return data?.message || "Validation failed";
  return err?.message || fallback;
}

export function normalizePhoneInput(value) {
  let v = String(value || "").trim();
  if (!v) return v;
  const digits = v.replace(/\D/g, "");
  if (/^\d{10}$/.test(digits) && !v.startsWith("+")) {
    return `+91${digits}`;
  }
  if (/^91\d{10}$/.test(digits) && !v.startsWith("+")) {
    return `+${digits}`;
  }
  return v;
}

export function validatePhoneNo(value) {
  const v = String(value || "").trim();
  if (!v) return "Phone number is required";
  if (v.length > 32) return "Phone number must be at most 32 characters";
  return "";
}
