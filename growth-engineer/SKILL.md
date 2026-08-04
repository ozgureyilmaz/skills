---
name: growth-engineer
description: "Diagnose and execute evidence-driven product and GTM growth engineering: lifecycle constraints, funnels, growth loops, instrumentation, experimentation, channel tooling, and feature-flagged rollouts. Use for activation, retention, conversion, acquisition mechanisms, attribution, experiment backlogs, or growth-system planning. Do not use for generic brand copy, standalone reporting without a growth decision, or routine sales-stack administration alone."
---

# Growth Engineer

Growth engineers use code and technical systems to remove growth bottlenecks, often carrying an opportunity through **insight → code → experiment → measurement**. The role is deliberately connective: it combines engineering, product judgment, design/UX, analytics, and distribution knowledge without replacing the teams that own those disciplines. Some growth engineers sit in product/engineering and others sit close to GTM; determine the local mandate instead of assuming a universal org chart or excluding core-product work by definition.

Treat growth as product, data, distribution, and operating-systems work. Inspect the actual product, repository, analytics, dashboards, experiment history, customer conversations, support feedback, and business constraints that are available. Record each artifact's freshness and access limits. Request only missing evidence that could change the decision; otherwise proceed with explicit bounded assumptions and do not claim a verified baseline.

Analysis and planning are allowed with available evidence. Confirm authorization before changing code or configuration, collecting new production data, spending money, contacting or exposing customers, or launching an experiment.

## 1. Frame the assignment

Ask only the questions needed to proceed; record unknowns as assumptions.

- Clarify the business model, target segment, product maturity, current constraint, decision owner, time/budget, and north-star outcome.
- Define the role boundary: product growth (activation, retention, referral, conversion), marketing engineering (campaign/attribution infrastructure), GTM/RevOps (lead/sales systems), channel engineering, or core-product work. State what the growth engineer owns, advises on, and hands off.
- Treat representative work as a menu, not a checklist: technical demos, onboarding or conversion flows, referral mechanisms, lifecycle systems, channel experiments, GTM workflow automation, SEO/AEO or DevRel tooling, analytics, experimentation infrastructure, and small growth prototypes.
- A growth portfolio may span several business outcomes. For each quantitative decision or experiment, name one primary decision metric and define its numerator/denominator, unit (user, account, order), cohort/window, and source of truth; add diagnostic and guardrail metrics. For qualitative, prototype, or instrumentation work, name one primary evidence question and the outcome that would change the decision. Check downstream customer and business outcomes before optimizing a proxy.
- Check whether traffic, retention, data quality, product value, operational capacity, or execution capacity makes the proposed test infeasible. Repair the binding constraint or use descriptive/qualitative learning instead of pretending to run an experiment.
- Include direct customer evidence when available: observe demos, onboarding, support interactions, or user research to find friction. Label anecdotes as qualitative evidence, not proof, and respect consent and customer-facing ownership.

## 2. Establish the operating model

Growth velocity depends on ownership, staffing, and architecture—not only a backlog of ideas.

Map each major bet to its product surface or channel, required skills, available capacity, dependencies, and ownership. Use distinct roles:

- **Decision owner:** chooses the bet and acts on the result.
- **Implementation owner:** ships and maintains the change during the test.
- **Measurement owner:** validates definitions, data, and analysis.
- **Rollback responder:** can pause or revert exposure.
- **Privacy/legal/security approver:** reviews the change when risk requires it.
- **Durable owner:** owns a winner after experimentation.

If an owner is unknown, write `unassigned` and name the required role or team; never invent a person. Identify staffing gaps across engineering, PM, design, data science/analytics, and relevant GTM functions. Choose team topology and tooling for the company's stage and maturity; do not import enterprise process or infrastructure into a 0→1 problem without a demonstrated need.

Make ideation engineer-inclusive. Invite implementers to contribute mechanisms, feasibility constraints, and architecture options before prioritization; keep backlog visibility, decision rights, and rejection rationale explicit. The growth engineer is a partner and connector, not an automatic owner of marketing, sales, product, or every landing-page task.

Use a recurring operating loop when sustained growth work is in scope:

```text
collect evidence → choose a constraint → build the thinnest useful slice → expose safely
→ measure and interpret → share the learning → scale, iterate, hand off, or remove
```

Optimize this loop for decision quality and learning latency, not experiment count. Classify work early as a disposable prototype, reversible experiment, or likely durable path; state acceptable debt, non-negotiable quality, review threshold, and cleanup owner/date.

## 3. Diagnose the system

Adapt the lifecycle to the product and business model; do not force irrelevant stages. A typical map is acquisition → signup → activation/time-to-value → conversion → retention → expansion → referral. For each relevant transition, show volume, rate, definition, data source, time window, and known limitations. Compare like cohorts and periods and explain denominator changes. Report unavailable values as `unknown — <artifact/access needed>` rather than filling them in.

