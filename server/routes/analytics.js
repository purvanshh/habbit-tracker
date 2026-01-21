const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
  generateWeeklyReport,
  getWeeklyReports,
  getLatestWeeklyReport,
  getDashboardStats,
  getCalendarData,
} = require("../controllers/analyticsController");

// Apply authentication middleware to all routes
router.use(authenticateUser);

// GET /api/analytics/dashboard - Get dashboard statistics
router.get("/dashboard", getDashboardStats);

// GET /api/analytics/calendar - Get calendar completion data
router.get("/calendar", getCalendarData);

// POST /api/analytics/reports/generate - Generate weekly report
router.post("/reports/generate", generateWeeklyReport);

// GET /api/analytics/reports - Get user's weekly reports
router.get("/reports", getWeeklyReports);

// GET /api/analytics/reports/latest - Get latest weekly report
router.get("/reports/latest", getLatestWeeklyReport);

module.exports = router;
