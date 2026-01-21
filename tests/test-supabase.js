/**
 * Simple Supabase connection test
 */

const { createClient } = require("@supabase/supabase-js");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../server/.env') });

async function testSupabaseConnection() {
  console.log("🔗 Testing Supabase Connection...\n");

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );

    console.log("✅ Supabase client created successfully");
    console.log("🌐 URL:", process.env.SUPABASE_URL);
    console.log(
      "🔑 Anon Key:",
      process.env.SUPABASE_ANON_KEY.substring(0, 20) + "...",
    );

    // Test database connection by trying to query a table
    console.log("\n📊 Testing database connection...");

    const { data, error } = await supabase
      .from("habits")
      .select("count")
      .limit(1);

    if (error) {
      console.log("❌ Database query failed:", error.message);

      if (error.message.includes('relation "habits" does not exist')) {
        console.log(
          "💡 The habits table doesn't exist yet. Please run the SQL schema from database/schema.sql in your Supabase dashboard.",
        );
      } else if (error.message.includes("JWT")) {
        console.log(
          "💡 This is expected - we need authentication for data access.",
        );
        console.log(
          "✅ Database connection is working (authentication required)",
        );
      }
    } else {
      console.log("✅ Database query successful:", data);
    }

    // Test auth service
    console.log("\n🔐 Testing auth service...");
    const { data: authData, error: authError } =
      await supabase.auth.getSession();

    if (authError) {
      console.log("❌ Auth service error:", authError.message);
    } else {
      console.log("✅ Auth service is accessible");
      console.log("📝 Current session:", authData.session ? "Active" : "None");
    }

    console.log("\n🎉 Supabase connection test completed!");
    console.log("\n📋 Next steps:");
    console.log(
      "1. Make sure you've run the SQL schema from database/schema.sql",
    );
    console.log(
      "2. Create a test user in your Supabase dashboard (Authentication > Users)",
    );
    console.log("3. Or enable email confirmation in Authentication > Settings");
  } catch (error) {
    console.error("❌ Connection test failed:", error.message);
  }
}

testSupabaseConnection();
