# TypeScript Patterns

Codebase-grounded examples for TypeScript patterns used in this package.

## `interface` vs `type`

Use `interface` for object shapes (extendable). Use `type` for unions.

```typescript
// Object shape — use interface
export interface WhatsAppClientConfig {
  phoneNumberId: string
  accessToken: string
  apiVersion?: string
  logger?: Logger
}

// Object shape — use interface
export interface SendTemplateParams {
  to: string
  template: string
  language: string
  parameters?: string[]
}
```

## `unknown` for External Data

Type external/untrusted data as `unknown`, not `any`.

```typescript
// Meta API error response — parsed from unknown JSON
export interface MetaApiErrorBody {
  error: {
    message: string
    type: string
    code: number
    fbtrace_id?: string
  }
}

// Parse with explicit casting after JSON.parse
const parsed = JSON.parse(body) as MetaApiErrorBody
```

## `as const` for Constants

```typescript
const DEFAULT_API_VERSION = "v21.0" as const
```

## Class Design

- Constructor validates required config and throws early
- Private methods for internal logic
- Public methods documented with JSDoc + @example

```typescript
export class WhatsAppClient {
  private readonly phoneNumberId: string  // readonly for immutability
  private readonly accessToken: string

  constructor(config: WhatsAppClientConfig) {
    if (!config.phoneNumberId) {
      throw new Error("WhatsAppClient: phoneNumberId is required")
    }
    // ...
  }

  /** @example await client.sendTemplate({ to: '+224620123456', ... }) */
  async sendTemplate(params: SendTemplateParams): Promise<SendTemplateResult> {
    // ...
  }

  private buildTemplateBody(...): Record<string, unknown> {
    // ...
  }
}
```

## Custom Error Classes

Always set `this.name` for proper `instanceof` checks and stack traces.

```typescript
export class WhatsAppApiError extends Error {
  readonly code: number
  readonly status: number

  constructor(message: string, code: number, status: number, ...) {
    super(message)
    this.name = "WhatsAppApiError"  // Required for proper error identification
    // ...
  }

  static fromResponse(status: number, body: string): WhatsAppApiError {
    // Static factory for parsing external error shapes
  }
}
```

## Readonly Properties

Use `readonly` for properties set once in the constructor.

```typescript
class WhatsAppClient {
  private readonly phoneNumberId: string
  private readonly accessToken: string
  private readonly apiVersion: string
  private readonly logger: Logger
}
```
