// maps clinic-related error codes to http status + message

const ERRORS = {
  CLINIC_NOT_FOUND: { status: 404, message: "Clinic not found" },
  CLINIC_NOT_APPROVED: { status: 409, message: "This clinic isn't approved yet" },
  DOCTOR_NOT_FOUND: { status: 404, message: "Doctor not found at this clinic" },
};

export class ClinicError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
    this.status = ERRORS[code]?.status || 500;
    this.publicMessage = ERRORS[code]?.message || "Something went wrong";
  }
}
