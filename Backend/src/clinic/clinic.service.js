import prisma from "../db/prisma.client.js";
import { ClinicError } from "./clinic.errors.js";

export async function createClinic({ name, address, lat, lng, workingHours, ownerUserId }) {
  const clinic = await prisma.clinic.create({
    data: { name, address, workingHours, ownerUserId, status: "PENDING" },
  });

  // location is a postgis geography column, prisma can't set it directly —
  // do it as a raw follow-up update using postgis' point constructor
  if (lat != null && lng != null) {
    await prisma.$executeRaw`
      UPDATE clinics
      SET location = ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
      WHERE id = ${clinic.id}
    `;
  }

  return { clinicId: clinic.id, status: clinic.status };
}

export async function approveClinic(clinicId) {
  const clinic = await prisma.clinic.update({ where: { id: clinicId }, data: { status: "APPROVED" } });
  return { clinicId: clinic.id, status: clinic.status };
}

export async function rejectClinic(clinicId) {
  const clinic = await prisma.clinic.update({ where: { id: clinicId }, data: { status: "REJECTED" } });
  return { clinicId: clinic.id, status: clinic.status };
}

export async function getClinic(clinicId) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, include: { doctors: true } });
  if (!clinic) throw new ClinicError("CLINIC_NOT_FOUND");
  return clinic;
}

// used by queue service before it lets a patient join — not exposed as a route
export async function assertClinicAndDoctorActive(clinicId, doctorId) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
  if (!clinic || clinic.status !== "APPROVED") throw new ClinicError("CLINIC_NOT_APPROVED");

  const doctor = await prisma.doctor.findFirst({ where: { id: doctorId, clinicId } });
  if (!doctor) throw new ClinicError("DOCTOR_NOT_FOUND");
}
