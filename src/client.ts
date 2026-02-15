import { WhatsAppApiError } from "./errors.js"
import { isValidE164, maskPhone, toWhatsAppFormat } from "./phone.js"
import type {
  Logger,
  SendTemplateParams,
  SendTemplateResult,
  WhatsAppClientConfig,
} from "./types.js"

const DEFAULT_API_VERSION = "v21.0"

const consoleLogger: Logger = {
  info: (message, context) => console.info(message, context ?? ""),
  error: (message, context) => console.error(message, context ?? ""),
  warn: (message, context) => console.warn(message, context ?? ""),
}

/** WhatsApp Cloud API client for sending template messages */
export class WhatsAppClient {
  private readonly phoneNumberId: string
  private readonly accessToken: string
  private readonly apiVersion: string
  private readonly logger: Logger

  constructor(config: WhatsAppClientConfig) {
    if (!config.phoneNumberId) {
      throw new Error("WhatsAppClient: phoneNumberId is required")
    }
    if (!config.accessToken) {
      throw new Error("WhatsAppClient: accessToken is required")
    }

    this.phoneNumberId = config.phoneNumberId
    this.accessToken = config.accessToken
    this.apiVersion = config.apiVersion ?? DEFAULT_API_VERSION
    this.logger = config.logger ?? consoleLogger
  }

  /**
   * Send a pre-approved template message via WhatsApp Cloud API.
   *
   * @throws {WhatsAppApiError} When the API returns a non-OK response
   * @throws {Error} When the phone number is invalid E.164 format
   *
   * @example
   * const result = await client.sendTemplate({
   *   to: '+224620123456',
   *   template: 'order_ready',
   *   language: 'fr',
   *   parameters: ['OTAKOS-0042'],
   * })
   */
  async sendTemplate(params: SendTemplateParams): Promise<SendTemplateResult> {
    if (!isValidE164(params.to)) {
      throw new Error(
        `Invalid E.164 phone number: ${maskPhone(params.to)}. Expected format: +<country_code><number>`,
      )
    }

    const waPhone = toWhatsAppFormat(params.to)
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`

    const body = this.buildTemplateBody(waPhone, params)

    this.logger.info("Sending WhatsApp template", {
      template: params.template,
      phone: maskPhone(params.to),
    })

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      const error = WhatsAppApiError.fromResponse(response.status, errorBody)
      this.logger.error("WhatsApp send failed", {
        template: params.template,
        phone: maskPhone(params.to),
        status: response.status,
        code: error.code,
        error: error.message,
      })
      throw error
    }

    const data = (await response.json()) as {
      messages: Array<{ id: string }>
    }

    const messageId = data.messages[0]?.id ?? ""

    this.logger.info("WhatsApp template sent", {
      template: params.template,
      phone: maskPhone(params.to),
      messageId,
    })

    return { messageId, phone: waPhone }
  }

  private buildTemplateBody(
    waPhone: string,
    params: SendTemplateParams,
  ): Record<string, unknown> {
    const template: Record<string, unknown> = {
      name: params.template,
      language: { code: params.language },
    }

    if (params.parameters && params.parameters.length > 0) {
      template.components = [
        {
          type: "body",
          parameters: params.parameters.map((text) => ({
            type: "text",
            text,
          })),
        },
      ]
    }

    return {
      messaging_product: "whatsapp",
      to: waPhone,
      type: "template",
      template,
    }
  }
}
