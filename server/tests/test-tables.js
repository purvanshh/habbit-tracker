/**
 * Test script to verify all Supabase tables exist
 */

const { createClient } = require("@supabase/supabase-js");
const path = require('path');
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

async function testTables() {
    console.log("🧪 Testing Supabase Tables...\n");

    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    const tables = ['habits', 'habit_logs', 'weekly_reports', 'habit_adjustments'];

    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: Table exists (${count || 0} rows)`);
            }
        } catch (e) {
            console.log(`❌ ${table}: ${e.message}`);
        }
    }

    console.log("\n🎉 Table verification complete!");
}

testTables();
