import Cookies from "js-cookie";
import service from "../api/axios";

export function login(formData) {
  return service
    .post(`login`, formData)
    .then((res) => {
      const data = res.data;

      if (data) {
        Cookies.set("CallingAgent", data?.token, {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });

        Cookies.set("role", data?.data?.role, {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });

        // ✅ Set twilio_user cookie properly
        Cookies.set("twilio_user", String(data?.data?.twilio_user || "0"), {
          expires: 365,
          secure: true,
          sameSite: "Strict",
        });
      }

      return res.data;
    })
    .catch((error) => {
      let errorMessage = "Failed to login";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      throw new Error(errorMessage);
    });
}



export function getWhatsappLogs() {
  return service
    .get("twillio-wplogs")
    .then((res) => res.data)
    .catch((error) => {
      let errorMessage = "Failed to fetch WhatsApp logs";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}

export function getCallLogs() {
  return service
    .get("twillio-leads")
    .then((res) => res.data)
    .catch((error) => {
      let errorMessage = "Failed to fetch Call Logs";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}

export function sendManualCall(payload) {
  return service
    .post("twillio-send-manual-call", payload)
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ Call API failed:", error);
      let errorMessage = "Failed to send manual call.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}



export function getWhatsappChats() {
  return service
    .get("whatsapp/chats")
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ Failed to fetch WhatsApp chats:", error);
      let errorMessage = "Failed to fetch WhatsApp chats.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}


export function getWhatsappChatByNumber(phone) {
  return service
    .get(`whatsapp/chats/${phone}`)
    .then((res) => res.data)
    .catch((error) => {
      console.error(`❌ Failed to fetch chat for ${phone}:`, error);
      let errorMessage = "Failed to fetch chat history.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}

export function sendWhatsappTextMessage(payload) {
  return service
    .post("twilio/send-message-text", payload)
    .then(res => res.data)
    .catch(error => {
      console.error("❌ Failed to send WhatsApp message:", error);
      let errorMessage = "Failed to send message.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}


export function createTwillioUser(payload) {
  return service
    .post("twillio-create-user", payload)
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ Failed to create Twillio user:", error);
      let errorMessage = "Failed to create Twillio user.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}

export function getAllTwillioUsers() {
  return service
    .get("twillio-create-readall")
    .then(res => res.data)
    .catch((error) => {
      let errorMessage = "Failed to fetch Twillio users";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}


export const updateTwillioUser = async (id, data) => {
  try {
    const res = await service.post(`twillio-create-update/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Failed to update Twillio user:", error);
    throw error;
  }
};


export function getUserProfile() {
  return service
    .get("Profile")
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ Failed to fetch profile:", error);
      let errorMessage = "Failed to fetch profile.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}


export function translateTextAPI(text, targetLang) {
  return fetch("https://libretranslate.de/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      source: "en",
      target: targetLang,
      format: "text",
    }),
  })
    .then((res) => res.json())
    .then((data) => data.translatedText)
    .catch((error) => {
      console.error("❌ Translation API failed:", error);
      throw new Error("Translation failed");
    });
}


export function signupTwillioUser(payload) {
  return service
    .post("twillio-create-user-signup", payload)
    .then((res) => res.data)
    .catch((error) => {
      let errorMessage = "Signup failed.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}



export function verifyEmailOtp(payload) {
  return service
    .post("twillio-email-verify", payload)
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ Email OTP verification failed:", error);
      let errorMessage = "OTP verification failed.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}


export function resendTwillioOtp(payload) {
  return service
    .post("twillio-resend-otp", payload)
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ Resend OTP failed:", error);
      let errorMessage = "Failed to resend OTP.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}


//whatsapp template 

export function getWhatsappTemplates() {
  return service
    .get("twilio/wa/templates")
   .then((res) => res.data?.data || res.data)

    .catch((error) => {
      let msg = "Failed to fetch WhatsApp templates";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}


export function submitWhatsappTemplate({ static_script, template_name }) {
  return service
    .post("twilio/wa/templates/submit", { static_script, template_name })
    .then((res) => res.data)
    .catch((error) => {
      let msg = "Failed to submit WhatsApp template";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}



export function getCallSchedule() {
  return service
    .get("twilio/set-call")
    .then((res) => res.data?.data || res.data) 
    .catch((error) => {
      let msg = "Failed to fetch call schedules";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}


export function submitCallSchedule({ day, static_script, calling_script, email_script }) {
  return service
    .post("twilio/set-call", { day, static_script, calling_script, email_script })
    .then((res) => res.data)
    .catch((error) => {
      let msg = "Failed to save call schedule";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}


    export function sendConversationCall(payload) {
      return service
        .post("omni/call", payload)
        .then((res) => res.data)
        .catch((error) => {
          console.error("❌ omni/call failed:", error);
          let errorMessage = "Failed to trigger conversation call.";
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          throw new Error(errorMessage);
        });
    }

export function getChannelPartners() {
  return service
    .get("channel-partner")
    .then((res) => {
    
      const out = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      return out;
    })
    .catch((error) => {
      let msg = "Failed to fetch channel partners.";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}


export function createChannelPartner(payload) {
  return service
    .post("channel-partner", payload)
    .then((res) => {
      console.log(" API Response:", res.data);  
      return res.data;  
    })
    .catch((error) => {
      throw new Error(error.response?.data?.message || "Failed to create channel partner");
    });
}




export function getAgents() {
  return service
    .get("agents")
    .then((res) => {
      // backend might return array or { data: [...] } — normalize to array
      const out = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
      return out;
    })
    .catch((error) => {
      let msg = "Failed to fetch agents.";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}

export function createAgent(payload) {
  return service
    .post("agents", payload)
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ createAgent failed:", error);
      let msg = "Failed to create agent.";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}




// API to send Omni Call
export function sendOmniCall(payload) {
  return service
    .post("omni/call", payload)
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ sendOmniCall failed:", error);
      let errorMessage = "Failed to send Omni call.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}


// in hooks/useAuth.js (or wherever you keep those functions)
export function downloadTemplateExcel() {
  return service
    .get("email-template-twillio-sample-excel", { responseType: "blob" })
    .then((res) => {
      
      const contentDisposition = res.headers["content-disposition"] || "";
      let filename = "call_template_demo.xlsx";
      const match = /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i.exec(contentDisposition);
      if (match && match[1]) {
        filename = decodeURIComponent(match[1]);
      }
      return { blob: res.data, filename };
    })
    .catch((error) => {
      console.error("❌ downloadTemplateExcel failed:", error);
      let msg = "Failed to download template";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}

export function generateSpeech(payload) {
  return service
    .post("elevenlabs/generate-speech", payload)
    .then((res) => res.data) 
    .catch((error) => {
      console.error("❌ generateSpeech failed:", error);
      let msg = "Failed to generate speech/text.";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}

export function getCallLogss() {
  return service
    .get("calls-logs", {
      headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
    })
    .then((res) => Array.isArray(res.data) ? res.data : [])
    .catch((error) => {
      console.error("❌ Failed to fetch Call Logs:", error);
      let errorMessage = "Failed to fetch Call Logs";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    });
}


export function getCallTranscript(callId) {
  return service
    .get(`calls-logs/${callId}`, {
      headers: { Authorization: `Bearer ${Cookies.get("CallingAgent")}` },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error("❌ Failed to fetch call transcript:", error);
      let msg = "Failed to fetch transcript.";
      if (error.response?.data?.message) msg = error.response.data.message;
      throw new Error(msg);
    });
}


