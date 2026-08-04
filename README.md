# agent skills

🧰 *reusable operating manuals for capable agents*

portable skills for claude code, pi, opencode, codex, and other ai coding assistants.

## features

focused workflows: practical guidance for building, reviewing, researching, and shipping.

portable packages: each skill is a self-contained directory with optional scripts, agents, and references.

clear boundaries: skills explain when to use them, what to inspect, and how to validate the result.

lowercase names: copy a skill directory into the agent runtime you use.

## skills

| skill | description | source |
|-------|-------------|--------|
| `growth-engineer` | evidence-driven product and gtm growth engineering: lifecycle constraints, funnels, loops, instrumentation, experiments, and rollouts. | local |
| `orchestrator` | plan complex work with bounded workers, parallel research, implementation, testing, and verified synthesis. | local |
| `design-eng` | ui polish, component design, animation decisions, and the small details that make software feel right. | local |
| `apple-design` | apple-style interface foundations: direct manipulation, spring motion, gesture physics, materials, typography, and reduced motion. | local |
| `skill-creator` | guide for creating effective skills and reusable agent instructions. | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator) |
| `test-driven-development` | tdd workflow guide with red → green → refactor and language-specific patterns. | local |
| `workflow-skill-design` | patterns for building workflow-based skills with phases, decision trees, and progressive disclosure. | [trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/workflow-skill-design) |
| `building-secure-contracts` | smart contract security skills for vulnerability scanning, audit preparation, maturity, token integration, and secure workflows. | [trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts) |
| `modern-python` | modern python development with uv, ruff, pyproject.toml, testing, security setup, and migration checklists. | [trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/modern-python) |
| `ask-questions-if-underspecified` | prompts the agent to clarify ambiguous or underspecified requests before implementation. | [trailofbits/skills](https://github.com/trailofbits/skills/tree/main/plugins/ask-questions-if-underspecified) |
| `evmbench` | smart contract security auditing guidance using the evmbench benchmark framework. | local |
| `linear-pm-workflow` | project-management workflow for breaking down product requirements and tracking implementation. | local |

## install

```bash
git clone https://github.com/ozgureyilmaz/skills ~/agent-skills
cp -R ~/agent-skills/growth-engineer ~/.codex/skills/
```

replace `growth-engineer` with any skill directory above. for claude code, copy the directory into `~/.claude/skills/`; for a project-only install, use `<project>/.claude/skills/`.

## usage

invoke a skill by name when your agent supports skill instructions:

```text
use $growth-engineer to diagnose this activation problem
use $orchestrator to delegate the repository audit
use $apple-design to review this gesture interaction
```

skills can also be read directly from their `SKILL.md` files when working in an environment without automatic discovery.

## development

when adding or removing a skill:

1. keep the directory name lowercase.
2. include a `SKILL.md` with `name` first and `description` last in frontmatter.
3. update this table.
4. keep scripts portable and exclude generated files.
5. run the relevant validation before opening a pull request.

## links

- [issues](https://github.com/ozgureyilmaz/skills/issues)
- [repository](https://github.com/ozgureyilmaz/skills)
- [skill authoring guide](https://github.com/anthropics/skills/tree/main/skills/skill-creator)
