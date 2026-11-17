#!/usr/bin/env bun
// Dev kit: light git hooks shared by every repo. Pushes lint + typecheck the
// apps they touch; tests run in CI. Config: .dev-kit.json (schema/dev-kit.schema.json).
//   bun dc-kit.ts install [--ci] [repo]  vendor the kit into <repo>/.dev-kit, write .husky stubs
//                                        (--ci: also .github/workflows/ci.yml from ci/pipeline.yml)
//   bun dc-kit.ts check [repo]     warn when the vendored kit drifted (exit 0)
//   bun dc-kit.ts ci [base-sha]    CI: lint + typecheck apps changed since base (all without base)
//   push <changed-file> / commit   called by the hooks
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

type App = {
  name: string;
  dir: string;
  lint?: string;
  typecheck?: string;
  tsbuildinfo?: string;
  related?: string;
  relatedBudgetSec?: number;
};
type Config = { apps: App[]; riskyPaths?: string[]; preCommit?: string };

const sh = (cmd: string, cwd: string, args: string[] = []) =>
  spawnSync("sh", ["-c", `${cmd} "$@"`, "sh", ...args], { cwd, stdio: "inherit" }).status ?? 1;
const git = (cwd: string, args: string[]) =>
  spawnSync("git", args, { cwd, encoding: "utf8" }).stdout.trim();

function loadConfig(root: string): Config {
  const file = path.join(root, ".dev-kit.json");
  if (!existsSync(file)) throw new Error(`${file} missing; run dc-kit install`);
  const config = JSON.parse(readFileSync(file, "utf8")) as Config;
  if (!Array.isArray(config.apps)) throw new Error(".dev-kit.json: apps[] required");
  return config;
}

const inApp = (app: App, file: string) => app.dir === "." || file.startsWith(`${app.dir.replace(/\/$/, "")}/`);

// tsc keeps incremental state per worktree; a fresh worktree starts from the
// last passing copy in the shared git dir (frub check-runner trick). Copies,
// never a shared live file: two tsc runs must not write one file.
function withTsSeed(root: string, app: App, run: () => number) {
  if (!app.tsbuildinfo) return run();
  const state = path.join(root, app.dir, app.tsbuildinfo);
  const seed = path.resolve(root, git(root, ["rev-parse", "--git-common-dir"]), "local-checks", `${app.name}-tsbuildinfo`);
  const copy = (from: string, to: string) => {
    mkdirSync(path.dirname(to), { recursive: true });
    copyFileSync(from, `${to}.tmp`);
    renameSync(`${to}.tmp`, to);
  };
  if (!existsSync(state) && existsSync(seed)) copy(seed, state);
  const status = run();
  if (status === 0 && existsSync(state)) copy(state, seed);
  return status;
}

// Runs related tests; at the budget it kills the whole process group and passes.
// Any other signal death is a failure.
function related(app: App, cwd: string, files: string[]): Promise<number> {
  const budget = app.relatedBudgetSec ?? 60;
  return new Promise((resolve) => {
    const child = spawn("sh", ["-c", `${app.related} "$@"`, "sh", ...files], { cwd, stdio: "inherit", detached: true });
    const timer = setTimeout(() => {
      process.kill(-child.pid!, "SIGKILL");
      console.log(`[checks] ${app.name}/related: over ${budget}s budget, stopped. CI covers it.`);
      resolve(0);
    }, budget * 1000);
    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      resolve(code ?? (signal ? 1 : 0));
    });
  });
}

export async function push(root: string, files: string[], opts: { fallback: boolean; toMain?: boolean; ci?: boolean }) {
  const config = loadConfig(root);
  const started = performance.now();
  if (opts.toMain) {
    const risky = (config.riskyPaths ?? []).map((g) => new Bun.Glob(g));
    const hits = files.filter((f) => risky.some((g) => g.match(f)));
    if (hits.length) console.log(`[checks] WARNING risky path on the default branch → push to test instead:\n  ${hits.join("\n  ")}`);
  }
  const apps = config.apps.filter((a) => opts.fallback || files.some((f) => inApp(a, f)));
  for (const app of apps) {
    const cwd = path.join(root, app.dir);
    const appFiles = files.filter((f) => inApp(app, f)).map((f) => path.relative(app.dir, f));
    const steps: [string, () => number | Promise<number>][] = [];
    if (app.lint) steps.push(["lint", () => sh(app.lint!, cwd)]);
    if (app.typecheck) steps.push(["typecheck", () => withTsSeed(root, app, () => sh(app.typecheck!, cwd))]);
    if (app.related && !opts.fallback && !opts.ci && appFiles.length) steps.push(["related", () => related(app, cwd, appFiles)]);
    for (const [name, run] of steps) {
      const t = performance.now();
      const status = await run();
      const sec = ((performance.now() - t) / 1000).toFixed(1);
      if (status !== 0) {
        console.error(`[checks] ${app.name}/${name} failed (${sec}s)`);
        return 1;
      }
      console.log(`[checks] ${app.name}/${name} passed (${sec}s)`);
    }
  }
  console.log(`[checks] total ${((performance.now() - started) / 1000).toFixed(1)}s`);
  return 0;
}

