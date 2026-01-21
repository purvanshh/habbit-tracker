const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
  logHabit,
  skipHabit,
  getHabitLogs,
  getAllLogs,
  isCompletedToday,
  getWeekLogs,
} = require("../controllers/logController");

// Apply authentication middleware to all routes
router.use(authenticateUser);

// POST /api/logs - Log a habit (complete/fail)
router.post("/", logHabit);

// POST /api/logs/skip - Skip a habit
router.post("/skip", skipHabit);

// GET /api/logs - Get all logs for user
router.get("/", getAllLogs);

// GET /api/logs/week - Get logs for specific week
router.get("/week", getWeekLogs);

// GET /api/logs/habit/:habitId - Get logs for specific habit
router.get("/habit/:habitId", getHabitLogs);

// GET /api/logs/habit/:habitId/today - Check if habit completed today
router.get("/habit/:habitId/today", isCompletedToday);

module.exports = router;
