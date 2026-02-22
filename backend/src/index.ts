import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cors from "cors";
import cookieParser from "cookie-parser";
import { randomBytes } from "crypto";
import { connectDB, checkDBHealth } from "./lib/database";
import { connectMongoDB, disconnectMongoDB, checkMongoDBHealth } from "./lib/mongodb";
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
import medicationsRouter from "./routes/medications";
import adminRouter from "./routes/admin";
import doctorsRouter from "./routes/doctors";
import appointmentsRouter from "./routes/appointments";
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
    const [mysqlHealth, mongoHealth] = await Promise.all([
      checkDBHealth(),
      checkMongoDBHealth()
    ]);
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      mysql: mysqlHealth,
      mongodb: mongoHealth
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
  
  if (process.env.NODE_ENV === 'production') {
    app.use("/api/doctors", medicalLimiter, doctorsRouter);
    app.use("/api/appointments", authLimiter, appointmentsRouter);
  } else {
    app.use("/api/doctors", doctorsRouter);
    app.use("/api/appointments", appointmentsRouter);
  }
  
  app.use(securityErrorHandler);

  return app;
}

const PORT = process.env.PORT || 5174;

const initializeServices = async () => {
  const [mysqlConnected, mongoConnected] = await Promise.all([
    connectDB(),
    connectMongoDB()
  ]);

  if (mysqlConnected && mongoConnected) {
    logger.info("Server ready with MySQL and MongoDB connections");
  } else if (mysqlConnected) {
    logger.warn("Server starting with MySQL only (MongoDB not connected)");
  } else if (mongoConnected) {
    logger.warn("Server starting with MongoDB only (MySQL not connected)");
  } else {
    logger.warn("Server starting without database connections");
  }

  logger.info("Using memory-based rate limiting");
  return { mysqlConnected, mongoConnected, redisConnected: false };
};

const gracefulShutdown = async () => {
  logger.info("Graceful shutdown initiated");

  try {
    await Promise.all([
      disconnectRedis(),
      disconnectMongoDB()
    ]);
    logger.info("All connections closed gracefully");
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, "Error during graceful shutdown");
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Only start the server if this file is run directly (not imported for tests)
// Check if running directly by looking for tsx or node in the execution path
const isMainModule = process.argv[1]?.includes('index.ts') || process.argv[1]?.includes('index.js');

if (isMainModule) {
  const app = createServer();

  initializeServices().then(() => {
    app.listen(PORT, () => {
      logger.info(`Backend server running on http://localhost:${PORT}`);
    });
  }).catch((error) => {
    logger.error({ err: error }, "Failed to initialize services");
  });
}

export { createServer };
