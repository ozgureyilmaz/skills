# skills

skills for claude code, pi, opencode, and other agents.

## skills

| skill | purpose | source |
| --- | --- | --- |
| [socratic-tutor](socratic-tutor) | learn through questions, practice, and review | [jane street](https://github.com/janestreet/agent_skills/tree/7c6715c29548a3b39d4a9545c698ee4fd17a7213/socratic-tutor) |
| [growth-engineer](growth-engineer) | product growth and experiments | local |
| [orchestrator](orchestrator) | coordinate workers and verify results | local |
| [design-eng](design-eng) | ui polish and animation | local |
| [apple-design](apple-design) | apple-style interfaces and motion | local |
| [skill-creator](skill-creator) | create reusable skills | [anthropic](https://github.com/anthropics/skills/tree/main/skills/skill-creator) |
| [test-driven-development](test-driven-development) | red, green, refactor | local |
| [workflow-skill-design](workflow-skill-design) | design multi-step skills | [trail of bits](https://github.com/trailofbits/skills/tree/main/plugins/workflow-skill-design) |
| [building-secure-contracts](building-secure-contracts) | smart contract security | [trail of bits](https://github.com/trailofbits/skills/tree/main/plugins/building-secure-contracts) |
| [modern-python](modern-python) | python tooling with uv and ruff | [trail of bits](https://github.com/trailofbits/skills/tree/main/plugins/modern-python) |
| [ask-questions-if-underspecified](ask-questions-if-underspecified) | clarify requirements | [trail of bits](https://github.com/trailofbits/skills/tree/main/plugins/ask-questions-if-underspecified) |
| [evmbench](evmbench) | smart contract auditing | local |
| [linear-pm-workflow](linear-pm-workflow) | plan and track work in linear | local |
| [mindmap](mindmap) | turn topics into interactive mind maps | local |

## install

```bash
git clone https://github.com/ozgureyilmaz/skills ~/agent-skills
mkdir -p ~/.claude/skills
cp -r ~/agent-skills/socratic-tutor ~/.claude/skills/
```

replace `socratic-tutor` with any skill above. for another agent, use its skills directory.
