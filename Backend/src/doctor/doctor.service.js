import prisma from "../db/prisma.client.js";
import { ClinicError } from "../clinic/clinic.errors.js";

export async function createDoctor(clinicId, { userId, specialization, avgConsultationMinutes }) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic || clinic.status !== "APPROVED") throw new ClinicError("CLINIC_NOT_APPROVED");

  const doctor = await prisma.doctor.create({
    data: { clinicId, userId, specialization, avgConsultationMinutes: avgConsultationMinutes || 10 },
  });

  return doctor;
}

export async function getDoctor(doctorId) {
  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor) throw new ClinicError("DOCTOR_NOT_FOUND");
  return doctor;
}

export async function updateDoctor(doctorId, data) {
  const doctor = await prisma.doctor.update({ where: { id: doctorId }, data });
  return doctor;
}
