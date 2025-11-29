import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";
import cookieParser from "cookie-parser";
import { randomBytes } from "crypto";
import { connectDB, checkDBHealth } from "./lib/database";
import { disconnectRedis } from "./lib/redis";
import { logger } from "./lib/logger";
import { apiLimiter, authLimiter, medicalLimiter, adminLimiter } from "./middleware/rateLimit";
import { httpsRedirect, generateNonce, sanitizeInput, securityHeaders } from "./middleware/security";
import { securityLogger, securityErrorHandler } from "./middleware/securityLogger";
import { correlationId } from "./middleware/correlation";
import { addVersionHeaders, deprecationWarning } from "./middleware/apiVersion";

import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import profileRouter from "./routes/profile";
import diseasesRouter from "./routes/diseases";
import medicationsRouter from "./routes/medications.ts";
import adminRouter from "./routes/admin";
import v1Router from "./routes/v1/index";

dotenv.config();

function createServer() {
  const app = express();

  app.use(correlationId);
  app.use(addVersionHeaders);
  app.use(deprecationWarning);

  const corsOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id', 'x-csrf-token'],
  }));

  app.use(httpsRedirect);
  app.use(securityHeaders);

  app.use(helmet({
    contentSecurityPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  app.use(generateNonce);
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(sanitizeInput);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(securityLogger);

  if (process.env.NODE_ENV === 'production') {
    app.use("/api/", apiLimiter);
  }

  app.get("/api/health", async (_req, res) => {
    const dbHealth = await checkDBHealth();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: dbHealth
    });
  });

  app.get("/api/csrf-token", (_req, res) => {
    const token = randomBytes(32).toString('hex');
    res.json({ csrfToken: token });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use("/api/v1", apiLimiter, v1Router);
  } else {
    app.use("/api/v1", v1Router);
  }

  if (process.env.NODE_ENV === 'production') {
    app.use("/api/diseases", medicalLimiter, diseasesRouter);
    app.use("/api/medications", medicalLimiter, medicationsRouter);
  } else {
    app.use("/api/diseases", diseasesRouter);
    app.use("/api/medications", medicationsRouter);
  }

  app.use("/api/auth", authRouter);

  if (process.env.NODE_ENV === 'production') {
    app.use("/api/user", authLimiter, usersRouter);
    app.use("/api/profile", authLimiter, profileRouter);
  } else {
    app.use("/api/user", usersRouter);
    app.use("/api/profile", profileRouter);
  }

  app.use("/api/admin", adminLimiter, adminRouter);
  app.use(securityErrorHandler);

  return app;
}

const initializeServices = async () => {
  const dbConnected = await connectDB();

  if (dbConnected) {
    logger.info("🚀 Server ready with database connection");
  } else {
    logger.warn("⚠️ Server starting without database connection");
  }

  logger.info("📦 Using memory-based rate limiting");
  return { dbConnected, redisConnected: false };
};

const gracefulShutdown = async () => {
  logger.info("🔄 Graceful shutdown initiated");

  try {
    await disconnectRedis();
    logger.info("✅ All connections closed gracefully");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "❌ Error during graceful shutdown");
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

initializeServices().catch((error) => {
  logger.error({ err: error }, "Failed to initialize services");
});

export { createServer };
