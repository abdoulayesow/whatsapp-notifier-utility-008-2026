# Pre-Commit Code Review Checklist

Run through this checklist before committing changes.

## TypeScript

- [ ] No `any` types (use `unknown` for external data)
- [ ] `interface` for object shapes, `type` for unions
- [ ] `readonly` on immutable class properties
- [ ] All public types exported from `src/index.ts`
- [ ] Custom errors set `this.name` in constructor

## Security & Privacy

- [ ] Access tokens never logged or included in error messages
- [ ] Phone numbers always masked in log output (`maskPhone()`)
- [ ] No PII in thrown error messages
- [ ] URL construction uses template literals (no string concat with user input)

## Error Handling

- [ ] `WhatsAppApiError` used for all API failure paths
- [ ] `fromResponse()` handles unparseable JSON gracefully
- [ ] Constructor throws on missing required config
- [ ] Invalid phone format throws with masked phone in message

## Naming

- [ ] Functions: verb-first (`sendTemplate`, `isValidE164`)
- [ ] Booleans: `is/has/should/can` prefix
- [ ] Constants: `UPPER_SNAKE_CASE` with JSDoc
- [ ] Interfaces: PascalCase descriptive nouns

## Testing

- [ ] New behavior has corresponding tests
- [ ] Tests follow AAA pattern (Arrange → Act → Assert)
- [ ] `globalThis.fetch` mocked via `vi.spyOn` (not polyfill)
- [ ] Error paths tested (API errors, invalid input, missing config)
- [ ] `beforeEach` clears mocks, `afterEach` restores
- [ ] No test relies on other tests' state

## Package

- [ ] `src/index.ts` exports only public API
- [ ] No runtime dependencies added (check `dependencies` in package.json)
- [ ] Build produces ESM + CJS + .d.ts (`npm run build`)

## Final Verification

```bash
npm run typecheck && npm run test && npm run build
```

All three must pass before committing.
