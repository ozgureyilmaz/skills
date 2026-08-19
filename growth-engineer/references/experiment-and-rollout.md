# Experiment and rollout reference

Read this file only for an experiment or tracked rollout. Keep the core skill concise; omit fields that do not apply and explain why.

## Experiment / rollout card

```markdown
Plan status: proposed — confirm with <decision owner>.

### Experiment / rollout: <name>
- Decision / decision owner / decision date:
- Problem and segment; supporting evidence and quality:
- Hypothesis: If <change> for <audience>, then <primary outcome> will <direction>, because <mechanism>.
- Lifecycle stage / funnel step / loop or distribution mechanism:
- Evaluation mode and why; comparison/counterfactual:
- Primary metric: <definition>; source of truth: <source or unknown>; cohort/window: <value or unknown>; evidence status: <verified/unknown/proposed>; diagnostics:
- Estimand / analysis unit / analysis plan; minimum practical effect or success threshold:
- Action-triggering guardrails: <metric>; definition/unit: <value>; source of truth: <source or unknown>; cohort/window: <value or unknown>; evidence status: <verified/unknown/proposed>; threshold/action/responder: <value>:
- Eligibility, assignment/bucketing, exposure event, exclusions, contamination:
- Decision rule: ship / iterate / stop / collect evidence; inconclusive rule:
- Implementation: flag/config, dependencies, acceptable debt, rollback/kill switch, support path, spend cap:
- QA and monitoring: checks, dashboard/alert, cadence, responder:
- Result: effect + uncertainty/limitations; segments and downstream outcomes:
- Decision, owner, follow-up, cleanup or handoff:
```

Use `unknown — <artifact needed>` for missing baselines, sources, windows, owners, thresholds, or dates. Prefix every recommended rollout, cadence, role, threshold, or date on its own line with `proposed — confirm with <decision owner>`. Do not invent power, sample size, lift, p-values, confidence, or calendar dates.

## Launch gates

- Plan and decision rule are approved.
- Eligibility, assignment, exposure, rollback, support path, and responders work.
- Events fire once with correct IDs/properties; exposure precedes outcome; raw events reconcile to the analysis source.
- Relevant happy path, failure path, mobile/accessibility, performance, payment, and communication effects are checked.
- Monitoring, alerts, budget caps, stop windows, and escalation are live.

During exposure, verify actual assignment and event volume before interpreting outcomes. Pause for a breached action-triggering guardrail, material customer harm, privacy/security issue, or unbounded spend.

## Analysis and handoff

Analyze against the declared comparison and unit. Check data quality, segments, novelty/timing, downstream retention/revenue/cost, and unintended effects. Treat null or ambiguous results as learning. A winner needs durable ownership, stable metrics, monitoring, a runbook, privacy/data-retention review, enablement, and cleanup of temporary scaffolding.
