import authService from "./auth.service.js";
import { AuthError } from "./auth.errors.js";

export async function sendOtp(req, res) {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: "PHONE_REQUIRED",
        message: "Phone number is required",
      });
    }

    const result = await authService.sendOtp(phone);
    res.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({
        error: err.code,
        message: err.publicMessage,
      });
    }

    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to send OTP",
    });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        error: "MISSING_FIELDS",
        message: "Phone and code are required",
      });
    }

    const result = await authService.verifyOtp(phone, code);
    res.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({
        error: err.code,
        message: err.publicMessage,
      });
    }

    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to verify OTP",
    });
  }
}

export async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "TOKEN_REQUIRED",
        message: "Refresh token is required",
      });
    }

    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return res.status(err.status).json({
        error: err.code,
        message: err.publicMessage,
      });
    }

    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to refresh session",
    });
  }
}

export async function logout(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "TOKEN_REQUIRED",
        message: "Refresh token is required",
      });
    }

    const result = await authService.logout(refreshToken);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to log out",
    });
  }
}

export async function createWalkInUser(req, res) {
  try {
    const { phone, name } = req.body;

    if (!phone || !name) {
      return res.status(400).json({
        error: "MISSING_FIELDS",
        message: "Phone and name are required",
      });
    }

    const result = await authService.createWalkInUser(phone, name);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Failed to create walk-in user",
    });
  }
}