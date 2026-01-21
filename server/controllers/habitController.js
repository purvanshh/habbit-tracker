const { supabase } = require("../config/supabase");
const {
  generateId,
  getWeekNumber,
  validateHabitData,
  formatResponse,
  asyncHandler,
} = require("../utils/helpers");

/**
 * Get all habits for the authenticated user
 */
const getHabits = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const currentWeek = getWeekNumber();

  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch habits", [error.message]),
      );
  }

  // Process habits to reset weekly skips if needed
  const processedHabits = habits.map((habit) => {
    const skipsUsed =
      habit.last_skip_reset_week === currentWeek
        ? habit.skips_used_this_week
        : 0;
    return {
      ...habit,
      skips_used_this_week: skipsUsed,
      last_skip_reset_week: currentWeek,
      selected_days: habit.selected_days || [0, 1, 2, 3, 4, 5, 6],
    };
  });

  res.json(
    formatResponse(true, processedHabits, "Habits retrieved successfully"),
  );
});

/**
 * Create a new habit
 */
const createHabit = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const habitData = req.body;

  // Validate input data
  const validationErrors = validateHabitData(habitData);
  if (validationErrors.length > 0) {
    return res
      .status(400)
      .json(formatResponse(false, null, "Validation failed", validationErrors));
  }

  const newHabit = {
    id: generateId(),
    user_id: userId,
    name: habitData.name.trim(),
    icon: habitData.icon || "barbell",
    frequency: habitData.frequency,
    selected_days: habitData.selectedDays || [0, 1, 2, 3, 4, 5, 6],
    effort_rating: habitData.effortRating || 1,
    time_window: habitData.timeWindow || "anytime",
    created_at: new Date().toISOString(),
    streak: 0,
    is_paused: false,
    paused_until: null,
    skips_used_this_week: 0,
    max_skips_per_week: habitData.maxSkipsPerWeek || 2,
    last_skip_reset_week: getWeekNumber(),
  };

  const { data, error } = await supabase
    .from("habits")
    .insert([newHabit])
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to create habit", [error.message]),
      );
  }

  res
    .status(201)
    .json(formatResponse(true, data, "Habit created successfully"));
});

/**
 * Update an existing habit
 */
const updateHabit = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.id;
  const updates = req.body;

  // Validate that the habit belongs to the user
  const { data: existingHabit, error: fetchError } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingHabit) {
    return res.status(404).json(formatResponse(false, null, "Habit not found"));
  }

  // Prepare update object
  const updateData = {};
  if (updates.name) updateData.name = updates.name.trim();
  if (updates.icon) updateData.icon = updates.icon;
  if (updates.frequency) updateData.frequency = updates.frequency;
  if (updates.selectedDays) updateData.selected_days = updates.selectedDays;
  if (updates.effortRating) updateData.effort_rating = updates.effortRating;
  if (updates.timeWindow) updateData.time_window = updates.timeWindow;
  if (updates.isPaused !== undefined) updateData.is_paused = updates.isPaused;
  if (updates.pausedUntil) updateData.paused_until = updates.pausedUntil;
  if (updates.streak !== undefined) updateData.streak = updates.streak;
  if (updates.skipsUsedThisWeek !== undefined)
    updateData.skips_used_this_week = updates.skipsUsedThisWeek;
  if (updates.lastSkipResetWeek !== undefined)
    updateData.last_skip_reset_week = updates.lastSkipResetWeek;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("habits")
    .update(updateData)
    .eq("id", habitId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to update habit", [error.message]),
      );
  }

  res.json(formatResponse(true, data, "Habit updated successfully"));
});

/**
 * Delete a habit
 */
const deleteHabit = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.id;

  // Verify habit ownership
  const { data: existingHabit, error: fetchError } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingHabit) {
    return res.status(404).json(formatResponse(false, null, "Habit not found"));
  }

  // Delete related logs first
  await supabase.from("habit_logs").delete().eq("habit_id", habitId);

  // Delete the habit
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", userId);

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to delete habit", [error.message]),
      );
  }

  res.json(formatResponse(true, null, "Habit deleted successfully"));
});

/**
 * Get a specific habit by ID
 */
const getHabitById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.id;

  const { data: habit, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", userId)
    .single();

  if (error || !habit) {
    return res.status(404).json(formatResponse(false, null, "Habit not found"));
  }

  res.json(formatResponse(true, habit, "Habit retrieved successfully"));
});

/**
 * Pause a habit for a specified number of days
 */
const pauseHabit = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.id;
  const { days = 3 } = req.body;

  const pausedUntil = new Date();
  pausedUntil.setDate(pausedUntil.getDate() + days);

  const { data, error } = await supabase
    .from("habits")
    .update({
      is_paused: true,
      paused_until: pausedUntil.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", habitId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to pause habit", [error.message]),
      );
  }

  res.json(formatResponse(true, data, `Habit paused for ${days} days`));
});

/**
 * Resume a paused habit
 */
const resumeHabit = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const habitId = req.params.id;

  const { data, error } = await supabase
    .from("habits")
    .update({
      is_paused: false,
      paused_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", habitId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to resume habit", [error.message]),
      );
  }

  res.json(formatResponse(true, data, "Habit resumed successfully"));
});

module.exports = {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  getHabitById,
  pauseHabit,
  resumeHabit,
};
