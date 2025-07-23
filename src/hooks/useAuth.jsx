
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