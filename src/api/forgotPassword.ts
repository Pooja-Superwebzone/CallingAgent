import service from "./axios";

export type ForgotPasswordRequestOtpResponse = unknown;
export type ForgotPasswordResetResponse = unknown;

export async function requestPasswordResetOtp(email: string) {
  const res = await service.post<ForgotPasswordRequestOtpResponse>(
    "forgot-password",
    { email }
  );
  return res.data;
}

export async function resetPasswordWithOtp(params: {
  email: string;
  otp: string;
  new_password: string;
  confirm_password: string;
}) {
  const res = await service.post<ForgotPasswordResetResponse>(
    "update-password",
    params
  );
  return res.data;
}

