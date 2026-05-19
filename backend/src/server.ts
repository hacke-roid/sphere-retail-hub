import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import loadRoutes from "./routers";
import { connectDatabase } from "./db/mongoose";
import "dotenv/config";

const app = express();
const apiRouter = express.Router();
const port = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || "development";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5174";

app.use(express.json());

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ServerStackItem API Running",
    version: "1.0.0",
    environment: NODE_ENV,
  });
});

loadRoutes(apiRouter);
app.use("/v1/api", apiRouter);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error);

  if (
    error.message.startsWith("SMTP email is not configured") ||
    error.message.startsWith("Unable to send password email") ||
    error.message.startsWith("CDN upload is not configured")
  ) {
    return res.status(503).json({
      success: false,
      message: error.message,
    });
  }

  if (error.message === "Member account is not assigned to a tenant") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (
    error.message === "Category name is required" ||
    error.message === "Product name is required" ||
    error.message === "Only image uploads are allowed"
  ) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database", error);
    process.exit(1);
  });
