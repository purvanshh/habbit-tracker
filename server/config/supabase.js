const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Validate environment variables
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar] || process.env[envVar].startsWith("your_"),
);

if (missingEnvVars.length > 0) {
  console.warn(
    "⚠️  Missing or placeholder Supabase environment variables:",
    missingEnvVars.join(", "),
  );
  console.warn(
    "⚠️  Please update your .env file with actual Supabase credentials.",
  );
  console.warn(
    "⚠️  Server will start but database operations will fail until configured.",
  );
}

// Create Supabase client for general operations (with fallback for demo)
let supabase = null;
let supabaseAdmin = null;

try {
  if (
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_ANON_KEY &&
    !process.env.SUPABASE_URL.startsWith("your_") &&
    !process.env.SUPABASE_ANON_KEY.startsWith("your_")
  ) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
        },
      },
    );

    // Create Supabase admin client for service operations
    if (
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith("your_")
    ) {
      supabaseAdmin = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );
    }
  } else {
    console.warn(
      "⚠️  Supabase clients not initialized due to missing configuration",
    );
  }
} catch (error) {
  console.error("❌ Failed to initialize Supabase clients:", error.message);
}

module.exports = {
  supabase,
  supabaseAdmin,
};
