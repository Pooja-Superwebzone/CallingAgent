import service from "./axios";

function unwrapList(res) {
  const body = res?.data ?? {};
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body)) return body;
  return [];
}

export function getSalespersonAgentsError(err, fallback = "Request failed") {
  const data = err?.response?.data;
  if (data?.message) return String(data.message);
  if (err?.response?.status === 401) return "Session expired. Please log in again.";
  return err?.message || fallback;
}

function normalizeBreakdownTitle(title) {
  return String(title || "").trim().toLowerCase();
}

/** Body/FAQ from voice agent record (agents_page-style body field). */
export function getVoiceAgentBody(agent) {
  if (!agent || typeof agent !== "object") return "";

  const direct = agent.body ?? agent.faq;
  if (direct != null && String(direct).trim()) return String(direct);

  const breakdown = agent.context_breakdown;
  if (!Array.isArray(breakdown) || breakdown.length === 0) return "";

  const faqEntry = breakdown.find((item) =>
    normalizeBreakdownTitle(item?.title).includes("faq")
  );
  if (faqEntry?.body != null && String(faqEntry.body).trim()) {
    return String(faqEntry.body);
  }

  const enabledBodies = breakdown
    .filter((item) => item?.is_enabled !== false && item?.body != null && String(item.body).trim())
    .map((item) => String(item.body));
  if (enabledBodies.length) return enabledBodies.join("\n\n");

  const first = breakdown.find((item) => item?.body != null && String(item.body).trim());
  return first?.body != null ? String(first.body) : "";
}

function normalizeMatchText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function stripHtmlForMatch(value) {
  const s = String(value || "");
  if (!s.includes("<")) return s;
  try {
    const doc = new DOMParser().parseFromString(s, "text/html");
    return doc.body?.textContent || "";
  } catch {
    return s.replace(/<[^>]+>/g, " ");
  }
}

function pickBestCrmMatch(matches = []) {
  if (!matches.length) return null;
  return [...matches].sort((a, b) => Number(b?.id ?? 0) - Number(a?.id ?? 0))[0];
}

function getAgentsUpdateId(crmAgent) {
  if (!crmAgent || typeof crmAgent !== "object") return "";
  const id = crmAgent.agent_id ?? crmAgent.agentId;
  return id != null && String(id).trim() ? String(id).trim() : "";
}

