#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join, resolve } from "node:path";

const WORKER_MODEL = "gpt-5.6-luna";
const WORKER_REASONING = "xhigh";
const HARD_MAX_CONCURRENCY = 4;
const DEFAULT_CODEX_BIN = "/Applications/ChatGPT.app/Contents/Resources/codex";
const MAX_CAPTURE_CHARS = 64_000;

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

function parseArgs(argv) {
  const options = {
    codexBin: process.env.CODEX_BIN || (existsSync(DEFAULT_CODEX_BIN) ? DEFAULT_CODEX_BIN : "codex"),
    cwd: process.cwd(),
    maxConcurrency: HARD_MAX_CONCURRENCY,
    spec: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];
    if (arg === "--spec" && value) {
      options.spec = value;
      index += 1;
    } else if (arg === "--cwd" && value) {
      options.cwd = value;
      index += 1;
    } else if (arg === "--max-concurrency" && value) {
      options.maxConcurrency = Number.parseInt(value, 10);
      index += 1;
    } else if (arg === "--codex-bin" && value) {
      options.codexBin = value;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "Usage: node run-luna-workers.mjs --spec tasks.json [--cwd PATH] [--max-concurrency 1-4] [--codex-bin PATH]\n",
      );
      process.exit(0);
    } else {
      fail(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!options.spec) fail("--spec is required");
  if (!Number.isInteger(options.maxConcurrency) || options.maxConcurrency < 1 || options.maxConcurrency > HARD_MAX_CONCURRENCY) {
    fail(`--max-concurrency must be an integer from 1 to ${HARD_MAX_CONCURRENCY}`);
  }
  options.cwd = resolve(options.cwd);
  options.spec = isAbsolute(options.spec) ? options.spec : resolve(options.spec);
  return options;
}

function appendBounded(current, chunk) {
  const combined = current + chunk.toString("utf8");
  return combined.length <= MAX_CAPTURE_CHARS ? combined : combined.slice(-MAX_CAPTURE_CHARS);
}

function validateSpec(spec) {
  if (!spec || !Array.isArray(spec.tasks) || spec.tasks.length === 0) {
    fail("Spec must contain a non-empty tasks array");
  }

  const ids = new Set();
  for (const task of spec.tasks) {
    if (!task || typeof task.id !== "string" || !task.id.trim()) fail("Every task requires a non-empty string id");
    if (ids.has(task.id)) fail(`Duplicate task id: ${task.id}`);
    ids.add(task.id);
    if (typeof task.prompt !== "string" || !task.prompt.trim()) fail(`Task ${task.id} requires a non-empty prompt`);
    if (task.sandbox !== undefined && !["read-only", "workspace-write"].includes(task.sandbox)) {
      fail(`Task ${task.id} sandbox must be read-only or workspace-write`);
    }
  }
}

function workerPrompt(task) {
  return [
    "You are a bounded worker in an orchestrated Codex workflow.",
    "Complete only the assigned task. Do not spawn subagents, broaden scope, or perform unrelated external actions.",
    "Preserve existing user changes. Keep raw logs concise.",
    "Unless the task requests an exact output, report: findings or changes, files inspected or modified, verification run, and remaining risks.",
    "",
    "ASSIGNED TASK:",
    task.prompt,
  ].join("\n");
}

async function runTask(task, options) {
  const taskCwd = resolve(task.cwd || options.cwd);
  const sandbox = task.sandbox || "read-only";
  const tempDirectory = await mkdtemp(join(tmpdir(), `codex-luna-${task.id.replace(/[^a-zA-Z0-9_-]/g, "_")}-`));
  const finalMessagePath = join(tempDirectory, "final.txt");
  const args = [
    "exec",
    "--strict-config",
    "--json",
    "--skip-git-repo-check",
    "--sandbox",
    sandbox,
    "--model",
    WORKER_MODEL,
    "--config",
    `model_reasoning_effort=\"${WORKER_REASONING}\"`,
    "--config",
    "agents.enabled=false",
    "--output-last-message",
    finalMessagePath,
    workerPrompt(task),
  ];

  let stdout = "";
  let stderr = "";
  let spawnError;
  const startedAt = Date.now();

  const exitCode = await new Promise((resolveExit) => {
    const child = spawn(options.codexBin, args, {
      cwd: taskCwd,
      env: process.env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    child.stdout.on("data", (chunk) => {
      stdout = appendBounded(stdout, chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr = appendBounded(stderr, chunk);
    });
    child.on("error", (error) => {
      spawnError = error;
    });
    child.on("close", (code) => resolveExit(code ?? 1));
  });

  let finalMessage = "";
  try {
    finalMessage = (await readFile(finalMessagePath, "utf8")).trim();
  } catch {
    finalMessage = "";
  }
  await rm(tempDirectory, { recursive: true, force: true });

  const ok = exitCode === 0 && !spawnError && finalMessage.length > 0;
  return {
    id: task.id,
    ok,
    exitCode,
    durationMs: Date.now() - startedAt,
    cwd: taskCwd,
    sandbox,
    finalMessage,
    error: spawnError?.message || (ok ? "" : stderr.trim() || stdout.trim() || "Worker produced no final message"),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const spec = JSON.parse(await readFile(options.spec, "utf8"));
  validateSpec(spec);

  const results = new Array(spec.tasks.length);
  let nextTask = 0;
  const workerCount = Math.min(options.maxConcurrency, spec.tasks.length);
  const lanes = Array.from({ length: workerCount }, async () => {
    while (true) {
      const index = nextTask;
      nextTask += 1;
      if (index >= spec.tasks.length) return;
      results[index] = await runTask(spec.tasks[index], options);
    }
  });
  await Promise.all(lanes);

  const output = {
    ok: results.every((result) => result.ok),
    workerModel: WORKER_MODEL,
    workerReasoningEffort: WORKER_REASONING,
    maxConcurrency: options.maxConcurrency,
    results,
  };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (!output.ok) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`${basename(process.argv[1])}: ${error.stack || error.message}\n`);
  process.exit(1);
});
