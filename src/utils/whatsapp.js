// WhatsApp utility for Telnet Cameroon.
//
// The number is editable in Admin → Content → Contact Details, stored under the
// `contact_info` setting. useWhatsAppNumberSync() (called once in PublicLayout)
// loads it and calls setWhatsAppNumber below, so every getWhatsAppUrl() caller
// picks it up without threading it through props; there are a dozen of them,
// across the navbar, hero, footer, floating button, services, shop, product
// pages and the 404.

import { CONTACT_FALLBACK, getSiteContact } from './siteContact.js'

/** Used before the stored value loads, and if it's unset or unreachable. */
export const DEFAULT_WHATSAPP_NUMBER = CONTACT_FALLBACK.whatsapp

/** wa.me wants digits only; strips '+', spaces and punctuation. */
export function normalizeWhatsAppNumber(value) {
    const digits = String(value ?? '').replace(/\D/g, '')
    return digits || null
}

// getSiteContact() already merges the value scripts/prerender.js seeds into the
// page, so the first render has the right number rather than showing the
// fallback until the runtime fetch resolves.
let currentNumber = normalizeWhatsAppNumber(getSiteContact().whatsapp) || DEFAULT_WHATSAPP_NUMBER

export function getWhatsAppNumber() {
    return currentNumber
}

/**
 * Points every WhatsApp link at a new number.
 * Returns true if the value actually changed, so callers can skip a re-render.
 */
export function setWhatsAppNumber(value) {
    const digits = normalizeWhatsAppNumber(value)
    if (!digits || digits === currentNumber) return false
    currentNumber = digits
    return true
}

/**
 * Generates a WhatsApp click-to-chat URL with a pre-drafted message.
 * @param {string} message - The pre-drafted message to send
 * @returns {string} WhatsApp URL
 */
export function getWhatsAppUrl(message) {
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${currentNumber}?text=${encodedMessage}`
}

/**
 * Pre-drafted messages for different inquiry types
 */
export const whatsappMessages = {
    general: 'Hello Telnet Cameroon! I would like to inquire about your services.',

    // Services
    laptopSales: 'Hello Telnet Cameroon! I am interested in purchasing a laptop. Could you please share the available models and pricing?',
    cctv: 'Hello Telnet Cameroon! I would like to inquire about your CCTV/security camera installation services. Could you share more details?',
    internet: 'Hello Telnet Cameroon! I am interested in your internet installation services (Starlink). Could you provide more information?',
    training: 'Hello Telnet Cameroon! I would like to learn more about your tech training programs. What courses are currently available?',
    hardware: 'Hello Telnet Cameroon! I need help with hardware maintenance/repair. Could you share your available services and rates?',
    cybersecurity: 'Hello Telnet Cameroon! I would like to inquire about your cybersecurity services. Could you provide more information?',

    // Shop categories
    studentLaptops: 'Hello Telnet Cameroon! I am looking for a student laptop. Could you please share available models and prices?',
    gamingLaptops: 'Hello Telnet Cameroon! I am interested in a gaming laptop. What models and pricing do you have available?',
    businessLaptops: 'Hello Telnet Cameroon! I need a business laptop. Could you recommend some options with pricing?',
    desktopScreens: 'Hello Telnet Cameroon! I would like to purchase a desktop screen/monitor. What do you have in stock?',
    accessories: 'Hello Telnet Cameroon! I am looking for laptop accessories. Could you share what is available?',
    networkingTools: 'Hello Telnet Cameroon! I need networking tools/equipment. What do you currently have in stock?',

    // Contact
    quote: 'Hello Telnet Cameroon! I would like to request a quote for your services. Here are the details: ',
    internship: 'Hello Telnet Cameroon! I am interested in your internship program. Could you share more information about how to apply?',
    internshipSubmitted: 'Hello Telnet Cameroon! I have just submitted my internship application on your website. I would like to confirm it was received and ask about the next steps.',
}

/**
 * Opens WhatsApp with a pre-drafted message
 */
export function openWhatsApp(messageKey) {
    const message = whatsappMessages[messageKey] || whatsappMessages.general
    window.open(getWhatsAppUrl(message), '_blank')
}
