const { supabase } = require("../config/supabase");

/**
 * Middleware to check if Supabase is properly configured
 */
const checkSupabaseConfig = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({
      success: false,
      message: "Database service unavailable",
      error:
        "Supabase is not properly configured. Please check your environment variables.",
      hint: "Update SUPABASE_URL and SUPABASE_ANON_KEY in your .env file",
    });
  }
  next();
};

module.exports = {
  checkSupabaseConfig,
};
