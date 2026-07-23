import express from "express";
import * as controller from "./clinic.controller.js";
import * as doctorController from "../doctor/doctor.controller.js";
import { requireAuth, requireRole } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/", controller.createClinic);
router.get("/:id", controller.getClinic);

router.patch("/:id/approve", requireAuth, requireRole("ADMIN"), controller.approveClinic);
router.patch("/:id/reject", requireAuth, requireRole("ADMIN"), controller.rejectClinic);

// nested under clinic since a doctor always belongs to one — blocked unless clinic is APPROVED
router.post("/:clinicId/doctors", doctorController.createDoctor);

export default router;
