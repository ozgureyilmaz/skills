---
name: linear-pm-workflow
description: >
  Project management workflow using Linear MCP for breaking down PRDs and large tasks
  into commit-sized chunks. Use this skill whenever the user mentions Linear, wants to
  plan a project with issues, asks to break work into chunks, references PRDs or specs
  that need to become actionable tasks, says "create issues", "plan this project",
  "break this down", "commit-sized", or wants to use Linear as an orchestration tool
  for iterative development. Also trigger when the user pastes a PRD, spec, or task
  list and wants it turned into trackable work.
---

# Linear PM Workflow

Turn PRDs and large tasks into prioritized, commit-sized Linear issues, then execute
them one by one with review gates between each.

## Core Principles

1. **Commit-sized chunks** — each issue = one logical change, testable independently
2. **Linear as orchestration** — Linear is the task queue and source of truth
3. **Human review between every chunk** — never chain implementations without user review
4. **Discovery before creation** — always search Linear for existing issues first

## Workflow

### 1. Ingest & Understand

When the user provides a PRD, spec, or task description:
1. Read the full document
2. Identify themes/epics, concrete deliverables, dependencies
3. Summarize scope back to user and wait for confirmation

### 2. Discovery

Search Linear for existing related work before creating anything new:
- Search issues by keywords from the PRD
- Check existing projects for overlap
- Look at recent issues in relevant teams

Present: "Found X existing issues that relate. These Y areas need new issues. These Z issues could move into the new project."

Wait for user confirmation before proceeding.

### 3. Project & Issue Creation

After user approves:
1. Create a Linear project with a clear name
2. Move existing related issues into the project
3. Create new issues for uncovered areas (see [references/issue-templates.md](references/issue-templates.md) for format)
4. Group under epics/labels as discussed

### 4. Prioritize & Chunk

Organize issues into execution order using P0/P1/P2 priority labels and chunking
rules (see [references/issue-templates.md](references/issue-templates.md) for details).

Present the ordered list to user for approval.

### 5. Execute Loop

```
1. Announce: "Working on: [issue title] — [one sentence]"
2. Implement the chunk
3. Show the user what changed
4. STOP — wait for user to review and commit
5. After user confirms: mark issue Done in Linear
6. Announce: "Next up: [next issue title]"
7. Wait for user to say "continue" or redirect
```

**Never auto-continue without user confirmation between chunks.**

For prompt routing (what to do when user says "next", "skip", "reprioritize", etc.),
see [references/issue-templates.md](references/issue-templates.md).

## Error Handling

- **Linear MCP disconnected**: Tell user to check `/mcp` and reconnect
- **No matching issues found**: Confirm with user this is net-new work
- **Issue too large to chunk**: Propose splitting, get approval first
- **Implementation conflicts**: Flag the conflict, don't proceed silently

## Anti-Patterns

- Giant PRs touching everything — always chunk
- Multiple issues implemented before review — always stop
- Creating issues without searching first — always discover
- Assuming priority without asking — always confirm
- Vague titles like "Fix stuff" — always be descriptive
