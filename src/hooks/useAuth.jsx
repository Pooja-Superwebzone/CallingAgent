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