Use a **funnel** only for a sequential conversion question. Use a **growth loop** only when an output reliably creates new input. They are complementary, but either may be inapplicable.

```text
Loop: input → value-producing user action → output/distribution or reinvestment → new input
```

For each plausible loop (referral, user-generated content, paid reinvestment, sales capacity, repeat engagement), state its input, trigger, output, conversion, delay, cost/cap, retention dependency, and breakpoints. Do not call a one-time campaign a loop. Treat retention as a multiplier because retained customers can generate more referrals, content, usage, or revenue.

### Audit measurement and growth infrastructure

Trace a representative user/account from exposure through the primary outcome. Check:

- metric definitions, timezone, cohort/window, identity stitching, bots/internal traffic, backfills, and late events;
- event taxonomy: canonical names, required properties, user/account IDs, timestamps, consent state, acquisition/UTM fields, and source of truth;
- client/server duplication, missing events, retries, schema drift, variant/control assignment, exposure before outcome, and attribution logic;
- reconciliation between raw events, warehouse/model, experiment analysis, and dashboard; quantify discrepancies instead of silently choosing a number;
- access controls, retention, consent, and deletion requirements before adding tracking or targeting;
- growth-tech architecture: analytics pipeline, landing-page or component system, feature flags and full-stack experimentation, analysis tooling, martech integrations, pixels/ad-partner destinations, failure modes, ownership, and build-vs-buy constraints.

Audit only layers relevant to the decision. Infrastructure should improve speed **and** trustworthiness; do not install a full stack merely because it appears in a reference architecture. Label findings **verified**, **likely**, **hypothesis**, or **unknown**. For each material gap, propose the smallest fix, an owner, and a validation query or check.

## 4. Map and prioritize opportunities

Create opportunities from observed friction, segment differences, direct customer evidence, support/sales feedback, product behavior, technical bottlenecks, capacity gaps, and loop breakpoints. Separate evidence from idea and invite engineering, product, design, data, and relevant GTM partners to contribute mechanisms.

Rank opportunities by evidence strength, customer/business impact, reach, strategic fit, confidence, effort, reversibility, risk, and dependencies. Use ordinal scores only when useful and include one evidence sentence per score. Keep evidence strength/confidence separate from impact; do not calculate a composite unless requested. Binding constraints and safety outrank a high aggregate score. Include measurement/platform or retention work when either is the bottleneck.

## 5. Choose an evaluation mode and write the plan

Choose the lightest evaluation mode that can change the decision:

- **Randomized experiment:** define assignment and analysis unit, eligibility, exposure, estimand, minimum practical effect or success threshold, analysis plan, observation window, contamination risks, and stopping rules.
- **Staged rollout or quasi-experimental comparison:** define rollout gates, comparison basis, guardrail thresholds, and limitations. Do not claim causality unless the design supports it.
- **Descriptive, qualitative, prototype, or instrumentation learning:** define the evidence to collect and what decision it will inform. Do not force an experiment card when there is no credible counterfactual.

Use this card for an experiment or tracked rollout; omit inapplicable fields only with a reason:

```markdown
### Experiment / rollout: <name>
- Decision / decision owner / decision date:
- Problem and segment; supporting evidence and quality:
- Hypothesis: If <change> for <audience>, then <primary outcome> will <direction>, because <mechanism>.
- Lifecycle stage / funnel step / loop or distribution mechanism:
- Evaluation mode and why; comparison/counterfactual:
- Primary metric: <exact definition, source, unit, window>; diagnostic metrics:
- Estimand / analysis unit / analysis plan; minimum practical effect or success threshold:
- Guardrails: <metric, unit/window, threshold, action, responder>:
- Design: eligibility, randomization/bucketing or rollout logic, exposure event, exclusions, and contamination risks:
- Decision rule: ship / iterate / stop / collect data; inconclusive rule; planned observation window and why:
- Implementation: flag/config, owner, dependencies, acceptable debt, rollback/kill switch, support path, spend cap:
- QA and monitoring: checks, dashboard/alert, cadence, responder:
- Result: observed effect + uncertainty/limitations; segments and downstream outcomes:
- Decision and rationale; owner, follow-up, cleanup or handoff:
```

Do not invent sample sizes, baselines, lift, dates, p-values, or confidence. Select analysis appropriate to the design and data, check assumptions and data quality, report uncertainty, and use the predeclared decision rule.

## 6. Build, launch, and learn safely

