import type {
  ApiError,
  LoginDto,
  LoginResponse,
  VerifyOtpDto,
  VerifyOtpResponse,
  NewOtpDto,
  NewOtpResponse,
} from "@/entities/auth/types";
import { addSeconds, now, sleep } from "@/shared/lib/time";

/** Память мока (на уровне модуля) */
const MOCK_STORE: {
  attemptCounter: number;
  challengeId?: string;
  otp?: string;
  otpExpiresAt?: number;
  lastEmail?: string;
} = {
  attemptCounter: 0,
};

const genOtp = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

function apiError(
  status: number,
  code: ApiError["code"],
  details?: ApiError["details"]
): ApiError {
  const err = new Error(code) as ApiError;
  err.name = "ApiError";
  err.status = status;
  err.code = code;
  if (details) err.details = details;
  return err;
}

const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);

/** === LOGIN === */
export async function login(dto: LoginDto): Promise<LoginResponse> {
  await sleep(600);

  if (!isEmail(dto.email)) {
    throw apiError(422, "VALIDATION_ERROR", { email: "Invalid email format" });
  }
  if (!dto.password || dto.password.length < 6) {
    throw apiError(422, "VALIDATION_ERROR", {
      password: "Password is too short",
    });
  }

  // демо для успешного входа
  if (!(dto.email === "demo@dev.io" && dto.password === "demo123")) {
    throw apiError(400, "INVALID_CREDENTIALS", {
      form: "Wrong email or password",
    });
  }

  const challengeId = cryptoRandomId();
  const otp = genOtp();

  MOCK_STORE.challengeId = challengeId;
  MOCK_STORE.otp = otp;
  MOCK_STORE.otpExpiresAt = addSeconds(30);
  MOCK_STORE.lastEmail = dto.email;

  emitOtp(otp, MOCK_STORE.otpExpiresAt!);

  // Код для 2FA
  console.log(
    "[MOCK] OTP:",
    otp,
    "expires at",
    new Date(MOCK_STORE.otpExpiresAt!).toLocaleTimeString()
  );

  return { requires2FA: true, challengeId };
}

/** === VERIFY OTP === */
export async function verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponse> {
  await sleep(400);

  if (dto.challengeId !== MOCK_STORE.challengeId) {
    throw apiError(400, "INVALID_OTP", { code: "Invalid challenge" });
  }

  const { otp, otpExpiresAt } = MOCK_STORE;

  if (!otp || !otpExpiresAt) {
    throw apiError(410, "OTP_EXPIRED", { code: "Code expired" });
  }

  if (now() > otpExpiresAt) {
    throw apiError(410, "OTP_EXPIRED", { code: "Code expired" });
  }

  if (dto.code !== otp) {
    throw apiError(400, "INVALID_OTP", { code: "Invalid code" });
  }

  return { ok: true };
}

/** === GET NEW OTP === */
export async function getNewOtp(_: NewOtpDto): Promise<NewOtpResponse> {
  await sleep(400);

  if (!MOCK_STORE.challengeId) {
    throw apiError(400, "INVALID_OTP", { code: "No active challenge" });
  }

  MOCK_STORE.otp = genOtp();
  MOCK_STORE.otpExpiresAt = addSeconds(30);

  emitOtp(MOCK_STORE.otp!, MOCK_STORE.otpExpiresAt!);

  console.log(
    "[MOCK] NEW OTP:",
    MOCK_STORE.otp,
    "expires at",
    new Date(MOCK_STORE.otpExpiresAt!).toLocaleTimeString()
  );

  return { ok: true, expiresAt: MOCK_STORE.otpExpiresAt! };
}

/** Генератор id */
function cryptoRandomId(len = 16) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function emitOtp(otp: string, expiresAt: number) {
  // Показываем только в dev или при debug=1
  const enable =
    import.meta.env.DEV ||
    new URLSearchParams(window.location.search).get("debug") === "1" ||
    import.meta.env.VITE_SHOW_OTP === "1";

  if (!enable) return;

  window.dispatchEvent(
    new CustomEvent("mock:otp", { detail: { otp, expiresAt } })
  );
}
