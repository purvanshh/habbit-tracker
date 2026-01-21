/**
 * Test script to verify Supabase authentication and API functionality
 * This script demonstrates how to authenticate and make API calls
 */

const { createClient } = require("@supabase/supabase-js");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

const API_BASE = "http://localhost:3000/api";

async function testAuthentication() {
  console.log("🧪 Testing Habit Tracker API Authentication...\n");

  try {
    // Test 1: Sign up a test user
    console.log("1️⃣ Testing user signup...");
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "testpassword123";

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
      },
    );

    if (signUpError) {
      console.log("❌ Signup failed:", signUpError.message);

      // Try to sign in instead (user might already exist)
      console.log("🔄 Trying to sign in with existing credentials...");
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: "test@example.com", // Use a known test email
          password: "testpassword123",
        });

      if (signInError) {
        console.log("❌ Sign in also failed:", signInError.message);
        console.log(
          "💡 You may need to create a test user in your Supabase dashboard first.",
        );
        return;
      }

      console.log("✅ Signed in successfully");
      var session = signInData.session;
    } else {
      console.log("✅ User created successfully");
      var session = signUpData.session;
    }

    if (!session) {
      console.log("❌ No session received");
      return;
    }

    const token = session.access_token;
    console.log("🔑 Got access token:", token.substring(0, 20) + "...\n");

    // Test 2: Make authenticated API calls
    console.log("2️⃣ Testing authenticated API calls...");

    // Test getting habits
    console.log("📋 Testing GET /api/habits...");
    const habitsResponse = await fetch(`${API_BASE}/habits`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const habitsData = await habitsResponse.json();
    console.log("Response:", JSON.stringify(habitsData, null, 2));

    if (habitsData.success) {
      console.log("✅ GET /api/habits successful");
    } else {
      console.log("❌ GET /api/habits failed");
    }

    // Test creating a habit
    console.log("\n📝 Testing POST /api/habits...");
    const newHabit = {
      name: "Test Habit",
      icon: "barbell",
      frequency: "daily",
      selectedDays: [1, 2, 3, 4, 5],
      effortRating: 3,
      timeWindow: "morning",
    };

    const createResponse = await fetch(`${API_BASE}/habits`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newHabit),
    });

    const createData = await createResponse.json();
    console.log("Response:", JSON.stringify(createData, null, 2));

    if (createData.success) {
      console.log("✅ POST /api/habits successful");

      // Test logging the habit
      const habitId = createData.data.id;
      console.log("\n📊 Testing POST /api/logs...");

      const logResponse = await fetch(`${API_BASE}/logs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habitId: habitId,
          status: "completed",
        }),
      });

      const logData = await logResponse.json();
      console.log("Response:", JSON.stringify(logData, null, 2));

      if (logData.success) {
        console.log("✅ POST /api/logs successful");
      } else {
        console.log("❌ POST /api/logs failed");
      }

      // Test analytics
      console.log("\n📈 Testing GET /api/analytics/dashboard...");
      const analyticsResponse = await fetch(`${API_BASE}/analytics/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const analyticsData = await analyticsResponse.json();
      console.log("Response:", JSON.stringify(analyticsData, null, 2));

      if (analyticsData.success) {
        console.log("✅ GET /api/analytics/dashboard successful");
      } else {
        console.log("❌ GET /api/analytics/dashboard failed");
      }
    } else {
      console.log("❌ POST /api/habits failed");
    }

    console.log("\n🎉 Authentication and API testing completed!");
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
}

// Run the test
testAuthentication();
