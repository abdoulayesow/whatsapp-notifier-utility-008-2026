import type { MetaApiErrorBody } from "./types.js"

/** Error thrown when WhatsApp Cloud API returns a non-OK response */
export class WhatsAppApiError extends Error {
  /** Meta-specific error code (e.g., 131030 for invalid recipient) */
  readonly code: number
  /** HTTP status code */
  readonly status: number
  /** Meta error type (e.g., "OAuthException") */
  readonly type: string
  /** Meta trace ID for support escalation */
  readonly fbtraceId: string | undefined

  constructor(
    message: string,
    code: number,
    status: number,
    type: string,
    fbtraceId?: string,
  ) {
    super(message)
    this.name = "WhatsAppApiError"
    this.code = code
    this.status = status
    this.type = type
    this.fbtraceId = fbtraceId
  }

  /** Create from Meta API error response */
  static fromResponse(status: number, body: string): WhatsAppApiError {
    try {
      const parsed = JSON.parse(body) as MetaApiErrorBody
      const err = parsed.error
      return new WhatsAppApiError(
        err.message,
        err.code,
        status,
        err.type,
        err.fbtrace_id,
      )
    } catch {
      return new WhatsAppApiError(
        `WhatsApp API error (HTTP ${status}): ${body}`,
        0,
        status,
        "Unknown",
      )
    }
  }
}
