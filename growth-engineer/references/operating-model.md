# Operating-model reference

Read this file only for a growth-team, backlog, staffing, or cadence review.

Map each bet to its surface, required skills, capacity, dependencies, and ownership. Keep distinct roles:

- decision owner: chooses the bet and acts on the result;
- implementation owner: ships and maintains the change;
- measurement owner: validates definitions and analysis;
- rollback responder: can pause or revert exposure;
- privacy/legal/security approver: reviews material risk;
- durable owner: owns a winner after experimentation.

If a person is unknown, write `unassigned — <required role>`. Prefix every recommended role assignment, cadence, meeting, staffing percentage, work-in-progress limit, or cleanup date on that same line with `proposed — confirm with <decision owner>`; do not present it as existing organizational fact.

Use the smallest cadence that fits stage and capacity. Cycle length, meeting duration, work-in-progress limits, staffing percentages, sample sizes, and cleanup dates are proposed values unless supplied or mechanically derived. A useful loop is:

```text
collect evidence → choose a constraint → build the thinnest useful slice → expose safely
→ measure and interpret → share learning → scale, iterate, hand off, or remove
```

Keep one binding constraint visible, invite implementers into ideation, record rejection rationale, and avoid importing enterprise process into a 0→1 problem without evidence. Include instrumentation or retention work when either is the bottleneck.
