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
