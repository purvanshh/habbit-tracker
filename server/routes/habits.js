const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/auth");
const {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitById,
  pauseHabit,
  resumeHabit,
} = require("../controllers/habitController");

// Apply authentication middleware to all routes
router.use(authenticateUser);

// GET /api/habits - Get all habits for user
router.get("/", getHabits);

// POST /api/habits - Create a new habit
router.post("/", createHabit);

// GET /api/habits/:id - Get specific habit
router.get("/:id", getHabitById);

// PUT /api/habits/:id - Update habit
router.put("/:id", updateHabit);

// DELETE /api/habits/:id - Delete habit
router.delete("/:id", deleteHabit);

// POST /api/habits/:id/pause - Pause habit
router.post("/:id/pause", pauseHabit);

// POST /api/habits/:id/resume - Resume habit
router.post("/:id/resume", resumeHabit);

module.exports = router;