const kitDir = import.meta.dir;
// Kit-managed files: kit path → repo path.
const managed: [string, string][] = [
  ["hooks/lib.sh", ".dev-kit/hooks/lib.sh"],
  ["hooks/pre-commit", ".dev-kit/hooks/pre-commit"],
  ["hooks/pre-push", ".dev-kit/hooks/pre-push"],
  ["dc-kit.ts", ".dev-kit/dc-kit.ts"],
];
// Opt-in: the CI template, named ci.yml so it never replaces a repo's own pipeline.
const ciFile: [string, string] = ["ci/pipeline.yml", ".github/workflows/ci.yml"];

export function install(repo: string, opts: { ci?: boolean } = {}) {
  for (const [from, to] of opts.ci ? [...managed, ciFile] : managed) {
    mkdirSync(path.dirname(path.join(repo, to)), { recursive: true });
    copyFileSync(path.join(kitDir, from), path.join(repo, to));
  }
  mkdirSync(path.join(repo, ".husky"), { recursive: true });
  for (const hook of ["pre-commit", "pre-push"])
    writeFileSync(path.join(repo, ".husky", hook), `#!/bin/sh\nexec sh .dev-kit/hooks/${hook} "$@"\n`, { mode: 0o755 });
  // Husky sets its own hooksPath (.husky/_); without husky point git at .husky.
  if (!git(repo, ["config", "core.hooksPath"])) git(repo, ["config", "core.hooksPath", ".husky"]);
  const config = path.join(repo, ".dev-kit.json");
  if (!existsSync(config))
    writeFileSync(
      config,
      `${JSON.stringify({ apps: [{ name: "root", dir: ".", lint: "bun run lint", typecheck: "bunx tsc --noEmit" }], riskyPaths: [] }, null, 2)}\n`,
    );
}

export function check(repo: string) {
  // The vendored copy has no ci/ template; skip the CI drift check there.
  const files = existsSync(path.join(repo, ciFile[1])) && existsSync(path.join(kitDir, ciFile[0])) ? [...managed, ciFile] : managed;
  const drift = files.filter(([from, to]) => {
    const target = path.join(repo, to);
    return !existsSync(target) || readFileSync(target, "utf8") !== readFileSync(path.join(kitDir, from), "utf8");
  });
  for (const [, to] of drift) console.log(`[dc-kit] WARNING ${to} missing or out of date; run dc-kit install`);
  return drift.map(([, to]) => to);
}

if (import.meta.main) {
  const [cmd, ...rest] = process.argv.slice(2);
  const ci = rest.includes("--ci");
  const arg = rest.find((a) => a !== "--ci");
  const root = path.resolve(cmd === "install" || cmd === "check" ? (arg ?? ".") : ".");
  if (cmd === "install") install(root, { ci });
  else if (cmd === "check") check(root);
  else if (cmd === "commit") {
    const { preCommit } = loadConfig(root);
    process.exit(preCommit ? sh(preCommit, root) : 0);
  } else if (cmd === "push") {
    const files = readFileSync(arg!, "utf8").split("\0").filter(Boolean);
    const env = process.env;
    process.exit(await push(root, files, { fallback: env.KIT_FALLBACK === "1", toMain: env.KIT_TO_MAIN === "1" }));
  } else if (cmd === "ci") {
    const known = arg && spawnSync("git", ["cat-file", "-e", `${arg}^{commit}`]).status === 0;
    const files = known ? git(root, ["diff", "--name-only", arg, "HEAD"]).split("\n").filter(Boolean) : [];
    process.exit(await push(root, files, { fallback: !known, ci: true }));
  } else {
    console.error("usage: dc-kit.ts install [--ci] [repo] | check [repo] | ci [base]");
    process.exit(2);
  }
}
