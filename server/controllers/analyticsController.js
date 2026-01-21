const { supabase } = require("../config/supabase");
const {
  generateId,
  getCurrentWeekBounds,
  calculateSuccessRate,
  formatResponse,
  asyncHandler,
} = require("../utils/helpers");

/**
 * Generate weekly report for user
 */
const generateWeeklyReport = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { weekStart, weekEnd } = req.query;

  // Use provided dates or current week
  const { weekStart: currentWeekStart, weekEnd: currentWeekEnd } =
    getCurrentWeekBounds();
  const reportWeekStart = weekStart ? parseInt(weekStart) : currentWeekStart;
  const reportWeekEnd = weekEnd ? parseInt(weekEnd) : currentWeekEnd;

  // Get user's habits
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId);

  if (habitsError) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch habits", [
          habitsError.message,
        ]),
      );
  }

  if (habits.length === 0) {
    return res
      .status(400)
      .json(formatResponse(false, null, "No habits found to generate report"));
  }

  // Get logs for the week
  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("timestamp", new Date(reportWeekStart).toISOString())
    .lt("timestamp", new Date(reportWeekEnd).toISOString());

  if (logsError) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch logs", [
          logsError.message,
        ]),
      );
  }

  // Calculate metrics
  const totalCompletions = logs.filter(
    (log) => log.status === "completed",
  ).length;
  const totalMissed = logs.filter((log) => log.status === "failed").length;
  const overallSuccessRate = calculateSuccessRate(
    totalCompletions,
    totalCompletions + totalMissed,
  );

  // Calculate day-of-week statistics
  const dayStats = {};
  for (let day = 0; day < 7; day++) {
    const dayLogs = logs.filter((log) => log.day_of_week === day);
    const dayCompletions = dayLogs.filter(
      (log) => log.status === "completed",
    ).length;
    dayStats[day] = {
      completions: dayCompletions,
      total: dayLogs.length,
    };
  }

  const bestDay = Object.keys(dayStats).reduce((best, day) => {
    const dayNum = parseInt(day);
    const bestNum = parseInt(best);
    return dayStats[dayNum].completions > dayStats[bestNum].completions
      ? dayNum
      : bestNum;
  }, "0");

  const worstDay = Object.keys(dayStats).reduce((worst, day) => {
    const dayNum = parseInt(day);
    const worstNum = parseInt(worst);
    return dayStats[dayNum].completions < dayStats[worstNum].completions
      ? dayNum
      : worstNum;
  }, "0");

  // Calculate habit metrics
  const habitMetrics = habits.map((habit) => {
    const habitLogs = logs.filter((log) => log.habit_id === habit.id);
    const completions = habitLogs.filter(
      (log) => log.status === "completed",
    ).length;
    const missed = habitLogs.filter((log) => log.status === "failed").length;
    const successRate = calculateSuccessRate(completions, completions + missed);

    // Calculate consecutive failures
    const recentLogs = habitLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 7);

    let consecutiveFailures = 0;
    for (const log of recentLogs) {
      if (log.status === "failed") {
        consecutiveFailures++;
      } else {
        break;
      }
    }

    const isAtRisk = consecutiveFailures >= 3 || successRate < 30;

    return {
      habitId: habit.id,
      habitName: habit.name,
      completions,
      missed,
      successRate,
      stabilityScore: Math.max(0, 100 - consecutiveFailures * 20),
      trend:
        successRate >= 70
          ? "improving"
          : successRate >= 40
            ? "stable"
            : "declining",
      consecutiveFailures,
      isAtRisk,
    };
  });

  const atRiskHabits = habitMetrics
    .filter((metric) => metric.isAtRisk)
    .map((metric) => metric.habitId);

  // Generate suggestions
  const suggestions = habitMetrics
    .filter((metric) => metric.isAtRisk)
    .map((metric) => ({
      habitId: metric.habitId,
      type:
        metric.consecutiveFailures >= 5
          ? "recommend_pause"
          : metric.successRate < 20
            ? "reduce_frequency"
            : "decrease_difficulty",
      reason: `${metric.habitName} has ${metric.consecutiveFailures} consecutive failures and ${metric.successRate}% success rate`,
      suggestedAction:
        metric.consecutiveFailures >= 5
          ? "Consider pausing this habit for a few days"
          : metric.successRate < 20
            ? "Try reducing frequency to build momentum"
            : "Consider lowering the effort rating",
    }));

  const report = {
    id: generateId(),
    user_id: userId,
    week_start: reportWeekStart,
    week_end: reportWeekEnd,
    generated_at: Date.now(),
    total_completions: totalCompletions,
    total_missed: totalMissed,
    overall_success_rate: overallSuccessRate,
    best_day: parseInt(bestDay),
    worst_day: parseInt(worstDay),
    habit_metrics: habitMetrics,
    at_risk_habits: atRiskHabits,
    suggestions: suggestions,
    created_at: new Date().toISOString(),
  };

  // Save report to database
  const { data: savedReport, error: saveError } = await supabase
    .from("weekly_reports")
    .insert([report])
    .select()
    .single();

  if (saveError) {
    console.error("Failed to save report:", saveError);
    // Still return the report even if saving fails
  }

  res.json(
    formatResponse(true, report, "Weekly report generated successfully"),
  );
});

