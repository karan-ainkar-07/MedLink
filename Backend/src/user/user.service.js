import prisma from "../db/prisma.client.js";

export async function updateProfile(userId, { age, gender }) {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: { age, gender },
    create: { userId, age, gender },
  });
  return profile;
}
