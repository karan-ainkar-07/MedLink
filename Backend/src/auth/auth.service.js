import crypto from "crypto";
import prisma from "../db/prisma.client.js";
import redis from "../redis/redis.client.js";
import { sendOtp as twilioSendOtp, checkOtp } from "./auth.twilio.js";
import { signAccessToken } from "./auth.jwt.js";
import { AuthError } from "./auth.errors.js";

const OTP_SEND_RATE_LIMIT = 3; // per phone per hour
const REFRESH_TOKEN_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 30);

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function sendOtp(phone) {
  const rateKey = `otp-rate:${phone}`;
  const count = await redis.incr(rateKey);

  if (count === 1) await redis.expire(rateKey, 3600); // 1 hour window
  if (count > OTP_SEND_RATE_LIMIT) {
    throw new AuthError("TOO_MANY_REQUESTS");
  }

  await twilioSendOtp(phone);
  return { sent: true };
}

export async function verifyOtp(phone, code) {
  const approved = await checkOtp(phone, code);
  if (!approved) throw new AuthError("INVALID_CODE");

  let user = await prisma.user.findUnique({
    where: { phone },
    include: { roles: { include: { role: true } } },
  });

  if (!user) {
    const patientRole = await prisma.role.findUnique({
      where: { name: "PATIENT" },
    });

    user = await prisma.user.create({
      data: {
        phone,
        phoneVerified: true,
        roles: { create: [{ roleId: patientRole.id }] },
      },
      include: { roles: { include: { role: true } } },
    });
  } else if (!user.phoneVerified) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
      include: { roles: { include: { role: true } } },
    });
  }

  const roles = user.roles.map((r) => r.role.name);
  return issueTokenPair(user.id, roles);
}

export async function issueTokenPair(userId, roles) {
  const accessToken = signAccessToken({ userId, roles });
  const refreshToken = crypto.randomBytes(64).toString("hex");

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return { accessToken, refreshToken, userId, roles };
}

export async function refresh(refreshToken) {
  const tokenHash = hashToken(refreshToken);

  return prisma.$transaction(async (tx) => {
    const stored = await tx.refreshToken.findFirst({
      where: { tokenHash, revoked: false },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AuthError("INVALID_OR_EXPIRED_REFRESH_TOKEN");
    }

    await tx.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true },
    });

    const user = await tx.user.findUnique({
      where: { id: stored.userId },
      include: { roles: { include: { role: true } } },
    });

    const roles = user.roles.map((r) => r.role.name);

    const accessToken = signAccessToken({ userId: user.id, roles });
    const newRefreshToken = crypto.randomBytes(64).toString("hex");

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
    );

    await tx.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken: newRefreshToken };
  });
}

export async function logout(refreshToken) {
  const tokenHash = hashToken(refreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });

  return { loggedOut: true };
}

export async function createWalkInUser(phone, name) {
  const existing = await prisma.user.findUnique({ where: { phone } });

  if (existing) {
    return {
      userId: existing.id,
      phoneVerified: existing.phoneVerified,
    };
  }

  const patientRole = await prisma.role.findUnique({
    where: { name: "PATIENT" },
  });

  const user = await prisma.user.create({
    data: {
      phone,
      name,
      phoneVerified: false,
      roles: { create: [{ roleId: patientRole.id }] },
    },
  });

  return { userId: user.id, phoneVerified: false };
}

const authService = {
  sendOtp,
  verifyOtp,
  issueTokenPair,
  refresh,
  logout,
  createWalkInUser,
};

export default authService;