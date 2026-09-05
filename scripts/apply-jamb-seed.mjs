import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://czojimgqrgkmabxflkpm.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required.");
  console.log("\nUsage:");
  console.log('  $env:SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"');
  console.log("  node scripts/apply-jamb-seed.mjs\n");
  console.log(
    "Tip: You can also apply the seed with 1-click in the Admin Dashboard: /admin -> Question Bank -> 'Seed JAMB Syllabus'.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function run() {
  console.log("Connecting to Supabase at:", SUPABASE_URL);

  const migrationPath = resolve("supabase/migrations/20260905092426_jamb_syllabus_seed.sql");
  const sql = readFileSync(migrationPath, "utf-8");

  console.log("Applying SQL migration...");
  // Attempt executing via rpc if available, or reporting
  const { error } = await supabase.rpc("exec_sql", { query: sql });
  if (error) {
    console.log(
      "Note: Direct exec_sql rpc not installed, please run the migration in Supabase SQL editor or click 'Seed JAMB Syllabus' in the Admin UI.",
    );
    console.error("RPC Error:", error.message);
  } else {
    console.log("✅ Seed migration executed successfully via RPC!");
  }
}

run().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
