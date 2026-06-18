/**
 * PrepWise AI — Integration / Smoke Test Suite
 * Run: node tests/test.mjs [BASE_URL]
 *
 * Default BASE_URL: https://prep-wise-topaz-mu.vercel.app
 *
 * Tests:
 *  1. Homepage returns 200
 *  2. /plans page returns 200
 *  3. POST /api/generate — valid payload → returns a plan string
 *  4. POST /api/generate — missing fields → 400
 *  5. POST /api/generate — past exam date → 400
 *  6. POST /api/generate — unknown field still returns plan (resilience)
 */

const BASE_URL = process.argv[2] ?? "https://prep-wise-topaz-mu.vercel.app";

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
  const res = await fetch(`${BASE_URL}${path}`);
  return res;
}

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res;
}

/** Returns a date string N days from today in YYYY-MM-DD format */
function futureDate(days = 14) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/** Returns a past date in YYYY-MM-DD format */
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

// 2. Plans page
await test("GET /plans — plans page returns 200", async () => {
  const res = await get("/plans");
  assert(res.status === 200, `Expected 200, got ${res.status}`);
  const html = await res.text();
  assert(html.length > 200, "Plans page response seems too short");
});

// 3. Generate — valid payload
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

// 4. Generate — missing fields
await test("POST /api/generate — missing fields returns 400", async () => {
  const res = await post("/api/generate", {
    subject: "Physics",
    // topics and examDate intentionally omitted
  });
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  const json = await res.json();
  assert(typeof json.error === "string", "Response should contain an 'error' message");
});

// 5. Generate — past exam date
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

// 6. Generate — empty strings treated as missing
await test("POST /api/generate — empty string fields returns 400", async () => {
  const res = await post("/api/generate", {
    subject: "",
    topics: "",
    examDate: "",
  });
  assert(res.status === 400, `Expected 400, got ${res.status}`);
  const json = await res.json();
  assert(typeof json.error === "string", "Response should contain an 'error' message");
});

// 7. Generate — very short timeline (tomorrow)
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

// 8. Generate — response shape (no extra error key on success)
await test("POST /api/generate — success response has no error key", async () => {
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
