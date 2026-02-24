# Agent Skills

Collection of reusable agent skills for Claude Code, Pi, OpenCode, and other AI coding assistants.

## Skills

| Skill | Description | Source |
|-------|-------------|--------|
| `skill-creator` | Guide for creating effective skills. Use when users want to create or update a skill. | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator) |
| `test-driven-development` | TDD workflow guide (Red → Green → Refactor) with language-specific patterns. | Local |
| `workflow-skill-design` | Design patterns for building workflow-based skills with multi-step phases, decision trees, and progressive disclosure. | [trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/workflow-skill-design) |
| `building-secure-contracts` | Smart contract security skills — vulnerability scanners (Solana, Cosmos, Cairo, Algorand, Substrate, TON), audit prep, code maturity assessment, token integration analysis, and secure workflow guidance. | [trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts) |
| `modern-python` | Modern Python development with `uv`, `ruff`, `pyproject.toml`, PEP 723 scripts, testing, security setup, and migration checklists. Includes hooks/shims for enforcing best practices. | [trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/modern-python) |
| `ask-questions-if-underspecified` | Prompts the agent to ask clarifying questions instead of making assumptions when a request is ambiguous or underspecified. | [trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/ask-questions-if-underspecified) |

## Usage

Skills can be used by placing them in:

- **Global**: `~/.claude/skills/` — available in all projects
- **Per-project**: `<project>/.claude/skills/` — available in a specific project
- **Packaged**: `.skill` files can be installed via `claude install-skill <path>`
