import { request } from "./httpClient";
import type { LoginRequest, LoginResponse, MeResponse } from "../types/auth";

export const loginUser = (payload: LoginRequest) => {
  return request<LoginResponse>("/v1/api/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const getMe = (token: string) => {
  return request<MeResponse>("/v1/api/users/me", {
    method: "GET",
    token,
  });
};

export const registerUser = (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  return request<LoginResponse>("/v1/api/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const forgotPassword = (payload: { email: string }) => {
  return request<{
    success: boolean;
    message: string;
    resetToken?: string;
  }>("/v1/api/users/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
