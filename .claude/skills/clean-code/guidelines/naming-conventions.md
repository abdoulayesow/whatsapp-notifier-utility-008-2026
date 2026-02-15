# Naming Conventions

Comprehensive naming rules with examples from this package.

## File Naming

| Pattern | Convention | Example |
|---------|-----------|---------|
| Source files | camelCase | `client.ts`, `phone.ts`, `errors.ts` |
| Type files | camelCase | `types.ts` |
| Entry point | camelCase | `index.ts` |
| Tests | source + `.test.ts` | `client.test.ts`, `phone.test.ts` |
| Config | camelCase | `tsup.config.ts`, `vitest.config.ts` |

## Class Naming

| Pattern | Convention | Example |
|---------|-----------|---------|
| Client classes | PascalCase + `Client` | `WhatsAppClient` |
| Error classes | PascalCase + `Error` | `WhatsAppApiError` |

## Function Naming

| Pattern | Convention | Examples |
|---------|-----------|---------|
| Validation | `is` + adjective | `isValidE164()` |
| Conversion | `to` + target | `toWhatsAppFormat()` |
| Masking | `mask` + noun | `maskPhone()` |
| Sending | `send` + noun | `sendTemplate()` |
| Factory | `from` + source | `fromResponse()` |

## Interface Naming

| Pattern | Convention | Examples |
|---------|-----------|---------|
| Config | `ServiceNameConfig` | `WhatsAppClientConfig` |
| Params | `VerbNounParams` | `SendTemplateParams` |
| Results | `VerbNounResult` | `SendTemplateResult` |
| Contracts | PascalCase noun | `Logger` |
| External shapes | `ServiceApiNoun` | `MetaApiErrorBody` |

## Variable & Constant Naming

| Pattern | Convention | Examples |
|---------|-----------|---------|
| Module constants | `UPPER_SNAKE_CASE` | `DEFAULT_API_VERSION` |
| Class properties | `camelCase` | `phoneNumberId`, `accessToken` |
| Local variables | `camelCase` | `waPhone`, `errorBody` |

## Constants with JSDoc

```typescript
/** Default WhatsApp Cloud API version */
const DEFAULT_API_VERSION = "v21.0"
```
