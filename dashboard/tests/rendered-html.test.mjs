import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("dashboard exposes exactly the six required observability groups", async () => {
  const page = await readFile(new URL("app/page.tsx", root), "utf8");
  const requiredPanels = ["LATENCY", "TRAFFIC", "ERRORS", "COST", "TOKENS", "QUALITY"];

  for (const panel of requiredPanels) {
    assert.match(page, new RegExp(`\\d{2} / ${panel}`));
  }
  assert.equal((page.match(/<article className="panel/g) ?? []).length, 6);
});

test("dashboard includes SLO thresholds and incident correlation evidence", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/layout.tsx", root), "utf8"),
  ]);

  assert.match(page, /SLO < 3,000 ms/);
  assert.match(page, /Objective < 2%/);
  assert.match(page, /Budget \$2\.50/);
  assert.match(page, /Objective ≥ 0\.75/);
  assert.match(page, /correlation req-d5a50490/);
  assert.match(layout, /AI Observability Dashboard/);
  assert.doesNotMatch(page, /SkeletonPreview|Your site is taking shape/);
});
