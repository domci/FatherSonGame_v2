#!/usr/bin/env bun
// Roll prod back to the previous worker version (or <version-id>).
// bun run rollback:prod [-- --version <id>] [--dry-run]
// Code only: D1/Durable Object migrations are not reverted, and wrangler refuses to roll back across one.
import { spawnSync } from "node:child_process";

const worker = "bruchlandung";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const v = args.indexOf("--version");
const version = v >= 0 ? args[v + 1] : undefined;

const cmd = [
  "bunx",
  "wrangler",
  "rollback",
  ...(version ? [version] : []),
  "--name",
  worker,
  "--message",
  `rollback ${new Date().toISOString()}`,
  "--yes",
];
console.info(`[rollback] ${dryRun ? "dry run, would run" : "running"}: ${cmd.join(" ")}`);
process.exit(dryRun ? 0 : (spawnSync("bunx", cmd.slice(1), { stdio: "inherit" }).status ?? 1));
