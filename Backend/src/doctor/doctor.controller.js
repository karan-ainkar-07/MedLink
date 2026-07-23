import * as doctorService from "./doctor.service.js";
import { ClinicError } from "../clinic/clinic.errors.js";

export async function createDoctor(req, res) {
  try {
    const { clinicId } = req.params;
    const { userId, specialization, avgConsultationMinutes } = req.body;
    if (!userId || !specialization) {
      return res.status(400).json({ error: "MISSING_FIELDS", message: "userId and specialization are required" });
    }
    const doctor = await doctorService.createDoctor(clinicId, { userId, specialization, avgConsultationMinutes });
    res.status(201).json(doctor);
  } catch (err) {
    if (err instanceof ClinicError) return res.status(err.status).json({ error: err.code, message: err.publicMessage });
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create doctor" });
  }
}

export async function getDoctor(req, res) {
  try {
    const doctor = await doctorService.getDoctor(req.params.id);
    res.json(doctor);
  } catch (err) {
    if (err instanceof ClinicError) return res.status(err.status).json({ error: err.code, message: err.publicMessage });
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch doctor" });
  }
}

export async function updateDoctor(req, res) {
  try {
    const doctor = await doctorService.updateDoctor(req.params.id, req.body);
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update doctor" });
  }
}