/**
 * Get user's weekly reports
 */
const getWeeklyReports = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { limit = 4 } = req.query;

  const { data: reports, error } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(parseInt(limit));

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch reports", [error.message]),
      );
  }

  res.json(
    formatResponse(true, reports, "Weekly reports retrieved successfully"),
  );
});

/**
 * Get latest weekly report
 */
const getLatestWeeklyReport = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data: report, error } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch latest report", [
          error.message,
        ]),
      );
  }

  if (!report) {
    return res
      .status(404)
      .json(formatResponse(false, null, "No reports found"));
  }

  res.json(
    formatResponse(true, report, "Latest report retrieved successfully"),
  );
});

/**
 * Get user statistics dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get habits count and total streaks
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("streak")
    .eq("user_id", userId);

  if (habitsError) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch habits", [
          habitsError.message,
        ]),
      );
  }

  const totalHabits = habits.length;
  const totalStreaks = habits.reduce((sum, habit) => sum + habit.streak, 0);
  const maxStreak =
    habits.length > 0 ? Math.max(...habits.map((h) => h.streak)) : 0;

  // Get this week's completion stats
  const { weekStart, weekEnd } = getCurrentWeekBounds();
  const { data: weekLogs, error: logsError } = await supabase
    .from("habit_logs")
    .select("status")
    .eq("user_id", userId)
    .gte("timestamp", new Date(weekStart).toISOString())
    .lt("timestamp", new Date(weekEnd).toISOString());

  if (logsError) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch week logs", [
          logsError.message,
        ]),
      );
  }

  const weekCompletions = weekLogs.filter(
    (log) => log.status === "completed",
  ).length;
  const weekMissed = weekLogs.filter((log) => log.status === "failed").length;
  const weekSuccessRate = calculateSuccessRate(
    weekCompletions,
    weekCompletions + weekMissed,
  );

  const stats = {
    totalHabits,
    totalStreaks,
    maxStreak,
    weekCompletions,
    weekMissed,
    weekSuccessRate,
  };

  res.json(
    formatResponse(true, stats, "Dashboard stats retrieved successfully"),
  );
});

/**
 * Get habit completion calendar data
 */
const getCalendarData = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  if (!year || !month) {
    return res
      .status(400)
      .json(formatResponse(false, null, "Year and month are required"));
  }

  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select(
      `
      *,
      habits!inner(name, selected_days)
    `,
    )
    .eq("user_id", userId)
    .gte("timestamp", startDate.toISOString())
    .lte("timestamp", endDate.toISOString())
    .order("timestamp", { ascending: true });

  if (error) {
    return res
      .status(500)
      .json(
        formatResponse(false, null, "Failed to fetch calendar data", [
          error.message,
        ]),
      );
  }

  // Group logs by date
  const calendarData = {};
  logs.forEach((log) => {
    const date = new Date(log.timestamp).toDateString();
    if (!calendarData[date]) {
      calendarData[date] = {
        completed: 0,
        skipped: 0,
        failed: 0,
        total: 0,
      };
    }
    calendarData[date][log.status]++;
    calendarData[date].total++;
  });

  res.json(
    formatResponse(true, calendarData, "Calendar data retrieved successfully"),
  );
});

module.exports = {
  generateWeeklyReport,
  getWeeklyReports,
  getLatestWeeklyReport,
  getDashboardStats,
  getCalendarData,
};
