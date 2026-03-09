import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import './Services.css'

const services = [
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
        title: 'Laptop Sales',
        desc: 'High-quality laptops and accessories from trusted brands like HP, Dell, Lenovo — suitable for students, professionals, and businesses.',
        features: ['Brand New & Refurbished', 'All Accessories', 'Warranty Support'],
        whatsappKey: 'laptopSales',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" />
            </svg>
        ),
        title: 'CCTV Installation',
        desc: 'Protect your property with reliable, modern surveillance systems installed by certified professionals.',
        features: ['HD & IP Cameras', 'Remote Monitoring', '24/7 Recording'],
        whatsappKey: 'cctv',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
        ),
        title: 'Internet Installation',
        desc: 'High-speed satellite internet using Starlink technology — reliable connectivity even in remote areas.',
        features: ['Starlink Setup', 'Wi-Fi Configuration', 'Network Optimization'],
        whatsappKey: 'internet',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
        ),
        title: 'Tech Training',
        desc: 'Practical technology skills training including networking, CCTV installation, graphic design, and web development.',
        features: ['Hands-on Practice', 'Certification', 'Internship Program'],
        whatsappKey: 'training',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
        ),
        title: 'Hardware Maintenance',
        desc: 'Expert repair and maintenance for laptops, desktops, printers, and other IT equipment to keep your systems running.',
        features: ['Diagnosis & Repair', 'Component Upgrade', 'Preventive Care'],
        whatsappKey: 'hardware',
    },
    {
        icon: (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: 'Cybersecurity',
        desc: 'Protect your digital assets with our comprehensive cybersecurity solutions, assessments, and awareness training.',
        features: ['Security Audits', 'Data Protection', 'Awareness Training'],
        whatsappKey: 'cybersecurity',
    },
]

export default function Services({ showHeader = true }) {
    return (
        <section id="services" className="section services-section">
            <div className="container">
                {showHeader && (
                    <div className="section-header">
                        <span className="section-label">What We Do</span>
                        <h2 className="section-title">Our <span className="text-gradient-accent">Services</span></h2>
                        <p className="section-subtitle">
                            Comprehensive technology solutions tailored to your needs — from hardware to security.
                        </p>
                    </div>
                )}

                <div className="services-bento-grid">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className={`service-card glass-card animate-on-scroll bento-item-${index + 1}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="service-icon">{service.icon}</div>
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-desc">{service.desc}</p>
                            <ul className="service-features">
                                {service.features.map((feature, i) => (
                                    <li key={i}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <a
                                href={getWhatsAppUrl(whatsappMessages[service.whatsappKey])}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="service-inquire-btn"
                            >
                                💬 Inquire on WhatsApp
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
