import express from "express";
import cors from "cors";
import prisma from "./db/prisma.client.js";
import redis from "./redis/redis.client.js";
const app = express();

app.use(cors());
app.use(express.json());

// check the health of services
app.get("/health", async (req, res) => {
  const status = { server: "ok", postgres: "unknown", redis: "unknown" };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.postgres = "ok";
  } catch (err) {
    status.postgres = `error: ${err.message}`;
  }

  try {
    const pong = await redis.ping();
    status.redis = pong === "PONG" ? "ok" : `unexpected response: ${pong}`;
  } catch (err) {
    status.redis = `error: ${err.message}`;
  }

  const allOk = status.postgres === "ok" && status.redis === "ok";
  res.status(allOk ? 200 : 503).json(status);
});


// routes mounted here as each service gets built
import authRoutes from "./auth/auth.routes.js"
import userRoutes from "./user/user.routes.js"

app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
export default app;
