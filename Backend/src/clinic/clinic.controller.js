import * as clinicService from "./clinic.service.js";
import { ClinicError } from "./clinic.errors.js";

export async function createClinic(req, res) {
  try {
    const { name, address, lat, lng, workingHours, ownerUserId } = req.body;
    if (!name || !address || !ownerUserId) {
      return res.status(400).json({ error: "MISSING_FIELDS", message: "name, address, and ownerUserId are required" });
    }
    const result = await clinicService.createClinic({ name, address, lat, lng, workingHours, ownerUserId });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to create clinic" });
  }
}

export async function approveClinic(req, res) {
  try {
    const result = await clinicService.approveClinic(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to approve clinic" });
  }
}

export async function rejectClinic(req, res) {
  try {
    const result = await clinicService.rejectClinic(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to reject clinic" });
  }
}

export async function getClinic(req, res) {
  try {
    const clinic = await clinicService.getClinic(req.params.id);
    res.json(clinic);
  } catch (err) {
    if (err instanceof ClinicError) return res.status(err.status).json({ error: err.code, message: err.publicMessage });
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to fetch clinic" });
  }
}
