#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import {
  basename,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";

const WORKER_MODEL = "gpt-5.6-luna";
const WORKER_REASONING = "xhigh";
const REQUIRED_WORKER_COUNT = 3;
const HARD_MAX_CONCURRENCY = REQUIRED_WORKER_COUNT;
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;
const KILL_GRACE_MS = 5 * 1000;
const DEFAULT_CODEX_BIN = "/Applications/ChatGPT.app/Contents/Resources/codex";
const MAX_CAPTURE_CHARS = 64_000;
const WORKER_REPORT_SCHEMA = {
  type: "object",
  properties: {
    status: { type: "string", enum: ["ok", "partial", "blocked"] },
    summary: { type: "string", minLength: 1 },
    files: { type: "array", items: { type: "string" } },
    verification: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
  },
  required: ["status", "summary", "files", "verification", "risks"],
  additionalProperties: false,
};

const activeChildren = new Set();
let interrupted = false;

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

function parsePositiveInteger(raw, label) {
  if (!/^\d+$/.test(raw)) fail(`${label} must be an integer`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) fail(`${label} must be a positive integer`);
  return value;
}

function parseArgs(argv) {
  const options = {
    codexBin: process.env.CODEX_BIN || (existsSync(DEFAULT_CODEX_BIN) ? DEFAULT_CODEX_BIN : "codex"),
    cwd: process.cwd(),
    maxConcurrency: REQUIRED_WORKER_COUNT,
    spec: undefined,
    timeoutMs: DEFAULT_TIMEOUT_MS,
    tempRoot: tmpdir(),
    traceDir: undefined,
    codexHome: process.env.CODEX_HOME || "",
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
      options.maxConcurrency = parsePositiveInteger(value, "--max-concurrency");
      index += 1;
    } else if (arg === "--timeout-ms" && value) {
      options.timeoutMs = parsePositiveInteger(value, "--timeout-ms");
      index += 1;
    } else if (arg === "--temp-root" && value) {
      options.tempRoot = value;
      index += 1;
    } else if (arg === "--trace-dir" && value) {
      options.traceDir = value;
      index += 1;
    } else if (arg === "--codex-home" && value) {
      options.codexHome = value;
      index += 1;
    } else if (arg === "--codex-bin" && value) {
      options.codexBin = value;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      process.stdout.write(
        "Usage: node run-luna-workers.mjs --spec tasks.json [--cwd PATH] [--max-concurrency 3] [--timeout-ms N] [--temp-root PATH] [--trace-dir PATH] [--codex-home PATH] [--codex-bin PATH]\n",
      );
      process.exit(0);
    } else {
      fail(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (!options.spec) fail("--spec is required");
  if (options.maxConcurrency !== HARD_MAX_CONCURRENCY) {
    fail(`--max-concurrency must be exactly ${HARD_MAX_CONCURRENCY}`);
  }
  options.cwd = resolve(options.cwd);
  options.spec = isAbsolute(options.spec) ? options.spec : resolve(options.spec);
  options.tempRoot = resolve(options.tempRoot);
  if (options.traceDir) options.traceDir = resolve(options.traceDir);
  if (options.codexHome) options.codexHome = resolve(options.codexHome);
  return options;
}

function appendBounded(current, chunk) {
  const combined = current + chunk.toString("utf8");
  return combined.length <= MAX_CAPTURE_CHARS ? combined : combined.slice(-MAX_CAPTURE_CHARS);
}

function safeTaskName(id) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function validateSpec(spec) {
  if (!spec || !Array.isArray(spec.tasks) || spec.tasks.length !== REQUIRED_WORKER_COUNT) {
    fail(`Spec must contain exactly ${REQUIRED_WORKER_COUNT} tasks`);
  }

  const ids = new Set();
  for (const task of spec.tasks) {
    if (!task || typeof task.id !== "string" || !task.id.trim()) {
      fail("Every task requires a non-empty string id");
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(task.id)) {
      fail(`Task id ${task.id} may contain only letters, numbers, underscores, and hyphens`);
    }
    if (ids.has(task.id)) fail(`Duplicate task id: ${task.id}`);
    ids.add(task.id);
    if (typeof task.prompt !== "string" || !task.prompt.trim()) {
      fail(`Task ${task.id} requires a non-empty prompt`);
    }
    if (task.cwd !== undefined && (typeof task.cwd !== "string" || !task.cwd.trim())) {
      fail(`Task ${task.id} cwd must be a non-empty string when provided`);
    }
    if (task.sandbox !== undefined && !["read-only", "workspace-write"].includes(task.sandbox)) {
      fail(`Task ${task.id} sandbox must be read-only or workspace-write`);
    }
  }
}

function workerPrompt(task) {
  return [
    "You are a bounded worker in an orchestrated Codex workflow.",
    "Complete only the assigned task. Do not spawn subagents, broaden scope, or perform unrelated external actions.",
    "Preserve existing user changes. Do not return raw logs or markdown fences.",
    "Return only a JSON object with exactly these fields:",
    "status (one of: ok, partial, blocked), summary (string), files (string array), verification (string array), risks (string array).",
    "The summary must state findings or changes. Include commands/tests in verification and unresolved issues in risks.",
    "",
    "ASSIGNED TASK:",
    task.prompt,
  ].join("\n");
}

function reportError(message) {
  return { ok: false, error: message };
}

function parseWorkerReport(finalMessage) {
  let parsed;
  try {
    parsed = JSON.parse(finalMessage);
  } catch {
    return reportError("Worker final message was not valid JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return reportError("Worker report must be a JSON object");
  }

  const required = ["status", "summary", "files", "verification", "risks"];
  const unexpected = Object.keys(parsed).filter((key) => !required.includes(key));
  if (unexpected.length > 0) {
    return reportError(`Worker report has unexpected fields: ${unexpected.join(", ")}`);
  }
  for (const key of required) {
    if (!(key in parsed)) return reportError(`Worker report is missing ${key}`);
  }
  if (!["ok", "partial", "blocked"].includes(parsed.status)) {
    return reportError("Worker report status must be ok, partial, or blocked");
  }
  if (typeof parsed.summary !== "string" || !parsed.summary.trim()) {
    return reportError("Worker report summary must be a non-empty string");
  }
  for (const key of ["files", "verification", "risks"]) {
    if (!Array.isArray(parsed[key]) || parsed[key].some((item) => typeof item !== "string")) {
      return reportError(`Worker report ${key} must be a string array`);
    }
  }
  return { ok: true, report: parsed };
}

async function resolveWithinRoot(rootCwd, candidate) {
  const candidatePath = isAbsolute(candidate) ? candidate : resolve(rootCwd, candidate);
  const candidateCwd = await realpath(candidatePath);
  const relativePath = relative(rootCwd, candidateCwd);
  if (relativePath === ".." || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    throw new Error(`Task cwd escapes target repository: ${candidateCwd}`);
  }
  return candidateCwd;
}

async function persistTrace(traceDir, taskId, stdout, stderr) {
  if (!traceDir) return {};
  await mkdir(traceDir, { recursive: true });
  const name = safeTaskName(taskId);
  const stdoutPath = join(traceDir, `${name}.stdout.jsonl`);
  const stderrPath = join(traceDir, `${name}.stderr.log`);
  await writeFile(stdoutPath, stdout, "utf8");
  await writeFile(stderrPath, stderr, "utf8");
  return { traceStdout: stdoutPath, traceStderr: stderrPath };
}

function killChild(child, signal) {
  try {
    if (child && !child.killed) child.kill(signal);
  } catch {
    // The child may have exited between the check and kill.
  }
}

function waitForChild(child, timeoutMs, onError) {
  return new Promise((resolveExit) => {
    let settled = false;
    let timeoutHandle;
    let killHandle;
    let timedOut = false;

    const finish = (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutHandle);
      clearTimeout(killHandle);
      activeChildren.delete(child);
      resolveExit({ code, timedOut });
    };

    timeoutHandle = setTimeout(() => {
      timedOut = true;
      killChild(child, "SIGTERM");
      killHandle = setTimeout(() => killChild(child, "SIGKILL"), KILL_GRACE_MS);
    }, timeoutMs);

    activeChildren.add(child);
    child.once("error", (error) => {
      onError(error);
      finish(1);
    });
    child.once("close", (code) => finish(code ?? 1));
  });
}

async function safeRemove(path) {
  if (!path) return "";
  try {
    await rm(path, { recursive: true, force: true });
    return "";
  } catch (error) {
    return `Temporary cleanup failed: ${error.message}`;
  }
}

async function runTask(task, options, rootCwd) {
  const startedAt = Date.now();
  let taskCwd = "";
  let tempDirectory = "";
  let stdout = "";
  let stderr = "";
  let child;
  let spawnError;
  let timedOut = false;

  try {
    taskCwd = await resolveWithinRoot(rootCwd, task.cwd || rootCwd);
    tempDirectory = await mkdtemp(join(options.tempRoot, `codex-luna-${safeTaskName(task.id)}-`));
    const finalMessagePath = join(tempDirectory, "final.json");
    const schemaPath = join(tempDirectory, "worker-report.schema.json");
    await writeFile(schemaPath, JSON.stringify(WORKER_REPORT_SCHEMA, null, 2), "utf8");
    const sandbox = task.sandbox || "read-only";
    const args = [
      "exec",
      "--strict-config",
      "--ignore-user-config",
      "--ephemeral",
      "--json",
      "--skip-git-repo-check",
      ...(options.codexHome ? ["--add-dir", options.codexHome] : []),
      "--add-dir",
      tempDirectory,
      "--sandbox",
      sandbox,
      "--model",
      WORKER_MODEL,
      "--config",
      `model_reasoning_effort=\"${WORKER_REASONING}\"`,
      "--config",
      "agents.enabled=false",
      "--output-schema",
      schemaPath,
      "--output-last-message",
      finalMessagePath,
      workerPrompt(task),
    ];
    const workerEnv = options.codexHome
      ? { ...process.env, CODEX_HOME: options.codexHome }
      : process.env;

    const childResult = await new Promise((resolveTask) => {
      try {
        child = spawn(options.codexBin, args, {
          cwd: taskCwd,
          env: workerEnv,
          shell: false,
          stdio: ["ignore", "pipe", "pipe"],
        });
        child.stdout.on("data", (chunk) => {
          stdout = appendBounded(stdout, chunk);
        });
        child.stderr.on("data", (chunk) => {
          stderr = appendBounded(stderr, chunk);
        });
        waitForChild(child, options.timeoutMs, (error) => {
          spawnError = error;
        }).then(resolveTask);
      } catch (error) {
        spawnError = error;
        resolveTask({ code: 1, timedOut: false });
      }
    });
    timedOut = childResult.timedOut;

    const finalMessage = await readFile(finalMessagePath, "utf8").catch(() => "");
    const reportResult = parseWorkerReport(finalMessage.trim());
    const trace = await persistTrace(options.traceDir, task.id, stdout, stderr);
    const reportReady = reportResult.ok && reportResult.report.status === "ok";
    const reportStatusError = reportResult.ok && !reportReady
      ? `Worker report status is ${reportResult.report.status}`
      : "";
    const runtimeStateHint = /readonly database|failed to initialize in-process app-server client/i.test(stderr)
      ? " Codex runtime state is not writable; provide an authenticated writable --codex-home for read-only repository workers."
      : "";
    const baseError = spawnError?.message
      || (timedOut ? `Worker timed out after ${options.timeoutMs}ms` : "")
      || (childResult.code !== 0 ? stderr.trim() || stdout.trim() || "Worker failed" : "")
      || (!reportResult.ok ? reportResult.error : "")
      || reportStatusError;
    const error = `${baseError}${runtimeStateHint}`;
    const ok = childResult.code === 0 && !spawnError && !timedOut && reportReady;

    return {
      id: task.id,
      ok,
      exitCode: childResult.code,
      durationMs: Date.now() - startedAt,
      cwd: taskCwd,
      sandbox,
      report: reportResult.report,
      error: error || (reportResult.ok ? "" : reportResult.error),
      ...trace,
    };
  } catch (error) {
    return {
      id: task.id,
      ok: false,
      exitCode: 1,
      durationMs: Date.now() - startedAt,
      cwd: taskCwd,
      error: error.message,
    };
  } finally {
    if (child && activeChildren.has(child)) killChild(child, interrupted ? "SIGTERM" : "SIGKILL");
    activeChildren.delete(child);
    const cleanupError = await safeRemove(tempDirectory);
    if (cleanupError) process.stderr.write(`${cleanupError}\n`);
  }
}

function interruptChildren() {
  interrupted = true;
  for (const child of activeChildren) {
    killChild(child, "SIGTERM");
    const hardKill = setTimeout(() => killChild(child, "SIGKILL"), KILL_GRACE_MS);
    hardKill.unref?.();
  }
}

process.on("SIGINT", interruptChildren);
process.on("SIGTERM", interruptChildren);

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(options.tempRoot, { recursive: true });
  if (options.codexHome) await mkdir(options.codexHome, { recursive: true });
  const rootCwd = await realpath(options.cwd);
  const spec = JSON.parse(await readFile(options.spec, "utf8"));
  validateSpec(spec);

  const results = new Array(spec.tasks.length);
  let nextTask = 0;
  const lanes = Array.from({ length: REQUIRED_WORKER_COUNT }, async () => {
    while (true) {
      const index = nextTask;
      nextTask += 1;
      if (index >= spec.tasks.length) return;
      results[index] = await runTask(spec.tasks[index], options, rootCwd);
    }
  });
  await Promise.all(lanes);

  const output = {
    ok: !interrupted && results.length === REQUIRED_WORKER_COUNT && results.every((result) => result.ok),
    workerCount: results.length,
    expectedWorkerCount: REQUIRED_WORKER_COUNT,
    workerModel: WORKER_MODEL,
    workerReasoningEffort: WORKER_REASONING,
    maxConcurrency: options.maxConcurrency,
    timeoutMs: options.timeoutMs,
    traceDir: options.traceDir || "",
    codexHome: options.codexHome || "",
    results,
  };
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  if (!output.ok) process.exitCode = interrupted ? 130 : 1;
}

main().catch((error) => {
  process.stderr.write(`${basename(process.argv[1])}: ${error.stack || error.message}\n`);
  process.exitCode = 1;
});
