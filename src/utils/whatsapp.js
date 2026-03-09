// WhatsApp utility for Telnet Cameroon
const WHATSAPP_NUMBER = '237671827893'

/**
 * Generates a WhatsApp click-to-chat URL with a pre-drafted message.
 * @param {string} message - The pre-drafted message to send
 * @returns {string} WhatsApp URL
 */
export function getWhatsAppUrl(message) {
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`
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
}

/**
 * Opens WhatsApp with a pre-drafted message
 */
export function openWhatsApp(messageKey) {
    const message = whatsappMessages[messageKey] || whatsappMessages.general
    window.open(getWhatsAppUrl(message), '_blank')
}
