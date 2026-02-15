# Testing Patterns

Codebase-grounded examples for testing with Vitest.

## AAA Pattern

Every test follows Arrange → Act → Assert.

```typescript
it("sends a template message and returns result", async () => {
  // Arrange
  const client = createClient()
  const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify({
      messages: [{ id: "wamid.abc" }],
    }), { status: 200 }),
  )

  // Act
  const result = await client.sendTemplate({
    to: "+224620123456",
    template: "order_ready",
    language: "fr",
    parameters: ["OTAKOS-0042"],
  })

  // Assert
  expect(result).toEqual({ messageId: "wamid.abc", phone: "224620123456" })
  expect(fetchSpy).toHaveBeenCalledOnce()
})
```

## Fetch Mocking

Mock `globalThis.fetch` with `vi.spyOn` — never install a fetch polyfill for tests.

```typescript
// Success mock
function mockFetchSuccess(messageId = "wamid.test123") {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(
      JSON.stringify({ messages: [{ id: messageId }] }),
      { status: 200 },
    ),
  )
}

// Error mock
function mockFetchError(status: number, body: Record<string, unknown>) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status }),
  )
}
```

## Test Helper Functions

Extract reusable test helpers (client factory, mock setup):

```typescript
const silentLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}

function createClient() {
  return new WhatsAppClient({
    phoneNumberId: "test-phone-id",
    accessToken: "test-token",
    logger: silentLogger,
  })
}
```

## Mock Cleanup

Always restore mocks between tests:

```typescript
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})
```

## Edge Case Coverage

| Edge Case | What It Tests |
|-----------|---------------|
| Missing + prefix | Phone validation rejects `224620123456` |
| Too short number | Phone validation rejects `+12345` |
| Empty config | Constructor throws on empty `phoneNumberId` |
| API 400 error | `WhatsAppApiError` thrown with Meta error code |
| API 500 error | Error with unparseable body handled gracefully |
| No parameters | Template sent without `components` array |

## Test Naming

Descriptive `it("...")` strings that read as behavior specs:

```typescript
it("sends a template message and returns result")
it("throws on invalid phone number")
it("throws WhatsAppApiError on API failure")
it("logs info on send and success")
it("uses custom API version")
```
