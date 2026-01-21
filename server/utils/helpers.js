/**
 * Utility functions for the habit tracker API
 */

/**
 * Generate a unique ID (similar to the frontend implementation)
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Get current week number (matches frontend implementation)
 */
const getWeekNumber = (date = new Date()) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor(diff / oneWeek);
};

/**
 * Get start and end of current week
 */
const getCurrentWeekBounds = () => {
  const now = new Date();
  const weekEnd = now.getTime();
  const weekStart = weekEnd - 7 * 24 * 60 * 60 * 1000;
  return { weekStart, weekEnd };
};

/**
 * Get start and end of day for a given date
 */
const getDayBounds = (date = new Date()) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setHours(23, 59, 59, 999);
  return {
    dayStart: dayStart.getTime(),
    dayEnd: dayEnd.getTime(),
  };
};

/**
 * Validate habit data
 */
const validateHabitData = (habitData) => {
  const errors = [];

  if (
    !habitData.name ||
    typeof habitData.name !== "string" ||
    habitData.name.trim().length === 0
  ) {
    errors.push("Habit name is required and must be a non-empty string");
  }

  if (!["daily", "custom", "weekly"].includes(habitData.frequency)) {
    errors.push("Frequency must be one of: daily, custom, weekly");
  }

  if (
    habitData.effortRating &&
    (habitData.effortRating < 1 || habitData.effortRating > 5)
  ) {
    errors.push("Effort rating must be between 1 and 5");
  }

  if (habitData.selectedDays && !Array.isArray(habitData.selectedDays)) {
    errors.push("Selected days must be an array");
  }

  if (
    habitData.selectedDays &&
    habitData.selectedDays.some((day) => day < 0 || day > 6)
  ) {
    errors.push("Selected days must be between 0 (Sunday) and 6 (Saturday)");
  }

  return errors;
};

/**
 * Validate habit log data
 */
const validateLogData = (logData) => {
  const errors = [];

  if (!logData.habitId || typeof logData.habitId !== "string") {
    errors.push("Habit ID is required and must be a string");
  }

  if (!["completed", "skipped", "failed"].includes(logData.status)) {
    errors.push("Status must be one of: completed, skipped, failed");
  }

  return errors;
};

/**
 * Calculate success rate
 */
const calculateSuccessRate = (completions, total) => {
  if (total === 0) return 0;
  return Math.round((completions / total) * 100);
};

/**
 * Format API response
 */
const formatResponse = (
  success,
  data = null,
  message = null,
  errors = null,
) => {
  const response = { success };

  if (data !== null) response.data = data;
  if (message) response.message = message;
  if (errors) response.errors = errors;

  return response;
};

/**
 * Handle async route errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  generateId,
  getWeekNumber,
  getCurrentWeekBounds,
  getDayBounds,
  validateHabitData,
  validateLogData,
  calculateSuccessRate,
  formatResponse,
  asyncHandler,
};
