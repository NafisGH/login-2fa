export type Email = string;
export type Password = string;

export interface LoginDto {
  email: Email;
  password: Password;
}

export interface LoginResponse {
  requires2FA: true;
  challengeId: string;
}

export type ApiErrorCode =
  | "INVALID_CREDENTIALS" // 400
  | "VALIDATION_ERROR" // 422 (backend валидация)
  | "RATE_LIMIT" // 429
  | "SERVER_ERROR" // 500
  | "INVALID_OTP" // 400 (неверный код)
  | "OTP_EXPIRED"; // 410 (истёк срок)

export interface ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  details?: Record<string, string>;
}

export interface VerifyOtpDto {
  challengeId: string;
  code: string; // 6 цифр
}

export interface VerifyOtpResponse {
  ok: true;
}

export interface NewOtpDto {
  challengeId: string;
}

export interface NewOtpResponse {
  ok: true;
  expiresAt: number; // UNIX ms
}
