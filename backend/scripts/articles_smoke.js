/**
 * Quick article API smoke script.
 * Usage:
 *   API_BASE_URL=http://localhost:4000 node backend/scripts/articles_smoke.js
 */

const BASE_URL = process.env.API_BASE_URL || "http://localhost:4000";

const tests = [
  { name: "default list", path: "/articles" },
  { name: "page=0 (invalid, expect fallback/400)", path: "/articles?page=0" },
  { name: "page=-1 (invalid, expect fallback/400)", path: "/articles?page=-1" },
  { name: "pageSize=100 (should cap to 50)", path: "/articles?pageSize=100" },
  { name: "unknown sort (should fallback)", path: "/articles?sort=foo" },
  { name: "unknown status (should fallback)", path: "/articles?status=bad" },
  { name: "status=all", path: "/articles?status=all" },
  { name: "empty result keyword", path: "/articles?q=__no_such_keyword__" },
  { name: "detail 404", path: "/articles/nope-slug", expectStatus: 404 },
];

async function runTest(test) {
  const url = `${BASE_URL}${test.path}`;
  const res = await fetch(url, { method: "GET" });
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text();

  const okStatus = test.expectStatus ?? 200;
  const pass = Array.isArray(okStatus)
    ? okStatus.includes(res.status)
    : res.status === okStatus;

  console.log(`\n[${test.name}] ${url}`);
  console.log(`status=${res.status} ${pass ? "(ok)" : "(unexpected)"}`);

  if (isJson && body) {
    if (body.meta) {
      console.log(
        `meta: total=${body.meta.total}, page=${body.meta.page}, pageSize=${body.meta.pageSize}, totalPages=${body.meta.totalPages}, hasNext=${body.meta.hasNext}`
      );
    }
    if (Array.isArray(body.data)) {
      console.log(`data length: ${body.data.length}`);
    } else if (Array.isArray(body)) {
      console.log(`array length: ${body.length}`);
    } else if (body.message) {
      console.log(`message: ${body.message}`);
    }
  } else {
    console.log(String(body).slice(0, 200));
  }
}

async function main() {
  for (const test of tests) {
    try {
      await runTest(test);
    } catch (error) {
      console.error(`\n[${test.name}] failed:`, error);
    }
  }
}

main();
