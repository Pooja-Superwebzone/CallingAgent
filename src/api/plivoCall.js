import Cookies from "js-cookie";
import service from "./axios";
import { resolveCurrentUserAssignment } from "./assignedNumbersApi";

export const PLIVO_AGENT_FLOW_URL =
  "https://agentflow.plivo.com/v1/account/MAZDGWYZRMMZCTYJA2YS/flow/4d00448a-7504-450a-8fae-4f2351a9c203";

export const DEFAULT_PLIVO_FROM_NUMBER = "+918035016814";
export const DEFAULT_PLIVO_KEYWORD = "richa";

export function resolvePlivoKeyword(agent) {
  if (!agent) return DEFAULT_PLIVO_KEYWORD;
  const kw = agent?.keyword ?? agent?.Keyword;
  if (kw && String(kw).trim()) return String(kw).trim().toLowerCase();
  const name = agent?.name ?? agent?.category_name ?? agent?.category;
  if (name && String(name).trim()) return String(name).trim().toLowerCase();
  return DEFAULT_PLIVO_KEYWORD;
}

export async function startPlivoAgentFlowCall({
  keyword,
  phone_number,
  transfer_number,
  assigned_number,
  to_number,
}) {
  const body = {
    keyword,
    phone_number,
  };

  if (transfer_number) body.transfer_number = transfer_number;
  if (assigned_number) body.assigned_number = assigned_number;
  if (to_number) body.to_number = to_number;

  const res = await fetch(PLIVO_AGENT_FLOW_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization:
        "Basic TUFaREdXWVpSTU1aQ1RZSkEyWVM6TmpWaE1UUXpNR1F0TjJNMk5TMDBaak0zTFRka1lXVXRNekEzWXpWag==",
    },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      payload?.message ||
      payload?.error ||
      (typeof payload === "string" ? payload : null) ||
      `Failed to start call (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return payload;
}

/**
 * calls-logs payload:
 * - from_number: assigned caller ID
 * - to_number: number typed/dialed by user (never assigned number)
 * - assigned_number / assigned_number_id / transfer_number: from assignment
 */
function buildCallLogPayload({ typedToNumber, from_number, assignmentContext, plivoResponse }) {
  const resolvedFrom = String(
    from_number ||
      assignmentContext?.from_number ||
      assignmentContext?.assigned_number?.phone_no ||
      DEFAULT_PLIVO_FROM_NUMBER
  ).trim();

  const payload = {
    from_number: resolvedFrom,
    to_number: String(typedToNumber || "").trim(),
  };

  if (assignmentContext?.assigned_number?.phone_no) {
    payload.assigned_number = assignmentContext.assigned_number;
    if (assignmentContext.assigned_number.id != null) {
      payload.assigned_number_id = assignmentContext.assigned_number.id;
    }
  }

  if (assignmentContext?.transfer_number) {
    payload.transfer_number = assignmentContext.transfer_number;
  }

  if (plivoResponse && typeof plivoResponse === "object") {
    if (plivoResponse.call_id) payload.call_id = plivoResponse.call_id;
    if (plivoResponse.request_uuid) payload.request_uuid = plivoResponse.request_uuid;
    if (plivoResponse.flow_id) payload.flow_id = plivoResponse.flow_id;
    if (plivoResponse.status) payload.call_status = plivoResponse.status;
  }

  return payload;
}

export async function createCallLog({
  from_number,
  to_number,
  plivoResponse,
  phone_number,
  assignmentContext,
}) {
  const typedToNumber = to_number || phone_number;
  const payload = buildCallLogPayload({
    typedToNumber,
    from_number,
    assignmentContext,
    plivoResponse,
  });

  const res = await service.post("calls-logs", payload, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${Cookies.get("CallingAgent") || localStorage.getItem("ibcrmtoken") || ""}`,
    },
  });

  return res.data;
}

export async function startBackendCall({ phone, agent }) {
  const token =
    Cookies.get("CallingAgent") || localStorage.getItem("ibcrmtoken") || "";
  try {
    const res = await service.post(
      "start-call",
      {
        phone: String(phone || "").trim(),
        agent: String(agent || "").trim(),
      },
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data;
  } catch (error) {
    const msg =
      error?.response?.data?.message ||
      Object.values(error?.response?.data?.errors || {})[0]?.[0] ||
      error?.message ||
      "Failed to start call";
    throw new Error(msg);
  }
}

export async function startPlivoCallAndLog({
  keyword,
  phone_number,
  from_number = DEFAULT_PLIVO_FROM_NUMBER,
  assignmentContext = null,
  agentUserId = null,
}) {
  const ctx = assignmentContext ?? (await resolveCurrentUserAssignment());
  const typedToNumber = String(phone_number || "").trim();
  const agentKeyword = String(keyword || DEFAULT_PLIVO_KEYWORD).trim();

  // Voice agent has user_id (not null) → backend start-call API
  const hasAgentUserId =
    agentUserId !== null &&
    agentUserId !== undefined &&
    String(agentUserId).trim() !== "" &&
    String(agentUserId).trim().toLowerCase() !== "null";

  if (hasAgentUserId) {
    const startCallResponse = await startBackendCall({
      phone: typedToNumber,
      agent: agentKeyword,
    });
    return {
      plivoResponse: startCallResponse,
      logResponse: null,
      logError: null,
      assignmentContext: ctx,
      usedStartCall: true,
    };
  }

  // Agent user_id is null → Plivo agentflow (+ calls-logs)
  const plivoFromNumber =
    ctx?.from_number ||
    ctx?.assigned_number?.phone_no ||
    DEFAULT_PLIVO_FROM_NUMBER;

  const plivoAssignedNumber = ctx?.assigned_number?.phone_no
    ? ctx.assigned_number
    : { phone_no: plivoFromNumber };

  const plivoResponse = await startPlivoAgentFlowCall({
    keyword: agentKeyword,
    phone_number: typedToNumber,
    transfer_number: ctx?.transfer_number || undefined,
    assigned_number: plivoAssignedNumber,
    to_number: plivoFromNumber,
  });

  let logResponse = null;
  let logError = null;

  try {
    logResponse = await createCallLog({
      from_number: plivoFromNumber || from_number,
      to_number: typedToNumber,
      phone_number: typedToNumber,
      plivoResponse,
      assignmentContext: ctx,
    });
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || "Failed to save call log";
    logError = new Error(msg);
    console.warn("calls-logs API failed after Plivo call:", msg);
  }

  return {
    plivoResponse,
    logResponse,
    logError,
    assignmentContext: ctx,
    usedStartCall: false,
  };
}

export { resolveCurrentUserAssignment };
