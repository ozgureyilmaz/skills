# EVMBench Setup Guide

## Prerequisites

- Docker
- Bun (for frontend)
- [uv](https://github.com/astral-sh/uv) (Python environment manager)
- API key for at least one model provider

## Repository Structure

```
paradigmxyz/evmbench
├── frontend/           Next.js UI (upload zip, select model, view results)
├── frontier-evals/     Pinned submodule (openai/frontier-evals)
├── backend/
│   ├── api/            FastAPI API (jobs, auth, integration)
│   ├── instancer/      RabbitMQ consumer; starts workers (Docker/K8s)
│   ├── secretsvc/      Bundle storage service
│   ├── resultsvc/      Results ingestion + persistence
│   ├── oai_proxy/      Optional OpenAI proxy (proxy-token mode)
│   ├── prunner/        Optional cleanup of stale workers
│   ├── worker_runner/  Detect prompt + model map + agent runner script
│   ├── docker/
│   │   ├── base/       Base image: agent runtime, foundry, slither, node, tools
│   │   ├── backend/    Backend services image
│   │   └── worker/     Worker image + entrypoint
│   └── compose.yml     Full stack (DB/MQ + services)
└── deploy/             Optional deployment scripts/examples
```

## Clone

```bash
git clone --recurse-submodules https://github.com/paradigmxyz/evmbench.git
cd evmbench
```

## Build Docker Images

### Base & Worker Images (required first)

```bash
cd backend
docker build -t evmbench/base:latest -f docker/base/Dockerfile .
docker build -t evmbench/worker:latest -f docker/worker/Dockerfile .
```

### Audit Images (for running the eval)

```bash
cd frontend-evals/project/evmbench
uv sync
# Build ploit-builder image first
docker build -f ploit/Dockerfile -t ploit-builder:latest --target ploit-builder .
# Build all audit images
uv run docker_build.py --split all
```

## Environment Variables

Set the API key for the agent you want to run:

| Variable | Agent |
|---|---|
| `ANTHROPIC_API_KEY` | Claude Code |
| `GEMINI_API_KEY` | Gemini CLI |
| `OPENROUTER_API_KEY` | OpenCode |

## Start Backend Stack

```bash
cd backend
cp .env.example .env
# For local dev, the placeholder secrets are sufficient.
docker compose up -d --build
```

## Start Frontend

```bash
cd frontend
bun install
bun dev
```

Open http://127.0.0.1:3000 (frontend) and http://127.0.0.1:1337/v1/integration/frontend (backend config).

## Running Evaluations

### Quick Test (human / no-op agent)

```bash
uv run python -m evmbench.nano.entrypoint \
    evmbench.audit_split=debug \
    evmbench.mode=detect \
    evmbench.apply_gold_solution=False \
    evmbench.log_to_run_dir=True \
    evmbench.solver=evmbench.nano.solver.EVMbenchSolver \
    evmbench.solver.agent_id=human
```

### Run a Real Agent

```bash
uv run python -m evmbench.nano.entrypoint \
    evmbench.audit=2024-04-noya \
    evmbench.mode=detect \
    evmbench.hint_level=none \
    evmbench.log_to_run_dir=True \
    evmbench.solver=evmbench.nano.solver.EVMbenchSolver \
    evmbench.solver.agent_id=claude-default \
    runner.concurrency=1
```

### Configuration Options

| Option | Values | Description |
|---|---|---|
| `evmbench.mode` | `detect`, `patch`, `exploit` | Evaluation mode |
| `evmbench.audit` | `<audit_id>` | Run a specific audit |
| `evmbench.audit_split` | `debug`, `detect-tasks`, `patch-tasks`, `exploit-tasks` | Select a task split |
| `evmbench.hint_level` | `none`, `low`, `med`, `high`, `max` | Hint level |
| `evmbench.apply_gold_solution` | `True`/`False` | Apply answer key (should score 100%) |
| `runner.concurrency` | `<int>` | Concurrent workers (default 5) |

### Available Agents

Set `evmbench.solver.agent_id` to one of:
- `human` — no-op, for testing harness
- `claude-default` — Anthropic Claude Code
- `gemini-default` — Google Gemini CLI
- `opencode-default` — OpenCode (OpenRouter)

To add a custom agent, see `evmbench/agents/` (each agent has `config.yaml` + `start.sh`).

### Results

Outputs go to `project/evmbench/runs/`. Each invocation creates a run-group directory with `group.log` and per-audit logs.

## Security Notes

- EVMBench runs an LLM agent against uploaded, untrusted code
- Treat the worker runtime (filesystem, logs, outputs) as an **untrusted environment**
- Check the selected agent's configuration for its audit timeout and supported overrides.
- See `SECURITY.md` in the repo for the full trust model
