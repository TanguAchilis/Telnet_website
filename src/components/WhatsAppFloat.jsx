import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { Icon } from '../icons'
import './WhatsAppFloat.css'

export default function WhatsAppFloat() {
    return (
        <a
            href={getWhatsAppUrl(whatsappMessages.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-float"
            aria-label="Chat on WhatsApp"
            title="Chat with us on WhatsApp"
        >
            <Icon name="whatsapp" size={28} />
            <span className="whatsapp-float-label">Chat with us</span>
        </a>
    )
}
