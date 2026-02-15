# whatsapp-notify

Lightweight WhatsApp Cloud API client for sending template messages. Zero runtime dependencies, TypeScript-first, ESM + CJS.

## Install

```bash
npm install whatsapp-notify
```

> **Requires Node.js >= 18** (uses native `fetch`).

## Quick Start

```typescript
import { WhatsAppClient } from "whatsapp-notify"

const client = new WhatsAppClient({
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
})

await client.sendTemplate({
  to: "+224620123456",
  template: "order_ready",
  language: "fr",
  parameters: ["OTAKOS-0042"],
})
```

## API

### `new WhatsAppClient(config)`

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `phoneNumberId` | `string` | Yes | — | WhatsApp Business phone number ID |
| `accessToken` | `string` | Yes | — | Permanent system user access token |
| `apiVersion` | `string` | No | `"v21.0"` | Graph API version |
| `logger` | `Logger` | No | `console` | Custom logger (`info`/`error`/`warn`) |

### `client.sendTemplate(params)`

Send a pre-approved template message.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `to` | `string` | Yes | Recipient phone in E.164 format (`+224620123456`) |
| `template` | `string` | Yes | Template name registered in Meta Business Manager |
| `language` | `string` | Yes | Template language code (`"fr"`, `"en"`, etc.) |
| `parameters` | `string[]` | No | Positional body parameters for template placeholders |

**Returns** `Promise<SendTemplateResult>`:

```typescript
{ messageId: "wamid.HBgL...", phone: "224620123456" }
```

**Throws** `WhatsAppApiError` on API failure, `Error` on invalid phone format.

### Utilities

```typescript
import { isValidE164, toWhatsAppFormat, maskPhone } from "whatsapp-notify"

isValidE164("+224620123456")     // true
isValidE164("224620123456")      // false

toWhatsAppFormat("+224620123456") // "224620123456"

maskPhone("+224620123456")        // "+224****3456"
```

### Error Handling

```typescript
import { WhatsAppClient, WhatsAppApiError } from "whatsapp-notify"

try {
  await client.sendTemplate({ to: "+224620123456", template: "order_ready", language: "fr" })
} catch (err) {
  if (err instanceof WhatsAppApiError) {
    console.error(err.code)       // Meta error code (e.g., 131030)
    console.error(err.status)     // HTTP status (e.g., 400)
    console.error(err.fbtraceId)  // Meta trace ID for support
  }
}
```

**Fire-and-forget pattern** (for non-blocking notifications):

```typescript
client.sendTemplate({ ... }).catch((err) => {
  logger.error("Notification failed", { error: err.message })
})
```

### Custom Logger

```typescript
import pino from "pino"

const logger = pino()

const client = new WhatsAppClient({
  phoneNumberId: "...",
  accessToken: "...",
  logger: {
    info: (msg, ctx) => logger.info(ctx, msg),
    error: (msg, ctx) => logger.error(ctx, msg),
    warn: (msg, ctx) => logger.warn(ctx, msg),
  },
})
```

---

## WhatsApp Cloud API Setup

### What You Need

| Item | Where to Get It | Status |
|------|----------------|--------|
| Meta Business Account | [business.facebook.com](https://business.facebook.com) | |
| Business Verification | Meta Business Manager → Settings → Business Info | |
| WhatsApp Business Account | Meta Business Manager → WhatsApp → Overview | |
| Dedicated Phone Number | New SIM card (must not be on personal WhatsApp) | |
| System User Access Token | Business Settings → Users → System Users | |
| Approved Message Template | WhatsApp Manager → Message Templates | |

### Step-by-Step

#### 1. Create Meta Business Account

Go to [business.facebook.com](https://business.facebook.com) and create an account for your business.

#### 2. Verify Your Business

In Meta Business Manager → **Settings** → **Business Info** → **Start Verification**.

Documents required:
- Business registration certificate (e.g., Registre du commerce)
- Utility bill or bank statement showing business address
- Business owner ID document

**Timeline**: 2–7 business days.

#### 3. Set Up WhatsApp Business

In Meta Business Manager → **WhatsApp** → **Getting Started**:
1. Create a WhatsApp Business Account
2. Add a dedicated phone number (new SIM — cannot be a personal WhatsApp number)
3. Verify via SMS or voice call

#### 4. Generate Access Token

1. Go to **Business Settings** → **Users** → **System Users**
2. Create a System User (type: Admin)
3. Add the WhatsApp Business Account as an asset with full control
4. Click **Generate Token**
5. Select `whatsapp_business_messaging` and `whatsapp_business_management` permissions
6. Copy the token — this is your `WHATSAPP_ACCESS_TOKEN`

> This token does **not** expire. No OAuth refresh logic needed.

#### 5. Get Phone Number ID

1. Go to **WhatsApp** → **API Setup** in Meta Business Manager
2. Your **Phone Number ID** is displayed under the phone number dropdown
3. This is your `WHATSAPP_PHONE_NUMBER_ID`

#### 6. Create Message Template

1. Go to **WhatsApp Manager** → **Message Templates** → **Create Template**
2. Fill in:
   - **Category**: Utility
   - **Name**: `order_ready`
   - **Language**: French (fr)
   - **Body**: `O'Takos : Votre commande {{1}} est prête ! Rendez-vous au comptoir.`
   - **Sample value** for `{{1}}`: `OTAKOS-0042`
3. Submit for review

**Approval timeline**: 24–48 hours.

#### 7. Test with Sandbox

Before going live, Meta provides a test phone number in the API Setup dashboard. Use it to send messages to up to 5 verified recipient numbers.

```bash
# Quick test
curl -X POST \
  "https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_TEST_NUMBER",
    "type": "template",
    "template": {
      "name": "order_ready",
      "language": { "code": "fr" },
      "components": [{
        "type": "body",
        "parameters": [{ "type": "text", "text": "OTAKOS-0042" }]
      }]
    }
  }'
```

### Environment Variables

```bash
# .env
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxx...
```

### Rate Limits

| Tier | Daily Limit | How to Unlock |
|------|-------------|---------------|
| New (unverified) | 250 messages/day | — |
| Verified business | 1,000/day | Complete business verification |
| High quality | 10,000/day | Maintain good quality rating |
| Scale | 100,000/day | Auto-upgraded based on volume + quality |

**Throughput**: 80 messages/second (Cloud API).

### Pricing

| Category | Cost (Rest of Africa) | When |
|----------|----------------------|------|
| Utility | ~$0.004 (~40 GNF) | Business-initiated template messages |
| Service | Free | Replies within 24h of customer message |
| Marketing | ~$0.009 (~90 GNF) | Promotional messages (not recommended) |

---

## Development

```bash
npm run typecheck   # tsc --noEmit
npm run test        # vitest run
npm run test:watch  # vitest (watch mode)
npm run build       # tsup (ESM + CJS + .d.ts)
```

## License

MIT
