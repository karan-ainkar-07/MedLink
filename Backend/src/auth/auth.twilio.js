import twilio from "twilio";

// Twillio client that can be used by different services 
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

export async function sendOtp(phone) {
  return client.verify.v2
    .services(serviceSid)
    .verifications.create({
      to: phone,
      channel: "sms",
    });
}

export async function checkOtp(phone, code) {
  const result = await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({
      to: phone,
      code,
    });

  return result.status === "approved";
}