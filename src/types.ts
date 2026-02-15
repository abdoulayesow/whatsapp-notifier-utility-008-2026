/** Pluggable logger interface — defaults to console */
export interface Logger {
  info(message: string, context?: Record<string, unknown>): void
  error(message: string, context?: Record<string, unknown>): void
  warn(message: string, context?: Record<string, unknown>): void
}

/** Configuration for WhatsAppClient */
export interface WhatsAppClientConfig {
  /** WhatsApp Business phone number ID (from Meta Business Manager) */
  phoneNumberId: string
  /** Permanent system user access token with whatsapp_business_messaging permission */
  accessToken: string
  /** Graph API version (default: "v21.0") */
  apiVersion?: string
  /** Custom logger (default: console) */
  logger?: Logger
}

/** Parameters for sending a template message */
export interface SendTemplateParams {
  /** Recipient phone number in E.164 format (e.g., "+224620123456") */
  to: string
  /** Template name as registered in Meta Business Manager (e.g., "order_ready") */
  template: string
  /** Template language code (e.g., "fr", "en") */
  language: string
  /** Positional body parameters to fill template placeholders */
  parameters?: string[]
}

/** Result of a successful template send */
export interface SendTemplateResult {
  /** WhatsApp message ID (e.g., "wamid.HBgL...") */
  messageId: string
  /** Recipient phone in WhatsApp format (without +) */
  phone: string
}

/** Raw Meta API error shape */
export interface MetaApiErrorBody {
  error: {
    message: string
    type: string
    code: number
    fbtrace_id?: string
  }
}
