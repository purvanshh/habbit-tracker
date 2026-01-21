const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import middleware
const { checkSupabaseConfig } = require("./middleware/supabaseCheck");

// Import routes
const habitRoutes = require("./routes/habits");
const logRoutes = require("./routes/logs");
const analyticsRoutes = require("./routes/analytics");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"] // Replace with your actual frontend domain
        : [
            "http://localhost:3000",
            "http://localhost:19006",
            "exp://localhost:19000",
          ], // Expo dev server URLs
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Habit Tracker API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API Routes
app.use("/api/habits", checkSupabaseConfig, habitRoutes);
app.use("/api/logs", checkSupabaseConfig, logRoutes);
app.use("/api/analytics", checkSupabaseConfig, analyticsRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Habit Tracker API",
    version: "1.0.0",
    endpoints: {
      habits: "/api/habits",
      logs: "/api/logs",
      analytics: "/api/analytics",
      health: "/health",
    },
    documentation: "See README.md for API documentation",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 Habit Tracker API Server Started
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
📊 Health Check: http://localhost:${PORT}/health
📚 API Base: http://localhost:${PORT}/api
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
