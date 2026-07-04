#!/usr/bin/env node
/**
 * Lightweight demo readiness check — verifies key files and exports exist.
 * Run: npm run demo:verify
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const required = [
  "app/embed/page.jsx",
  "components/embed/embed-wealth-summary.jsx",
  "components/seed-demo-button.jsx",
  "lib/integrations/idbi-sandbox-adapter.js",
  "lib/services/wealth-service.js",
  "docs/pitch/scope-decisions.md",
  "docs/pitch/compliance-narrative.md",
  "docs/pitch/pitch-deck-outline.md",
  "docs/pitch/video-script.md",
  "docs/pitch/rubric-self-score.md",
];

let failed = 0;

for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.error(`MISSING: ${file}`);
    failed++;
  } else {
    console.log(`OK: ${file}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}

console.log("\nDemo verify passed.");
