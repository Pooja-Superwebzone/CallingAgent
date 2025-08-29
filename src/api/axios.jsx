import axios from "axios";
import Cookies from "js-cookie";

export const service = axios.create({
  baseURL: "https://api-main.ibcrm.in/api/",
});

async function requestConfig(config) {
  if (!config.headers) {
    config.headers = {};
  }

  try {
   config.headers.version = "1.0.0"; // static version for now
  } catch (error) {
    console.warn("Failed to retrieve app version:", error);
  }

  const authToken = Cookies.get("CallingAgent");

  
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
}

service.interceptors.request.use(requestConfig);


service.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error?.response?.status === 401 ||
      error?.response?.statusText === "Unauthenticated."
    ) {
      Cookies.remove("CallingAgent");
    }

    return Promise.reject(error);
  }
);

export default service;
