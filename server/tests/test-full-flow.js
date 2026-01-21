/**
 * Full End-to-End Test for Habit Tracker (Supabase)
 * Simulates: Signup -> Create Habit -> Log Completion -> Weekly Report
 */

const { createClient } = require("@supabase/supabase-js");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Admin client to bypass email confirmation
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function runFullTest() {
    console.log("🚀 Starting End-to-End Supabase Test...\n");
    const timestamp = Date.now();
    const email = `testuser_${timestamp}@gmail.com`;
    const password = "TestPassword123!";

    try {
        // ---------------------------------------------------------
        // 1. Authentication (Sign Up via Admin)
        // ---------------------------------------------------------
        console.log("1️⃣  Authentication: Creating auto-confirmed user...");

        // Use Admin API to create user with confirmed email
        const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (adminError) throw new Error(`Admin user creation failed: ${adminError.message}`);

        const user = adminData.user;
        console.log(`✅ User created & confirmed: ${user.email} (ID: ${user.id})`);

        // Now sign in as that user to get a session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (signInError) throw new Error(`Sign in failed: ${signInError.message}`);
        const session = signInData.session;
        console.log(`✅ User signed in successfully\n`);

        // ---------------------------------------------------------
        // 2. Create Habit
        // ---------------------------------------------------------
        console.log("2️⃣  Database: Creating a new habit...");
        const habitId = `habit_${timestamp}`;
        const newHabit = {
            id: habitId,
            user_id: user.id,
            name: "Morning Run",
            icon: "walk",
            frequency: "daily",
            selected_days: [0, 1, 2, 3, 4, 5, 6],
            effort_rating: 3,
            time_window: "morning",
            created_at: new Date().toISOString(),
            streak: 0,
            is_paused: false,
            skips_used_this_week: 0
        };

        const { error: createError } = await supabase
            .from('habits')
            .insert(newHabit);

        if (createError) throw new Error(`Create habit failed: ${createError.message}`);
        console.log(`✅ Habit created: ${newHabit.name}\n`);

        // ---------------------------------------------------------
        // 3. Log Completion
        // ---------------------------------------------------------
        console.log("3️⃣  Database: Logging a completion...");
        const logId = `log_${timestamp}`;
        const newLog = {
            id: logId,
            habit_id: habitId,
            user_id: user.id,
            timestamp: new Date().toISOString(),
            status: 'completed',
            day_of_week: new Date().getDay()
        };

        const { error: logError } = await supabase
            .from('habit_logs')
            .insert(newLog);

        if (logError) throw new Error(`Log completion failed: ${logError.message}`);
        console.log(`✅ Completion logged for habit: ${habitId}\n`);

        // ---------------------------------------------------------
        // 4. Update Streak (Simulation)
        // ---------------------------------------------------------
        console.log("4️⃣  Database: Updating habit streak...");
        const { error: updateError } = await supabase
            .from('habits')
            .update({ streak: 1 })
            .eq('id', habitId)
            .eq('user_id', user.id); // RLS security check implicit

        if (updateError) throw new Error(`Update streak failed: ${updateError.message}`);
        console.log(`✅ Streak updated to 1\n`);

        // ---------------------------------------------------------
        // 5. Generate Weekly Report (Simulation)
        // ---------------------------------------------------------
        console.log("5️⃣  Database: Saving weekly report...");
        const reportId = `report_${timestamp}`;
        const report = {
            id: reportId,
            user_id: user.id,
            week_start: timestamp,
            week_end: timestamp + 604800000,
            generated_at: timestamp + 604800000,
            total_completions: 1,
            total_missed: 0,
            overall_success_rate: 100,
            habit_metrics: JSON.stringify([{ habitId, name: "Morning Run", completions: 1 }])
        };

        const { error: reportError } = await supabase
            .from('weekly_reports')
            .insert(report);

        if (reportError) throw new Error(`Save report failed: ${reportError.message}`);
        console.log(`✅ Weekly report saved\n`);

        // ---------------------------------------------------------
        // 6. Verification
        // ---------------------------------------------------------
        console.log("6️⃣  Verification: Fetching all user data...");

        const { data: habits, error: fetchHabitsError } = await supabase.from('habits').select('*').eq('user_id', user.id);
        const { data: logs, error: fetchLogsError } = await supabase.from('habit_logs').select('*').eq('user_id', user.id);
        const { data: reports, error: fetchReportsError } = await supabase.from('weekly_reports').select('*').eq('user_id', user.id);

        if (fetchHabitsError) throw fetchHabitsError;
        if (fetchLogsError) throw fetchLogsError;
        if (fetchReportsError) throw fetchReportsError;

        console.log(`   Habits Found: ${habits.length}`);
        console.log(`   Logs Found: ${logs.length}`);
        console.log(`   Reports Found: ${reports.length}`);

        if (habits.length === 1 && logs.length === 1 && reports.length === 1) {
            console.log("\n🎉 TEST PASSED: All operations successful!\n");
        } else {
            console.log("\n⚠️  TEST WARNING: Counts mismatch!\n");
        }

    } catch (error) {
        console.error("\n❌ TEST FAILED:", error.message);
    }
}

runFullTest();
