# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run build` — Build package (tsup, ESM + CJS + .d.ts)
- `npm run typecheck` — TypeScript validation (`tsc --noEmit`)
- `npm run test` — Run tests (`vitest run`)
- `npm run test:watch` — Watch mode (`vitest`)

## Architecture

```
whatsapp-notify (npm package)
├── src/
│   ├── client.ts       WhatsAppClient class (main API surface)
│   ├── errors.ts       WhatsAppApiError (wraps Meta API errors)
│   ├── phone.ts        E.164 validation + formatting utilities
│   ├── types.ts        All public interfaces
│   └── index.ts        Public API re-exports
└── __tests__/          Vitest tests
```

### Data Flow

```
Consumer code
  → new WhatsAppClient({ phoneNumberId, accessToken })
  → client.sendTemplate({ to, template, language, parameters })
  → POST https://graph.facebook.com/{version}/{phoneNumberId}/messages
  → SendTemplateResult { messageId, phone }
```

## Tech Stack

- TypeScript (strict mode)
- tsup (dual ESM + CJS build)
- Vitest (testing)
- Zero runtime dependencies (native `fetch`, Node 18+)

## Project Conventions

### Package Design

- **Zero runtime dependencies** — only native `fetch` (Node 18+)
- **Config via constructor** — no `process.env` reads inside the package; consumer passes config
- **Errors are thrown** — consumer decides to catch or let propagate (fire-and-forget pattern)
- **Pluggable logger** — defaults to `console`, consumer can inject Pino/Winston/custom

### TypeScript

- Strict mode enabled, no `any` (use `unknown`)
- `interface` for object shapes, `type` for unions
- All public types exported from `src/index.ts`
- `as const` on constant objects for literal types

### Testing

- Vitest with `vi.spyOn(globalThis, "fetch")` for HTTP mocking
- AAA pattern: Arrange → Act → Assert
- Test behavior, not implementation
- Edge cases: invalid phones, API errors, missing config

### Naming

- Functions: verb-first (`sendTemplate`, `isValidE164`, `maskPhone`)
- Interfaces: PascalCase nouns (`WhatsAppClientConfig`, `SendTemplateParams`)
- Constants: `UPPER_SNAKE_CASE` with JSDoc
- Files: camelCase (`client.ts`, `phone.ts`)
- Tests: `source-name.test.ts` in `__tests__/`

### Error Handling

- `WhatsAppApiError` wraps all Meta API errors with code, status, type, fbtraceId
- `WhatsAppApiError.fromResponse()` static factory parses error JSON
- Invalid phone numbers throw plain `Error` with masked phone in message
- Constructor throws on missing required config

## Clean Code Standards

**MANDATORY**: Follow the clean code rules in `.claude/skills/clean-code/SKILL.md` when writing, modifying, or reviewing code.

- **TypeScript**: `.claude/skills/clean-code/guidelines/typescript.md`
- **Testing**: `.claude/skills/clean-code/guidelines/testing.md`
- **Naming**: `.claude/skills/clean-code/guidelines/naming-conventions.md`

**Before committing**: Run through `.claude/skills/clean-code/checklists/code-review.md`

## Key Files

- `src/client.ts` — WhatsAppClient class with `sendTemplate()` method
- `src/types.ts` — All public interfaces (config, params, result, logger)
- `src/errors.ts` — WhatsAppApiError class
- `src/phone.ts` — E.164 validation, formatting, masking
- `src/index.ts` — Public API exports
- `__tests__/client.test.ts` — Client tests (mocked fetch)
- `__tests__/phone.test.ts` — Phone utility tests

## Verification

```bash
npm run typecheck && npm run test && npm run build
```

All three must pass before committing.
