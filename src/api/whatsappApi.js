import service from "./axios";

function extractError(error, fallback) {
  const data = error.response?.data;
  return data?.message || data?.error || fallback;
}

/** Normalize a raw phone string to E.164 (+91...) */
export function normalizePhone(raw, defaultCountryCode = "91") {
  let phone = String(raw || "").trim().replace(/\s+/g, "");
  phone = phone.replace(/^whatsapp:/i, "");
  if (!phone.startsWith("+")) {
    if (phone.length === 10) {
      phone = `+${defaultCountryCode}${phone}`;
    } else if (!phone.startsWith(defaultCountryCode)) {
      phone = `+${phone}`;
    } else {
      phone = `+${phone}`;
    }
  }
  return phone;
}

export function isValidE164(phone) {
  return /^\+\d{10,15}$/.test(phone);
}

export function encodePhoneForUrl(phone) {
  return encodeURIComponent(normalizePhone(phone));
}

// ─── Inbox ───────────────────────────────────────────────────────────────────

export async function getWhatsappChats() {
  try {
    const res = await service.get("whatsapp/chats");
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch WhatsApp chats."));
  }
}

export async function getWhatsappChatThread(number) {
  try {
    const encoded = encodePhoneForUrl(number);
    const res = await service.get(`whatsapp/chats/${encoded}`);
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch chat history."));
  }
}

export async function sendWhatsappText({ to, message }) {
  try {
    const res = await service.post("twilio/send-message-text", {
      to: normalizePhone(to),
      message,
    });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to send message."));
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

export async function syncPlivoTemplates(status = "APPROVED") {
  try {
    const res = await service.post("plivo/whatsapp/templates/sync", { status });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to sync templates."));
  }
}

export async function getPlivoTemplates({ approvedOnly = true } = {}) {
  try {
    const res = await service.get("plivo/whatsapp/templates", {
      params: { approved_only: approvedOnly ? 1 : 0 },
    });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch templates."));
  }
}

export async function getPlivoTemplate(id) {
  try {
    const res = await service.get(`plivo/whatsapp/templates/${id}`);
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch template."));
  }
}

export async function getPlivoTemplatesLive(status = "APPROVED") {
  try {
    const res = await service.get("plivo/whatsapp/templates/live", {
      params: { status },
    });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to fetch live templates."));
  }
}

export async function createPlivoTemplate(payload) {
  try {
    const res = await service.post("plivo/whatsapp/templates", payload);
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to create template."));
  }
}

// ─── Send ────────────────────────────────────────────────────────────────────

export async function sendWhatsappTemplate({ phone, template_id }) {
  try {
    const res = await service.post("plivo/whatsapp/send-template", {
      phone: normalizePhone(phone),
      template_id: String(template_id),
    });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Failed to send template message."));
  }
}

export async function sendWhatsappBulkExcel(formData) {
  try {
    const res = await service.post("plivo/whatsapp/send-excel", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw new Error(extractError(error, "Bulk send failed."));
  }
}
