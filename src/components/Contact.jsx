import { useEffect, useState } from 'react'
import { whatsappMessages } from '../utils/whatsapp'
import { fetchContactInfo } from '../utils/content'
import './Contact.css'

const DEFAULT_CONTACT = {
    phone: '+237 671 827 893 / 674 410 358',
    email: 'telnetinc23@gmail.com',
    address: 'Tarred Malingo, behind Amazing Pharmacy, Molyko-Buea / St Claire',
    whatsapp: '237671827893',
    hours: 'Tue – Fri: 8am – 7pm\nSaturday: 9am – 6pm',
}

export default function Contact({ showHeader = true }) {
    const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)
    const [contact, setContact] = useState(DEFAULT_CONTACT)

    useEffect(() => {
        let active = true
        fetchContactInfo()
            .then((val) => { if (active && val) setContact({ ...DEFAULT_CONTACT, ...val }) })
            .catch(() => { /* keep defaults */ })
        return () => { active = false }
    }, [])

    const waDigits = (contact.whatsapp || '').replace(/\D/g, '')
    const waHref = `https://wa.me/${waDigits}?text=${encodeURIComponent(whatsappMessages.general)}`

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
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4>Phone</h4>
                                    <p>{contact.phone}</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon whatsapp-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
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
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </div>
                                <div>
                                    <h4>Email</h4>
                                    <p>{contact.email}</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div>
                                    <h4>Address</h4>
                                    <p>{contact.address}</p>
                                </div>
                            </div>

                            <div className="contact-item">
                                <div className="contact-item-icon">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                                    </svg>
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
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    )
}
