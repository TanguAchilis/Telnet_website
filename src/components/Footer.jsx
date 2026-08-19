import { Link } from 'react-router-dom'
import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { getSiteContact } from '../utils/siteContact'
import { Icon } from '../icons'
import './Footer.css'

export default function Footer() {
    const currentYear = new Date().getFullYear()
    // Editable at Admin → Content → Contact Details. These three were hardcoded
    // and had gone stale against the stored record.
    const contact = getSiteContact()

    const handleBackToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="/Our team/logo2.png" alt="Telnet" className="footer-logo-img" />
                            <span className="footer-brand-text">
                                <span className="brand-name">TELNET</span>
                                <span className="brand-tag">CAMEROON</span>
                            </span>
                        </div>
                        <p className="footer-desc">
                            Dedicated to providing quality and reliable digital solutions that help
                            individuals and businesses stay connected and productive.
                        </p>
                    </div>

                    <div className="footer-links-group">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/services">Services</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/team">Our Team</Link></li>
                            <li><Link to="/gallery">Gallery</Link></li>
                            <li><Link to="/internship">Internship</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4>Services</h4>
                        <ul>
                            <li><Link to="/shop">Laptop Sales</Link></li>
                            <li><Link to="/services">Security Camera Installation</Link></li>
                            <li><Link to="/services">Internet Setup</Link></li>
                            <li><Link to="/services">Tech Training</Link></li>
                            <li><Link to="/internship">Internship Program</Link></li>
                        </ul>
                    </div>

                    <div className="footer-links-group">
                        <h4>Contact</h4>
                        <ul>
                            <li>
                                <Icon name="phone" size={14} />
                                {contact.phone}
                            </li>
                            <li>
                                <Icon name="mail" size={14} />
                                {contact.email}
                            </li>
                            <li>
                                <Icon name="pin" size={14} />
                                {contact.address}
                            </li>
                            <li>
                                <a
                                    href={getWhatsAppUrl(whatsappMessages.general)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-whatsapp"
                                >
                                    <Icon name="whatsapp" size={14} />
                                    Chat on WhatsApp
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© {currentYear} Telnet Cameroon. All rights reserved.</p>
                    <button
                        type="button"
                        className="back-to-top"
                        aria-label="Back to top"
                        onClick={handleBackToTop}
                    >
                        <Icon name="chevron-up" size={20} />
                    </button>
                </div>
            </div>
        </footer>
    )
}
