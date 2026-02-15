import { describe, expect, it } from "vitest"
import { isValidE164, maskPhone, toWhatsAppFormat } from "../src/phone.js"

describe("isValidE164", () => {
  it("accepts valid E.164 numbers", () => {
    expect(isValidE164("+224620123456")).toBe(true)
    expect(isValidE164("+14155551234")).toBe(true)
    expect(isValidE164("+33612345678")).toBe(true)
    expect(isValidE164("+8613800138000")).toBe(true)
    expect(isValidE164("+1234567")).toBe(true) // 7 digits — minimum
  })

  it("rejects numbers without + prefix", () => {
    expect(isValidE164("224620123456")).toBe(false)
  })

  it("rejects numbers starting with +0", () => {
    expect(isValidE164("+0123456789")).toBe(false)
  })

  it("rejects numbers that are too short", () => {
    expect(isValidE164("+12345")).toBe(false) // 5 digits
    expect(isValidE164("+123456")).toBe(false) // 6 digits
  })

  it("rejects numbers that are too long", () => {
    expect(isValidE164("+1234567890123456")).toBe(false) // 16 digits
  })

  it("rejects numbers with non-digit characters", () => {
    expect(isValidE164("+224-620-123-456")).toBe(false)
    expect(isValidE164("+224 620 123 456")).toBe(false)
    expect(isValidE164("+224abc123456")).toBe(false)
  })

  it("rejects empty string", () => {
    expect(isValidE164("")).toBe(false)
  })
})

describe("toWhatsAppFormat", () => {
  it("strips leading + from E.164 numbers", () => {
    expect(toWhatsAppFormat("+224620123456")).toBe("224620123456")
    expect(toWhatsAppFormat("+14155551234")).toBe("14155551234")
  })

  it("returns unchanged if no + prefix", () => {
    expect(toWhatsAppFormat("224620123456")).toBe("224620123456")
  })
})

describe("maskPhone", () => {
  it("masks middle digits of phone numbers", () => {
    expect(maskPhone("+224620123456")).toBe("+224****3456")
  })

  it("handles short numbers", () => {
    expect(maskPhone("1234")).toBe("****")
    expect(maskPhone("123")).toBe("****")
  })

  it("handles numbers without + prefix", () => {
    expect(maskPhone("224620123456")).toBe("****3456")
  })
})
