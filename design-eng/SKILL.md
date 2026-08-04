---
name: design-eng
description: "Review and build polished web interfaces with careful component details, interaction feedback, animation, accessibility, and performance. Use when implementing or reviewing UI behavior, motion, hover/press states, popovers, gestures, transitions, typography, or visual polish; not for generic branding or visual taste without a concrete interface decision."
---

# Design Engineering

Apply this skill to concrete interface work. Treat craft as a system of feedback, spatial consistency, restraint, accessibility, and coherent motion—not as an aesthetic checklist.

## Preflight

Before recommending a change:

- Inspect the relevant code, screenshot, prototype, or live behavior; do not invent a UI state that was not observed.
- Identify the framework, animation library, browser/device targets, input modality, and support constraints.
- Record accessibility requirements, reduced-motion expectations, performance budget, and whether the motion is functional or decorative.
- State assumptions and separate observed defects from taste-based recommendations.

## Workflow

1. Decide whether the interaction should animate and name the user-facing purpose.
2. Choose the simplest implementation that preserves direct feedback and can be interrupted when users may change direction.
3. Check responsive behavior, keyboard and touch input, reduced motion, browser support, and performance under load.
4. Review the result at normal speed, slow speed, and on a real target device when gestures or motion are central.

Load only the reference that matches the task:

- [Animation foundations](references/animation-foundations.md): animation purpose, easing, springs, timing, and interruptibility.
- [Component and CSS patterns](references/component-and-css-patterns.md): buttons, popovers, tooltips, transforms, clip-path, and entry states.
- [Interaction, performance, and review](references/interaction-performance-and-review.md): gestures, performance, accessibility, craft examples, debugging, and checklist.

## Review output

When reviewing concrete UI code, use a compact table when there are actionable before/after changes:

| Before | After | Why |
| --- | --- | --- |
| <observed code or behavior> | <specific correction> | <user-facing reason> |

When no concrete before/after exists, use concise prose or a decision table instead of forcing an empty comparison. Separate correctness, accessibility, performance, and taste-based recommendations, and identify which claims depend on browser or library support.

## Core principles

- Respond on input, not only after release; keep feedback continuous during direct manipulation.
- Animate only when motion explains space, state, feedback, or hierarchy; frequent keyboard actions often need no animation.
- Prefer interruptible transitions and springs for user-controlled motion; use CSS or WAAPI for predetermined motion when it performs better in the target environment.
- Preserve spatial relationships: enter and exit along coherent paths, anchor popovers to their triggers, and avoid unexplained jumps.
- Respect accessibility: support reduced motion, touch/hover differences, keyboard input, contrast, text scaling, and non-motion equivalents.
- Use exact properties, sensible durations, and platform/library-appropriate APIs; validate performance instead of relying on blanket “GPU” claims.
