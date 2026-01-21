const { supabase } = require("../config/supabase");
const {
  generateId,
  getDayBounds,
  validateLogData,
  formatResponse,
  asyncHandler,
} = require("../utils/helpers");

/**
 * Log a habit completion, skip, or failure
 */
const logHabit = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { habitId, status } = req.body;

  // Validate input data
  const validationErrors = validateLogData({ habitId, status });
  if (validationErrors.length > 0) {
    return res
      .status(400)
      .json(formatResponse(false, null, "Validation failed", validationErrors));
  }

  // Verify habit ownership
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (habitError || !habit) {
    return res.status(404).json(formatResponse(false, null, "Habit not found"));
  }

  // Check if already logged today
  const { dayStart, dayEnd } = getDayBounds();
  const { data: existingLog } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .gte("timestamp", new Date(dayStart).toISOString())
    .lte("timestamp", new Date(dayEnd).toISOString())
    .single();

  if (existingLog) {
    return res
      .status(400)
      .json(formatResponse(false, null, "Habit already logged for today"));
  }

  const now = new Date();
  const newLog = {
    id: generateId(),
    habit_id: habitId,
    user_id: userId,
    timestamp: now.toISOString(),
    status: status,
    day_of_week: now.getDay(),
    created_at: now.toISOString(),
  };

  // Insert the log
  const { data: logData, error: logError } = await supabase
    .from("habit_logs")
    .insert([newLog])
    .select()
    .single();

  if (logError) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to log habit", [logError.message]),
      );
  }

  // Update habit streak
  let newStreak = habit.streak;
  if (status === "completed") {
    newStreak += 1;
  } else if (status === "failed") {
    newStreak = 0;
  }
  // Skipped days don't break streak

  if (newStreak !== habit.streak) {
    await supabase
      .from("habits")
      .update({
        streak: newStreak,
        updated_at: now.toISOString(),
      })
      .eq("id", habitId)
      .eq("user_id", userId);
  }

  res.status(201).json(
    formatResponse(
      true,
      {
        log: logData,
        newStreak,
      },
      "Habit logged successfully",
    ),
  );
});

/**
 * Skip a habit (with skip limit validation)
 */
const skipHabit = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { habitId } = req.body;

  // Get habit with current skip data
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (habitError || !habit) {
    return res.status(404).json(formatResponse(false, null, "Habit not found"));
  }

  const currentWeek = require("../utils/helpers").getWeekNumber();
  let skipsUsed =
    habit.last_skip_reset_week === currentWeek ? habit.skips_used_this_week : 0;

  if (skipsUsed >= habit.max_skips_per_week) {
    return res
      .status(400)
      .json(formatResponse(false, null, "No skips remaining this week"));
  }

  // Log as skipped
  const now = new Date();
  const skipLog = {
    id: generateId(),
    habit_id: habitId,
    user_id: userId,
    timestamp: now.toISOString(),
    status: "skipped",
    day_of_week: now.getDay(),
    created_at: now.toISOString(),
  };

  const { data: logData, error: logError } = await supabase
    .from("habit_logs")
    .insert([skipLog])
    .select()
    .single();

  if (logError) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to skip habit", [logError.message]),
      );
  }

  // Update skip count
  const { data: updatedHabit, error: updateError } = await supabase
    .from("habits")
    .update({
      skips_used_this_week: skipsUsed + 1,
      last_skip_reset_week: currentWeek,
      updated_at: now.toISOString(),
    })
    .eq("id", habitId)
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to update skip count", [
          updateError.message,
        ]),
      );
  }

  res.json(
    formatResponse(
      true,
      {
        log: logData,
        habit: updatedHabit,
        skipsRemaining: habit.max_skips_per_week - (skipsUsed + 1),
      },
      "Habit skipped successfully",
    ),
  );
});

/**
 * Get logs for a specific habit
 */
const getHabitLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.habitId;
  const { limit = 50, offset = 0 } = req.query;

  // Verify habit ownership
  const { data: habit, error: habitError } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (habitError || !habit) {
    return res.status(404).json(formatResponse(false, null, "Habit not found"));
  }

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .order("timestamp", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch logs", [error.message]),
      );
  }

  res.json(formatResponse(true, logs, "Logs retrieved successfully"));
});

/**
 * Get all logs for the user
 */
const getAllLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 100, offset = 0, startDate, endDate } = req.query;

  let query = supabase
    .from("habit_logs")
    .select(
      `
      *,
      habits!inner(name, icon)
    `,
    )
    .eq("user_id", userId)
    .order("timestamp", { ascending: false });

  if (startDate) {
    query = query.gte("timestamp", new Date(startDate).toISOString());
  }

  if (endDate) {
    query = query.lte("timestamp", new Date(endDate).toISOString());
  }

  const { data: logs, error } = await query.range(offset, offset + limit - 1);

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch logs", [error.message]),
      );
  }

  res.json(formatResponse(true, logs, "All logs retrieved successfully"));
});

/**
 * Check if habit is completed today
 */
const isCompletedToday = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.habitId;

  const { dayStart, dayEnd } = getDayBounds();

  const { data: log, error } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .eq("user_id", userId)
    .gte("timestamp", new Date(dayStart).toISOString())
    .lte("timestamp", new Date(dayEnd).toISOString())
    .in("status", ["completed", "skipped"])
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to check completion status", [
          error.message,
        ]),
      );
  }

  res.json(
    formatResponse(
      true,
      {
        isCompleted: !!log,
        status: log?.status || null,
      },
      "Completion status retrieved",
    ),
  );
});

/**
 * Get logs for a specific week
 */
const getWeekLogs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { weekStart, weekEnd } = req.query;

  if (!weekStart || !weekEnd) {
    return res
      .status(400)
      .json(
        formatResponse(false, null, "Week start and end dates are required"),
      );
  }

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select(
      `
      *,
      habits!inner(name, icon)
    `,
    )
    .eq("user_id", userId)
    .gte("timestamp", new Date(parseInt(weekStart)).toISOString())
    .lt("timestamp", new Date(parseInt(weekEnd)).toISOString())
    .order("timestamp", { ascending: false });

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch week logs", [
          error.message,
        ]),
      );
  }

  res.json(formatResponse(true, logs, "Week logs retrieved successfully"));
});

module.exports = {
  logHabit,
  skipHabit,
  getHabitLogs,
  getAllLogs,
  isCompletedToday,
  getWeekLogs,
};
