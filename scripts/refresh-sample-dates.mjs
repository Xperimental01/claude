/**
 * Stamps the build date into src/data/build-info.json.
 *
 * The sample event list uses fixed calendar dates. Left alone, those dates fall
 * into the past and the dashboard silently empties out (14 of 16 seed events
 * had already expired before this existed). events-data.ts rebases sample dates
 * against this stamp so the demo content stays plausible on every rebuild.
 *
 * The value must be a BUILD-TIME constant, not `new Date()` evaluated at
 * runtime: the site is statically prerendered, so a runtime clock would make
 * the server-rendered HTML disagree with client hydration.
 *
 * Run: node scripts/refresh-sample-dates.mjs
 */

import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = join(__dirname, "../src/data/build-info.json");

const now = new Date();
const builtOn = now.toISOString().slice(0, 10); // YYYY-MM-DD

mkdirSync(dirname(OUT_FILE), { recursive: true });
writeFileSync(
  OUT_FILE,
  `${JSON.stringify({ builtOn, builtAt: now.toISOString() }, null, 2)}\n`,
);

console.log(`build-info.json stamped with builtOn=${builtOn}`);
