import Cookies from "js-cookie";
import service from "./axios";

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

export async function startPlivoAgentFlowCall({ keyword, phone_number }) {
  const res = await fetch(PLIVO_AGENT_FLOW_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      keyword,
      phone_number,
    }),
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

function buildCallLogPayload(plivoResponse, phone_number, from_number) {
  const to_number =
    plivoResponse?.to_number ||
    plivoResponse?.phone_number ||
    plivoResponse?.to ||
    phone_number;

  const resolvedFrom =
    plivoResponse?.from_number ||
    plivoResponse?.from ||
    from_number ||
    DEFAULT_PLIVO_FROM_NUMBER;

  const payload = {
    from_number: resolvedFrom,
    to_number,
  };

  if (plivoResponse && typeof plivoResponse === "object") {
    if (plivoResponse.call_id) payload.call_id = plivoResponse.call_id;
    if (plivoResponse.request_uuid) payload.request_uuid = plivoResponse.request_uuid;
    if (plivoResponse.flow_id) payload.flow_id = plivoResponse.flow_id;
    if (plivoResponse.status) payload.call_status = plivoResponse.status;
  }

  return payload;
}

export async function createCallLog({ from_number, to_number, plivoResponse, phone_number }) {
  const payload = buildCallLogPayload(plivoResponse, to_number || phone_number, from_number);

  const res = await service.post("calls-logs", payload, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${Cookies.get("CallingAgent") || localStorage.getItem("ibcrmtoken") || ""}`,
    },
  });

  return res.data;
}

export async function startPlivoCallAndLog({
  keyword,
  phone_number,
  from_number = DEFAULT_PLIVO_FROM_NUMBER,
}) {
  const plivoResponse = await startPlivoAgentFlowCall({ keyword, phone_number });

  let logResponse = null;
  let logError = null;

  try {
    logResponse = await createCallLog({
      from_number,
      to_number: phone_number,
      phone_number,
      plivoResponse,
    });
  } catch (err) {
    logError = err;
    const msg = err?.response?.data?.message || err?.message || "Failed to save call log";
    logError = new Error(msg);
    console.warn("calls-logs API failed after Plivo call:", msg);
  }

  return { plivoResponse, logResponse, logError };
}
