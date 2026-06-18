/**
 * PrepWise AI — Integration / Smoke Test Suite
 * Run: node tests/test.mjs [BASE_URL]
 *
 * Default BASE_URL: https://prep-wise-topaz-mu.vercel.app
 *
 * Tests:
 *  1.  Homepage returns 200 and contains "PrepWise"
 *  2.  Homepage contains "Nduhura Marvin" attribution
 *  3.  /plans page returns 200
 *  4.  Supabase direct connectivity (anon key works, no 401)
 *  5.  POST /api/generate — valid payload returns a plan string
 *  6.  POST /api/generate — missing fields → 400
 *  7.  POST /api/generate — past exam date → 400
 *  8.  POST /api/generate — empty string fields → 400
 *  9.  POST /api/generate — 1-day timeline returns a valid plan
 *  10. POST /api/generate — success response has no error key
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const BASE_URL = process.argv[2] ?? "https://prep-wise-topaz-mu.vercel.app";

// Load env vars for direct Supabase tests
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dir, "../.env.local");
let SUPABASE_URL = "";
let SUPABASE_ANON_KEY = "";
try {
  const env = readFileSync(envPath, "utf8");
  for (const line of env.split("\n")) {
    const [k, ...v] = line.split("=");
    if (k?.trim() === "NEXT_PUBLIC_SUPABASE_URL") SUPABASE_URL = v.join("=").trim();
    if (k?.trim() === "NEXT_PUBLIC_SUPABASE_ANON_KEY") SUPABASE_ANON_KEY = v.join("=").trim();
  }
} catch {
  // no .env.local — skip direct Supabase tests
}

// ─── Tiny test runner ───────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅  ${name}`);
    results.push({ name, status: "PASS" });
    passed++;
  } catch (err) {
    console.error(`  ❌  ${name}`);
    console.error(`       ${err.message}`);
    results.push({ name, status: "FAIL", error: err.message });
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message ?? "Assertion failed");
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function get(path) {
  return fetch(`${BASE_URL}${path}`);
}

async function post(path, body) {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function futureDate(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function pastDate(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

// ─── Tests ──────────────────────────────────────────────────────────────────

console.log(`\n🧪  PrepWise AI — Test Suite`);
console.log(`   Target: ${BASE_URL}\n`);

// 1. Homepage
await test("GET / — homepage returns 200", async () => {
  const res = await get("/");
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const html = await res.text();
  assert(html.includes("PrepWise"), "Page HTML should contain 'PrepWise'");
});

// 2. Attribution
await test("GET / — page contains 'Nduhura Marvin' attribution", async () => {
  const res = await get("/");
  const html = await res.text();
  assert(
    html.toLowerCase().includes("nduhura") || html.toLowerCase().includes("marvin"),
    "Footer should contain 'Nduhura Marvin'"
  );
});

// 3. Plans page
await test("GET /plans — plans page returns 200", async () => {
  const res = await get("/plans");
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const html = await res.text();
  assert(html.length > 200, "Plans page response seems too short");
});

// 4. Supabase direct connectivity
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  await test("Supabase — anon key connects, no 401 on study_plans", async () => {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/study_plans?select=id&order=created_at.desc&limit=5`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    assert(res.status !== 401, `Got 401 — anon key is invalid or RLS is blocking`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    const json = await res.json();
    assert(Array.isArray(json), "Should return an array of plans");
    console.log(`       Found ${json.length} plan(s) in the database`);
  });

  await test("Supabase — can INSERT and DELETE a test plan", async () => {
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/study_plans`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        subject: "__test_subject__",
        topics: "__test_topics__",
        exam_date: futureDate(5),
        plan_content: "__test_plan__",
      }),
    });
    assert(insertRes.status === 201, `INSERT failed with status ${insertRes.status}`);
    const [inserted] = await insertRes.json();
    assert(inserted?.id, "Inserted record should have an id");
    console.log(`       Inserted test record id: ${inserted.id}`);

    // Clean up
    const deleteRes = await fetch(
      `${SUPABASE_URL}/rest/v1/study_plans?id=eq.${inserted.id}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    assert(
      deleteRes.status === 200 || deleteRes.status === 204,
      `DELETE failed with status ${deleteRes.status}`
    );
    console.log(`       Deleted test record successfully`);
  });
} else {
  console.log("  ⚠️   Skipping direct Supabase tests (no .env.local found)\n");
}

// 5. Generate — valid payload
await test("POST /api/generate — valid payload returns a study plan", async () => {
  const res = await post("/api/generate", {
    subject: "Mathematics",
    topics: "Algebra, Calculus, Trigonometry",
    examDate: futureDate(14),
  });
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const json = await res.json();
  assert(typeof json.plan === "string", "Response must have a 'plan' string");
  assert(json.plan.length > 100, "Generated plan seems too short");
  assert(!json.error, `Unexpected error in response: ${json.error}`);
  console.log(`       Plan snippet: "${json.plan.slice(0, 80).replace(/\n/g, " ")}..."`);
});

// 6. Generate — missing fields
await test("POST /api/generate — missing fields returns 400", async () => {
  const res = await post("/api/generate", { subject: "Physics" });
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  const json = await res.json();
  assert(typeof json.error === "string", "Response should contain an 'error' message");
});

// 7. Generate — past exam date
await test("POST /api/generate — past exam date returns 400", async () => {
  const res = await post("/api/generate", {
    subject: "History",
    topics: "World War II, Cold War",
    examDate: pastDate(3),
  });
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  const json = await res.json();
  assert(typeof json.error === "string", "Response should contain an 'error' message");
  console.log(`       Error message: "${json.error}"`);
});

// 8. Generate — empty string fields
await test("POST /api/generate — empty string fields returns 400", async () => {
  const res = await post("/api/generate", { subject: "", topics: "", examDate: "" });
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  const json = await res.json();
  assert(typeof json.error === "string", "Response should contain an 'error' message");
});

// 9. Generate — 1-day timeline
await test("POST /api/generate — 1-day timeline returns a valid plan", async () => {
  const res = await post("/api/generate", {
    subject: "Biology",
    topics: "Cell structure",
    examDate: futureDate(1),
  });
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const json = await res.json();
  assert(typeof json.plan === "string" && json.plan.length > 50, "Plan should be returned for 1-day timeline");
});

// 10. Generate — response shape
await test("POST /api/generate — success response shape is correct", async () => {
  const res = await post("/api/generate", {
    subject: "Computer Science",
    topics: "Data Structures, Algorithms, OS",
    examDate: futureDate(10),
  });
  const json = await res.json();
  if (res.status === 200) {
    assert(!("error" in json), "Successful response must not include an 'error' key");
    assert("plan" in json, "Successful response must include a 'plan' key");
  } else {
    throw new Error(`Unexpected status ${res.status}: ${json.error}`);
  }
});

// ─── Summary ────────────────────────────────────────────────────────────────

console.log("\n─────────────────────────────────────────");
console.log(`  Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);

if (failed > 0) {
  console.log("\n  Failed tests:");
  results
    .filter((r) => r.status === "FAIL")
    .forEach((r) => console.log(`    • ${r.name}\n      ${r.error}`));
  console.log("");
  process.exit(1);
} else {
  console.log("  🎉  All tests passed!\n");
  process.exit(0);
}
