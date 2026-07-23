import * as userService from "./user.service.js";

export async function updateProfile(req, res) {
  try {
    const { age, gender } = req.body;
    const profile = await userService.updateProfile(req.params.id, { age, gender });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to update profile" });
  }
}
