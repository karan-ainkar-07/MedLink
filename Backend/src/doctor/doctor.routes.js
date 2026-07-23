import express from "express";
import * as controller from "./doctor.controller.js";

const router = express.Router();

router.get("/:id", controller.getDoctor);
router.patch("/:id", controller.updateDoctor);

export default router;
