import { verifyAccessToken } from "./auth.jwt.js";

// checks the bearer token and attaches req.user = { userId, roles }
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      error: "NO_TOKEN",
      message: "Missing access token",
    });
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    return res.status(401).json({
      error: "INVALID_TOKEN",
      message: "Invalid or expired access token",
    });
  }
}

// use after requireAuth — checks req.user.roles includes one of the allowed roles
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const hasRole = req.user?.roles?.some((r) =>
      allowedRoles.includes(r)
    );

    if (!hasRole) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "You don't have access to this action",
      });
    }

    next();
  };
}