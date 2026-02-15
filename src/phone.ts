/**
 * Validate E.164 phone number format.
 * E.164: + followed by 7-15 digits (country code + subscriber number).
 *
 * @example
 * isValidE164("+224620123456") // true
 * isValidE164("224620123456")  // false — missing +
 * isValidE164("+1234")         // false — too short
 */
export function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone)
}

/**
 * Convert E.164 phone to WhatsApp API format (strip leading +).
 * WhatsApp Cloud API expects numbers without the + prefix.
 *
 * @example
 * toWhatsAppFormat("+224620123456") // "224620123456"
 */
export function toWhatsAppFormat(phone: string): string {
  return phone.replace(/^\+/, "")
}

/**
 * Mask phone number for safe logging (show country code + last 4 digits).
 *
 * @example
 * maskPhone("+224620123456") // "+224****3456"
 * maskPhone("12345")         // "****2345"
 */
export function maskPhone(phone: string): string {
  if (phone.length <= 4) return "****"
  const prefix = phone.startsWith("+") ? phone.slice(0, 4) : ""
  const suffix = phone.slice(-4)
  return `${prefix}****${suffix}`
}
