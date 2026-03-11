# Issue Templates & Prompt Routing

## Issue Format

Use this format when creating Linear issues:

```
Title: [Action verb] [specific thing] [in context]
  Examples: "Add email validation to signup form"
            "Refactor auth middleware to use JWT"
            "Fix race condition in payment queue"

Description:
  ## What
  [One sentence: what this issue accomplishes]

  ## Implementation Steps
  1. [Specific step with file/function names when known]
  2. [Next step]
  3. [Next step]

  ## Acceptance Criteria
  - [ ] [Testable criterion]
  - [ ] [Testable criterion]

  ## Dependencies
  - Requires: [issue links if any]
```

## Prompt Routing

Map user requests to workflow phases:

| User says | Action |
|-----------|--------|
| "Here's a PRD, plan it out" | Ingest → Discovery → Create |
| "Break this into issues" | Ingest → Create (skip discovery if user says no existing work) |
| "Prioritize the issues" | Prioritize & Chunk |
| "Start implementing" | Execute Loop |
| "Next" or "continue" | Next chunk in Execute Loop |
| "Mark done and next" | Update Linear status → next chunk |
| "What's left?" | List remaining issues with status |
| "Reprioritize" | Re-run Prioritize & Chunk with new context |
| "Add an issue for X" | Create single issue, slot into priority order |
| "Skip this one" | Move to next, keep skipped issue in backlog |

## Priority Labels

- **P0**: Blockers and foundations (must be done first)
- **P1**: Core functionality (main deliverables)
- **P2**: Polish and nice-to-haves (can defer)

## Chunking Rules

A valid chunk:
- = 1 commit = 1 reviewable unit
- Touches at most 3-5 files
- Describable in one sentence
- Independently testable
- Doesn't break existing functionality

If an issue is too big for one chunk, split it into sub-issues.
