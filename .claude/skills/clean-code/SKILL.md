---
name: clean-code
description: Analyzes code against clean code standards and produces refactoring recommendations. Use when refactoring, cleaning up code, or checking code quality. Trigger with "clean up", "refactor", "clean code", "code quality".
allowed-tools: Read, Glob, Grep, Bash(npm run typecheck), Bash(npm run test)
---

# Clean Code Analysis & Refactoring Skill

## Overview

Analyzes source code against project clean code standards and produces actionable refactoring recommendations.

## When to Use

- User explicitly requests cleanup: "clean up", "refactor", "clean code", "code quality"
- After completing a feature (pre-commit quality check)
- When a file grows beyond guidelines

## Instructions

### Step 1: Identify Target Files

- If user specifies files, use those
- Otherwise, check recent changes: `git diff --name-only`
- For full audit, scan `src/`

### Step 2: Analyze Against Rules

Check each file against the rules below. Reference `guidelines/` for examples.

### Step 3: Produce Report

Use the output format below.

## All Rules

### TypeScript
- Use `unknown` instead of `any`
- Use `interface` for object shapes, `type` for unions
- Use `as const` on constant objects
- Prefer type narrowing over type assertions
- Exhaustive switch with `never` for union discrimination

### Classes
- Constructor validates required config (throw on missing)
- Private methods for internal logic (prefix with `private`)
- Keep public API surface minimal
- Document public methods with JSDoc + `@example`

### Functions & Naming
- Functions do one thing; verb-first names (`sendTemplate`, `isValidE164`)
- Max 3 parameters; use options object for more
- Guard clauses at top; return early for error cases
- Booleans: `is/has/should/can` prefix
- Constants: `UPPER_SNAKE_CASE` with JSDoc
- Files: camelCase for all source files

### Error Handling
- Custom error classes extend `Error` with `name` property set
- Static factory methods for parsing external error shapes (`fromResponse`)
- Never expose sensitive data (tokens, full phone numbers) in error messages
- Always mask PII in log output

### Testing
- Test behavior, not implementation
- AAA pattern: Arrange → Act → Assert
- Mock `globalThis.fetch` for HTTP tests
- Cover error paths and edge cases
- `beforeEach` clears mocks (`vi.clearAllMocks()`)

### Code Organization
- No barrel exports except `src/index.ts` (the public API)
- Direct imports between source files (`./types.js`, `./errors.js`)
- Types in dedicated `types.ts` file
- One class per file

## Output Format

```markdown
## Clean Code Analysis: [target]

### Summary
[1-2 sentence assessment with letter grade A-F]

### Critical Issues
[Security, PII exposure, breaking changes]

### High Priority
[Type safety, missing error handling, untested paths]

### Medium Priority
[Naming, constants, organization]

### Recommendations
[Refactoring suggestions with before/after]

### Positive Notes
[Good practices observed]
```