/** Plain FAQ text → HTML for CKEditor / agents-update body */
export function ensureHtmlBody(body) {
  const s = String(body || "").trim();
  if (!s) return "<p></p>";
  if (s.includes("<")) return s;
  return s
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Linked CRM agent row from GET /api/agents for a voice-perplexity agent */
export function findCrmAgentForVoiceAgent(voiceAgent, crmAgents = [], voiceAgentId = "") {
  if (!voiceAgent || typeof voiceAgent !== "object") return null;

  const list = Array.isArray(crmAgents) ? crmAgents : [];
  const vpId = String(voiceAgentId || voiceAgent.id || "").trim();

  if (vpId) {
    const byVoiceId = list.filter(
      (item) => String(item?.voice_perplexity_agent_id ?? "") === vpId
    );
    const best = pickBestCrmMatch(byVoiceId);
    if (best) return best;
  }

  const linkedId = voiceAgent.crm_agent_id ?? voiceAgent.crmAgentId;
  if (linkedId != null && String(linkedId).trim()) {
    const linked = String(linkedId).trim();
    const byLinked = list.filter(
      (item) =>
        String(item?.id ?? "") === linked ||
        String(item?.agent_id ?? item?.agentId ?? "") === linked
    );
    const best = pickBestCrmMatch(byLinked);
    if (best) return best;
  }

  const nested = voiceAgent.crm_agent ?? voiceAgent.crmAgent ?? voiceAgent.agent;
  if (nested && typeof nested === "object") {
    const nestedAgentId = getAgentsUpdateId(nested);
    if (nestedAgentId) {
      const byNested = list.filter(
        (item) => String(item?.agent_id ?? item?.agentId ?? "") === nestedAgentId
      );
      const best = pickBestCrmMatch(byNested);
      if (best) return best;
    }
  }

  const voiceName = normalizeMatchText(voiceAgent.name);
  const voiceKeyword = normalizeMatchText(voiceAgent.keyword);
  const voiceWelcome = normalizeMatchText(
    voiceAgent.opening_message ?? voiceAgent.welcome_message
  );

  if (voiceName) {
    const exact = list.filter((item) => normalizeMatchText(item?.name) === voiceName);
    const bestExact = pickBestCrmMatch(exact);
    if (bestExact) return bestExact;

    const partial = list.filter((item) => {
      const crmName = normalizeMatchText(item?.name);
      return (
        crmName.includes(voiceName) ||
        (voiceName.length >= 4 && voiceName.includes(crmName))
      );
    });
    const bestPartial = pickBestCrmMatch(partial);
    if (bestPartial) return bestPartial;
  }

  if (voiceKeyword) {
    const byKeyword = list.filter((item) => {
      const crmKeyword = normalizeMatchText(item?.keyword);
      const crmName = normalizeMatchText(item?.name);
      return (
        crmKeyword === voiceKeyword ||
        crmName === voiceKeyword ||
        crmName.includes(voiceKeyword) ||
        crmKeyword.includes(voiceKeyword)
      );
    });
    const best = pickBestCrmMatch(byKeyword);
    if (best) return best;
  }

  if (voiceWelcome) {
    const byWelcome = list.filter(
      (item) =>
        normalizeMatchText(item?.welcome_message ?? item?.welcomeMessage) ===
        voiceWelcome
    );
    const best = pickBestCrmMatch(byWelcome);
    if (best) return best;
  }

  const voiceBodySnippet = normalizeMatchText(
    stripHtmlForMatch(getVoiceAgentBody(voiceAgent))
  ).slice(0, 160);
  if (voiceBodySnippet.length >= 40) {
    const byBody = list.filter((item) => {
      const crmBodySnippet = normalizeMatchText(
        stripHtmlForMatch(item?.body || "")
      ).slice(0, 160);
      if (crmBodySnippet.length < 40) return false;
      return (
        crmBodySnippet.startsWith(voiceBodySnippet.slice(0, 40)) ||
        voiceBodySnippet.startsWith(crmBodySnippet.slice(0, 40))
      );
    });
    const best = pickBestCrmMatch(byBody);
    if (best) return best;
  }

  return null;
}

/** agent_id value for POST /api/agents-update */
export function resolveCrmAgentId(voiceAgent, crmAgents = [], voiceAgentId = "") {
  const crmAgent = findCrmAgentForVoiceAgent(voiceAgent, crmAgents, voiceAgentId);
  return getAgentsUpdateId(crmAgent);
}

/**
 * GET /api/voice-perplexity-agents
 */
export async function fetchVoiceAgents(params = {}) {
  const res = await service.get("voice-perplexity-agents", {
    params,
    headers: { Accept: "application/json" },
  });
  const body = res?.data ?? {};
  return {
    data: unwrapList(res),
    message: body.message || "Voice agents retrieved successfully.",
    status: body.status !== false,
  };
}

/**
 * GET /api/salespersons
 */
export async function fetchSalespersons(params = {}) {
  const query = {};
  if (params.admin_id != null && params.admin_id !== "") {
    query.admin_id = params.admin_id;
  }
  if (params.search) query.search = params.search;

  const res = await service.get("salespersons", {
    params: query,
    headers: { Accept: "application/json" },
  });

  const body = res?.data ?? {};
  return {
    data: unwrapList(res),
    message: body.message || "Salespersons retrieved successfully.",
    status: body.status !== false,
  };
}

/**
 * GET /api/voice-perplexity-agents/salesperson
 */
export async function fetchSalespersonVoiceAgents(params = {}) {
  const query = {};
  if (params.user_id != null && params.user_id !== "") {
    query.user_id = params.user_id;
  }
  if (params.admin_id != null && params.admin_id !== "") {
    query.admin_id = params.admin_id;
  }
  if (params.search) query.search = params.search;
  if (params.keyword) query.keyword = params.keyword;
  if (params.include_inactive) query.include_inactive = "1";

  const res = await service.get("voice-perplexity-agents/salesperson", {
    params: query,
    headers: { Accept: "application/json" },
  });

  const body = res?.data ?? {};
  return {
    data: unwrapList(res),
    message: body.message || "Salesperson voice agents retrieved successfully.",
    status: body.status !== false,
  };
}

/**
 * GET /api/voice-perplexity-agents/{id}
 */
export async function fetchVoiceAgentById(id) {
  const res = await service.get(`voice-perplexity-agents/${id}`, {
    headers: { Accept: "application/json" },
  });
  const body = res?.data ?? {};
  return {
    data: body.data ?? body ?? null,
    message: body.message || "Voice agent retrieved successfully.",
    status: body.status !== false,
  };
}

/**
 * PUT /api/voice-perplexity-agents/{id}
 */
export async function updateVoiceAgent(id, payload) {
  const res = await service.put(`voice-perplexity-agents/${id}`, payload, {
    headers: { Accept: "application/json" },
  });
  const body = res?.data ?? {};
  return {
    data: body.data ?? body ?? null,
    message: body.message || "Voice agent updated successfully.",
    status: body.status !== false,
  };
}
