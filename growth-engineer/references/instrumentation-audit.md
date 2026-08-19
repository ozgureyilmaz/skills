# Instrumentation and attribution reference

Read this file only when the request concerns tracking, attribution, analytics quality, or growth infrastructure.

## Trace and event contract

Trace a representative user/account from exposure through the primary outcome. Check:

- metric definition, timezone, cohort/window, identity stitching, bots/internal traffic, backfills, and late events;
- canonical event names, required properties, user/account IDs, timestamps, consent state, acquisition/UTM fields, and source of truth;
- client/server duplication, missing events, retries, schema drift, variant/control assignment, exposure before outcome, and attribution logic;
- raw events → warehouse/model → experiment analysis → dashboard reconciliation;
- access controls, retention, consent, and deletion requirements before adding tracking or targeting.

Use `unknown — <artifact or access needed>` when a source, definition, window, or permission is unavailable. Quantify discrepancies only from inspected artifacts; do not invent tolerances.

## Attribution contract

For referrals or multi-touch journeys, define the stable account/user key, touchpoint events, identity stitching, attribution window, overwrite rules, self-referral/duplicate/employee/test/bot handling, deletion and consent behavior, late events, and authoritative source. Keep sensitive data out of URLs and logs.

## QA and rollout

Test single firing, event order, retries/idempotency, cross-device loss, exposure before outcome, and reconciliation. Use a feature flag or staged rollout with a tested kill switch. A discrepancy threshold or rollout percentage is `proposed — confirm with <decision owner>` unless supplied or derived from an existing policy.