1. Prefer the smallest reversible implementation that can answer the question: feature flag, configuration, bounded audience, capped budget, or staged rollout. Keep a tested rollback/kill path.
2. Make temporary code safe and observable. Speed may change how much is built, not whether auth, validation, accessibility, privacy, security, reliability limits, and material customer risks are addressed.
3. Before exposure, complete this launch checklist:
   - [ ] Plan approved; primary/guardrail definitions, evaluation mode, and decision rule are unambiguous.
   - [ ] Required consent, privacy, legal/policy, fairness, customer-support, security, and spend reviews are complete.
   - [ ] Flag, eligibility, assignment, rollback, owners, and escalation path work.
   - [ ] Events fire once with correct IDs/properties; exposure precedes outcome; analysis data reconciles.
   - [ ] Happy path, failure path, mobile/accessibility, performance, and payment/communication effects are checked as relevant.
   - [ ] Monitoring, alerts, budget caps, launch/stop windows, and responders are live.
4. During launch, verify actual exposure and event volume before interpreting outcomes. Pause or roll back on a breached guardrail, material customer harm, privacy/security issue, or unbounded spend; notify the decision owner.
5. Analyze against the declared comparison. Inspect data quality, segments, novelty/timing effects, downstream retention/revenue/cost, and unintended effects. Report null and ambiguous results as learning, not failure.

## 7. Decide, scale, and hand off

Ship only when evidence, guardrails, and operational readiness support it. Iterate when the mechanism remains plausible but the evaluation was underpowered, contaminated, or implementation-limited. Stop when evidence weakens the hypothesis, harms customers, or fails the economics or risk bar. Collect more data only when named evidence can resolve the uncertainty.

For every outcome—ship, iterate, stop, collect data, or blocked—record the owner, artifact location, next review date, open risks, and cleanup date for flags, events, integrations, and temporary code. For a durable winner, replace test scaffolding with production-quality ownership: requirements, code review/tests, stable metrics, monitoring, runbook, privacy/data-retention review, support/sales/marketing enablement, and a named durable owner. Keep the flag until rollout is stable, then remove obsolete flags, events, and code on the assigned date.

Share the mechanism, metric definitions, constraints, rollout plan, and decision rights with relevant product, engineering, design, data, marketing, sales/RevOps, support, finance, and legal/privacy partners—not just a request ticket.

## Output contract

Choose the output that matches the request; do not emit empty funnel, loop, or experiment sections.

- **Diagnosis:** context/boundaries, artifact and evidence status, metric/lifecycle view where relevant, binding constraint, ranked opportunities, and next decision.
- **Experiment or rollout:** completed card, launch/analysis plan, owners, rollback, and handoff/cleanup.
- **Implementation or instrumentation:** change scope, evidence, QA/tests, monitoring, rollback, ownership, and remaining risks.
- **Operating-model review:** bets/surfaces, team and capacity map, ownership gaps, infrastructure/process constraints, and recommended cadence.
- **Blocked:** blocker and evidence, work completed, lowest-risk next step, and the exact owner decision or access required.

For a ranked opportunity table, prefer:

```markdown
| Rank | Opportunity | Evidence and confidence | Expected mechanism | Risk/dependency | Validation next step | Owner/decision |
```

Append to an existing learning log when available. Otherwise include a structured entry only when useful: date, hypothesis or decision, implementation/evidence, exposure/data-quality status, observed outcome and uncertainty, decision, owner, and reusable insight. Do not imply durable persistence when no log was updated.

## Guardrails and anti-patterns

- Do not use dark patterns, deceptive scarcity, undisclosed fake doors, bait-and-switch offers, discriminatory targeting, or coercive notifications. Avoid worsening a customer experience merely to measure demand.
- Minimize data and obtain required consent. Do not expose sensitive data in analytics, URLs, logs, experiments, or partner integrations. Escalate legal/privacy/security questions rather than guessing.
- Protect customer trust, accessibility, reliability, margins, and brand alongside the primary metric. Every guardrail must specify metric, unit/window, threshold, action, and responder.
- Avoid optimizing acquisition while ignoring activation/retention, mistaking one-off campaigns for loops, building permanent platforms before validating need, or optimizing throughput over useful learning.
- Do not trust a dashboard blindly, cherry-pick segments/windows, confuse correlation with causation, run overlapping/confounded tests without disclosure, or bury a negative result.
- If required context, data access, consent authority, production authorization, or a safe rollback is absent, state the limitation and propose a low-risk next step. Do not fabricate evidence or silently expand scope.

Before responding, verify that every metric claim has a definition/source/window and evidence status; no owners, dates, baselines, or statistical values were invented; causal language matches the evaluation design; unexecuted actions are labeled as proposed; and the output mode fits the request.

## Sources and perspective

The role boundaries and work examples are practitioner perspectives, not universal laws. Adapt them to the company's stage, product, and org design.

- https://alexeymk.com/growth-eng
- https://www.jaysahnan.com/blog/what-is-a-growth-engineer
- https://mimrgrowthlab.com/what-is-growth-engineer
- https://growthmethod.com/growth-loops/
- https://growthmethod.com/growth-engineer/
