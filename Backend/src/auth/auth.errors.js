// Error codes and messages 

const ERRORS = {
  TOO_MANY_REQUESTS: { status: 429, message: "Too many OTP requests, try again later" },
  INVALID_CODE: { status: 401, message: "Invalid or expired OTP code" },
  INVALID_OR_EXPIRED_REFRESH_TOKEN: { status: 401, message: "Session expired, please log in again" },
  USER_NOT_FOUND: { status: 404, message: "User not found" },
};

export class AuthError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
    this.status = ERRORS[code]?.status || 500;
    this.publicMessage = ERRORS[code]?.message || "Something went wrong";
  }
}

export { ERRORS };