import { useState } from 'react'
import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { getSiteContact } from '../utils/siteContact'
import { Icon } from '../icons'
import './Contact.css'

export default function Contact({ showHeader = true }) {
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)

    // Loaded once in PublicLayout via useSiteContact. This component used to
    // fetch the same record again and keep its own defaults, which is how its
    // copy drifted from the stored values.
    const contact = getSiteContact()

    // Built by the shared helper rather than assembled here, so this link can't
    // drift from the dozen other WhatsApp buttons on the site.
    const waHref = getWhatsAppUrl(whatsappMessages.general)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 4000)
        setFormData({ name: '', email: '', whatsapp: '', subject: '', message: '' })
    }

    return (
        <section id="contact" className="section contact-section">
            <div className="container">
                {showHeader && (
                    <div className="section-header">
                        <span className="section-label">Get In Touch</span>
                        <h2 className="section-title">Contact Us</h2>
                        <p className="section-subtitle">
                            Have a project in mind or need tech support? Reach out to us today.
                        </p>
                    </div>
                )}

                <div className="contact-grid">
                    <div className="contact-info">
                        <div className="contact-info-card glass-card">
                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <Icon name="phone" size={22} />
                                </div>
                                <div>
                                    <h4>Phone</h4>
                                    <p>{contact.phone}</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon whatsapp-icon">
                                    <Icon name="whatsapp" size={22} />
                                </div>
                                <div>
                                    <h4>WhatsApp</h4>
                                    <a
                                        href={waHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-whatsapp-link"
                                    >
                                        Chat with us now
                                    </a>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <Icon name="mail" size={22} />
                                </div>
                                <div>
                                    <h4>Email</h4>
                                    <p>{contact.email}</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <Icon name="pin" size={22} />
                                </div>
                                <div>
                                    <h4>Address</h4>
                                    <p>{contact.address}</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <Icon name="clock" size={22} />
                                </div>
                                <div>
                                    <h4>Business Hours</h4>
                                    <p>
                                        {(contact.hours || '').split('\n').map((line, i, arr) => (
                                            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                                        ))}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form className="contact-form glass-card" onSubmit={handleSubmit}>
                        {submitted && (
                            <div className="form-success">
                                <Icon name="check-circle" size={20} />
                                Message sent successfully! We'll get back to you soon.
                            </div>
                        )}
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="whatsapp">WhatsApp Number</label>
                                <input type="tel" id="whatsapp" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+237 6XX XXX XXX" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea id="message" name="message" rows="5" value={formData.message} onChange={handleChange} placeholder="Tell us about your project or question..." required />
                        </div>
                        <button type="submit" className="btn btn-primary form-submit">
                            <Icon name="send" size={18} />
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}
