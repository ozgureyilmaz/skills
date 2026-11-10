---
name: orchestrator
description: Coordinate complex work with bounded workers and verified results. Use when the user explicitly invokes $orchestrator or asks for parallel agents, delegated repository exploration, multi-part implementation, testing, review, research, or log analysis. Handle small or tightly coupled tasks directly.
---

# Orchestrator

Keep the primary agent focused on decomposition, judgment, coordination,
verification, and final synthesis. Move exploration, implementation, tests,
logs, and supporting research into isolated worker contexts.

## Principles

- Use the host's supported subagent or task mechanism. Verify available tools,
  models, permissions, and concurrency limits before launching workers.
- Respect explicit user model preferences. Otherwise inherit the primary model
  or use the host's documented defaults; report any required fallback.
- Run no more than four workers concurrently, or fewer if the host requires it.
- Keep workers bounded and non-recursive. Return evidence rather than transcripts.
- When delegation is unavailable, perform the tasks sequentially in the primary
  conversation and state the limitation.
- Claim live worker visibility only when the host actually exposes it.

## 1. Scope and decompose

Entry: the user has requested work that may benefit from delegation.

1. Handle small, sequential, or tightly coupled work directly.
2. Split larger work into tasks with clear dependencies and completion criteria.
3. Give parallel write workers disjoint files or components. Run overlapping
   changes sequentially.
4. Preserve existing user changes and shared workspace state.

Exit: each task has an owner, scope, dependencies, and expected evidence.

## 2. Launch and monitor

Entry: independent tasks and a supported worker mechanism are available.

Give each worker only the context it needs:

```text
task: inspect the authentication tests for missing failure cases.
scope: tests/auth only; read-only.
success: identify actionable gaps with file and line references.
return: findings, files inspected, checks run, evidence, and remaining risks.
constraints: do not spawn workers or perform unrelated external actions.
```

1. Launch independent tasks within the concurrency limit.
2. Use the host's wait and status tools until every required worker finishes.
3. Keep the user informed of meaningful progress.
4. Bound long-running workers with a timeout where supported. On failure or
   timeout, retry once with a narrower task or continue directly. Mark missing
   evidence as incomplete.
5. Stop adding workers when further delegation would not improve the result.

Exit: every required task has a result or an explicit failure status.

## 3. Verify and synthesize

Entry: all required workers have returned or been marked incomplete.

1. Inspect each result and reconcile contradictory findings.
2. Verify important claims against the owning source.
3. Review combined changes and run relevant integration checks.
4. Reuse worker evidence instead of repeating broad scans.
5. Report the verified outcome, validation, and any unresolved gaps.

Exit: the user receives one supported answer with clear limits.
