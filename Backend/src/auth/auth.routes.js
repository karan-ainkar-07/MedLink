import express from "express";
import * as controller from "./auth.controller.js";
import { requireAuth, requireRole } from "./auth.middleware.js";

const router = express.Router();

// User APIs for auth
router.post("/otp/send", controller.sendOtp);
router.post("/otp/verify", controller.verifyOtp);
router.post("/refresh", controller.refresh);
router.post("/logout", requireAuth, controller.logout);

// Attendant API - walk-in user auth
router.post("/walkin-user",requireAuth,requireRole("ATTENDANT"),controller.createWalkInUser
);

export default router;