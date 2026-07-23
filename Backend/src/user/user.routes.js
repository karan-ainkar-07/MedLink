import express from "express";
import * as controller from "./user.controller.js";

const router = express.Router();

router.patch("/:id/profile", controller.updateProfile);

export default router;
