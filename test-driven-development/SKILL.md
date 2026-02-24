---
name: test-driven-development
description: Guide for writing code using Test-Driven Development (TDD). Use this skill when the user asks to build features, fix bugs, or write code using TDD, or when they mention "TDD", "test-first", "red-green-refactor", or "write tests first". Also use when the user wants to add test coverage to existing code following TDD principles, or when refactoring code with test safety nets.
---

# Test-Driven Development

A disciplined workflow for writing code by writing tests first, then making them pass with minimal implementation, then refactoring.

## Core Workflow: Red → Green → Refactor

Every code change follows this cycle:

### 🔴 Red — Write a Failing Test

1. Identify the smallest next behavior to implement
2. Write a test that asserts that behavior
3. Run the test suite — confirm the new test **fails** (and existing tests still pass)
4. If the test passes immediately, it's either testing existing behavior or is wrong — revisit

**Rules:**
- Test ONE behavior per test — never combine multiple assertions about different behaviors
- Name tests to describe the expected behavior, not the implementation: `test_empty_cart_has_zero_total` not `test_calculate`
- Start from the simplest case (empty input, zero, null) and progress to complex cases

### 🟢 Green — Make It Pass

1. Write the **minimum** code to make the failing test pass
2. It's OK to hardcode, use shortcuts, or write "ugly" code — correctness is the only goal
3. Run the test suite — confirm ALL tests pass (new and existing)
4. Do NOT add any code that isn't required by a failing test

**Rules:**
- Resist adding "while I'm here" code — if there's no failing test demanding it, don't write it
- If the solution feels too simple, that's correct — complexity is added incrementally via new tests
- If making one test pass breaks another, the implementation has a design issue — address it

### 🔵 Refactor — Clean Up

1. With all tests green, improve the code's structure without changing behavior
2. Run tests after each refactoring step — they should stay green
3. Apply standard refactoring patterns: extract method, rename, remove duplication, simplify conditionals

**Rules:**
- NEVER add new functionality during refactoring — only restructure
- If refactoring reveals a need for new behavior, stop refactoring and start a new Red phase
- Refactor both production code AND test code

## Test Progression Strategy

Build up functionality through layered tests, from simple to complex:

```
1. Degenerate/edge cases     → null, empty, zero, negative
2. Single simple case        → one valid input
3. Multiple cases            → several inputs, boundary values
4. Error/exception cases     → invalid input, failure modes
5. Integration behaviors     → interactions between components
```

**Example — building a `FizzBuzz` function:**

```
Test 1: returns "1" for input 1                    → hardcode return "1"
Test 2: returns "2" for input 2                    → return str(n)
Test 3: returns "Fizz" for input 3                 → add if n % 3 == 0
Test 4: returns "Buzz" for input 5                 → add if n % 5 == 0
Test 5: returns "FizzBuzz" for input 15            → add if n % 15 == 0
Test 6: returns "Fizz" for input 9 (another mult)  → confirms generalization works
```

Each test introduces exactly ONE new requirement.

## Workflow Decision Tree

1. Determine the type of task:
   **New feature?** → Follow "New Feature TDD" below
   **Bug fix?** → Follow "Bug Fix TDD" below
   **Refactoring existing code?** → Follow "Refactoring with TDD" below

### New Feature TDD

1. List the behaviors the feature needs (bullet points, plain language)
2. Order them from simplest to most complex
3. For each behavior, run one Red → Green → Refactor cycle
4. After all behaviors are implemented, review for missing edge cases

### Bug Fix TDD

1. Write a test that **reproduces** the bug (this test must fail — proving the bug exists)
2. Run the test to confirm it fails for the right reason
3. Fix the bug with minimal code changes
4. Run all tests to confirm the fix doesn't break anything
5. Refactor if the fix revealed structural issues

### Refactoring with TDD

1. Ensure comprehensive tests exist for current behavior — if not, add characterization tests first
2. Make one small structural change at a time
3. Run tests after each change — they must stay green
4. If a test breaks, the refactoring changed behavior — revert and try a smaller step

## Language-Specific Patterns

For detailed testing patterns, framework setup, and idiomatic testing examples for specific languages, see: [references/language-patterns.md](references/language-patterns.md)

Supported languages include: Python, JavaScript/TypeScript, Rust, Go, Solidity, Java, and more.

## Test Quality Checklist

Before considering a TDD cycle complete, verify:

- [ ] Each test has a single, clear reason to fail
- [ ] Test names describe behavior, not implementation
- [ ] No test depends on the execution order of other tests
- [ ] Tests run fast (mock external dependencies: network, DB, filesystem)
- [ ] No production logic exists without a corresponding test
- [ ] Tests cover edge cases and error paths, not just happy paths
- [ ] Refactoring did not sneak in new behavior

## Common TDD Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|---|---|---|
| Writing tests after code | Tests confirm implementation, not behavior | Always write the test FIRST |
| Testing implementation details | Tests break on refactoring | Test public API and observable behavior |
| Large Red steps | Hard to debug failures | Smaller tests, one behavior each |
| Skipping Refactor phase | Technical debt accumulates | Always refactor after Green |
| Test interdependence | Flaky tests, order-dependent failures | Each test sets up its own state |
| Testing private methods directly | Couples tests to internals | Test through public interface |
| Over-mocking | Tests pass but code doesn't work | Mock only at architectural boundaries |
