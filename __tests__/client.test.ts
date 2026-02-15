import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { WhatsAppClient } from "../src/client.js"
import { WhatsAppApiError } from "../src/errors.js"

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

function mockFetchSuccess(messageId = "wamid.test123") {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        messaging_product: "whatsapp",
        contacts: [{ input: "224620123456", wa_id: "224620123456" }],
        messages: [{ id: messageId }],
      }),
      { status: 200 },
    ),
  )
}

function mockFetchError(status: number, body: Record<string, unknown>) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status }),
  )
}

describe("WhatsAppClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("constructor", () => {
    it("throws when phoneNumberId is missing", () => {
      expect(
        () =>
          new WhatsAppClient({
            phoneNumberId: "",
            accessToken: "token",
          }),
      ).toThrow("phoneNumberId is required")
    })

    it("throws when accessToken is missing", () => {
      expect(
        () =>
          new WhatsAppClient({
            phoneNumberId: "123",
            accessToken: "",
          }),
      ).toThrow("accessToken is required")
    })
  })

  describe("sendTemplate", () => {
    it("sends a template message and returns result", async () => {
      const client = createClient()
      const fetchSpy = mockFetchSuccess("wamid.abc")

      const result = await client.sendTemplate({
        to: "+224620123456",
        template: "order_ready",
        language: "fr",
        parameters: ["OTAKOS-0042"],
      })

      expect(result).toEqual({
        messageId: "wamid.abc",
        phone: "224620123456",
      })

      expect(fetchSpy).toHaveBeenCalledOnce()
      const [url, options] = fetchSpy.mock.calls[0]!
      expect(url).toBe(
        "https://graph.facebook.com/v21.0/test-phone-id/messages",
      )
      expect(options).toMatchObject({
        method: "POST",
        headers: {
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        },
      })

      const body = JSON.parse(options!.body as string)
      expect(body).toEqual({
        messaging_product: "whatsapp",
        to: "224620123456",
        type: "template",
        template: {
          name: "order_ready",
          language: { code: "fr" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: "OTAKOS-0042" }],
            },
          ],
        },
      })
    })

    it("sends template without parameters", async () => {
      const client = createClient()
      const fetchSpy = mockFetchSuccess()

      await client.sendTemplate({
        to: "+14155551234",
        template: "welcome",
        language: "en",
      })

      const body = JSON.parse(fetchSpy.mock.calls[0]![1]!.body as string)
      expect(body.template).toEqual({
        name: "welcome",
        language: { code: "en" },
      })
      expect(body.template.components).toBeUndefined()
    })

    it("uses custom API version", async () => {
      const client = new WhatsAppClient({
        phoneNumberId: "test-phone-id",
        accessToken: "test-token",
        apiVersion: "v22.0",
        logger: silentLogger,
      })
      const fetchSpy = mockFetchSuccess()

      await client.sendTemplate({
        to: "+224620123456",
        template: "order_ready",
        language: "fr",
      })

      expect(fetchSpy.mock.calls[0]![0]).toContain("v22.0")
    })

    it("throws on invalid phone number", async () => {
      const client = createClient()

      await expect(
        client.sendTemplate({
          to: "224620123456", // missing +
          template: "order_ready",
          language: "fr",
        }),
      ).rejects.toThrow("Invalid E.164 phone number")
    })

    it("throws WhatsAppApiError on API failure", async () => {
      const client = createClient()
      mockFetchError(400, {
        error: {
          message: "Recipient phone number not in allowed list",
          type: "OAuthException",
          code: 131030,
          fbtrace_id: "trace123",
        },
      })

      await expect(
        client.sendTemplate({
          to: "+224620123456",
          template: "order_ready",
          language: "fr",
        }),
      ).rejects.toThrow(WhatsAppApiError)

      try {
        await client.sendTemplate({
          to: "+224620123456",
          template: "order_ready",
          language: "fr",
        })
      } catch (err) {
        // Second call will fail because mock is consumed — but we already verified above.
        // The assertion above is what matters.
      }
    })

    it("logs info on send and success", async () => {
      const client = createClient()
      mockFetchSuccess("wamid.xyz")

      await client.sendTemplate({
        to: "+224620123456",
        template: "order_ready",
        language: "fr",
      })

      expect(silentLogger.info).toHaveBeenCalledWith(
        "Sending WhatsApp template",
        expect.objectContaining({ template: "order_ready" }),
      )
      expect(silentLogger.info).toHaveBeenCalledWith(
        "WhatsApp template sent",
        expect.objectContaining({ messageId: "wamid.xyz" }),
      )
    })

    it("logs error on API failure", async () => {
      const client = createClient()
      mockFetchError(400, {
        error: {
          message: "Bad request",
          type: "OAuthException",
          code: 100,
        },
      })

      await expect(
        client.sendTemplate({
          to: "+224620123456",
          template: "order_ready",
          language: "fr",
        }),
      ).rejects.toThrow()

      expect(silentLogger.error).toHaveBeenCalledWith(
        "WhatsApp send failed",
        expect.objectContaining({ status: 400, code: 100 }),
      )
    })
  })
})
