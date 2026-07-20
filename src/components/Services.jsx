import { useEffect, useState } from 'react'
import { getWhatsAppUrl } from '../utils/whatsapp'
import { fetchServices } from '../utils/content'
import './Services.css'

// Fallback content (used before the CMS migration is run / DB is empty).
const DEFAULT_SERVICES = [
    {
        icon: '💻',
        title: 'Laptop Sales',
        description: 'We provide high-quality laptops and accessories suitable for students, professionals, and businesses. Our products come from trusted brands like HP, Dell, Lenovo and more.',
        features: ['Brand New & Refurbished', 'All Accessories', 'Warranty Support'],
    },
    {
        icon: '📹',
        title: 'Security Camera Installation',
        description: 'Protect your property with reliable surveillance systems. We install modern CCTV solutions from trusted brands for homes, offices, and businesses.',
        features: ['HD & IP Cameras', 'Remote Monitoring', '24/7 Recording'],
    },
    {
        icon: '🌐',
        title: 'Internet Installation',
        description: 'We install and configure high-speed satellite internet using Starlink technology to ensure reliable connectivity even in remote areas.',
        features: ['Starlink Setup', 'Wi-Fi Configuration', 'Network Optimization'],
    },
    {
        icon: '🎓',
        title: 'Tech Training',
        description: 'Our training programs help individuals gain practical technology skills including computer fundamentals, networking, CCTV installation, graphic design, and web development.',
        features: ['Computer Fundamentals', 'Networking & CCTV', 'Graphic Design & Web Dev'],
    },
    {
        icon: '🔧',
        title: 'Hardware Maintenance',
        description: 'Expert repair and maintenance for laptops, desktops, printers, and other IT equipment to keep your systems running.',
        features: ['Diagnosis & Repair', 'Component Upgrade', 'Preventive Care'],
    },
    {
        icon: '🔒',
        title: 'Cybersecurity',
        description: 'Protect your digital assets with our comprehensive cybersecurity solutions, assessments, and awareness training.',
        features: ['Security Audits', 'Data Protection', 'Awareness Training'],
    },
]

function serviceMessage(title) {
    return `Hello Telnet Cameroon! I would like to inquire about your ${title} service. Could you share more details?`
}

export default function Services({ showHeader = true }) {
    const [services, setServices] = useState(DEFAULT_SERVICES)

    useEffect(() => {
        let active = true
        fetchServices()
            .then((rows) => {
                if (active && Array.isArray(rows) && rows.length > 0) {
                    setServices(rows.map((s) => ({
                        icon: s.icon || '🛠️',
                        title: s.title,
                        description: s.description,
                        features: Array.isArray(s.features) ? s.features : [],
                    })))
                }
            })
            .catch(() => { /* keep fallback */ })
        return () => { active = false }
    }, [])

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
                            key={service.title || index}
                            className={`service-card glass-card animate-on-scroll bento-item-${index + 1}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="service-icon service-icon-emoji">{service.icon}</div>
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-desc">{service.description}</p>
                            {service.features.length > 0 && (
                                <ul className="service-features">
                                    {service.features.map((feature, i) => (
                                        <li key={i}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <a
                                href={getWhatsAppUrl(serviceMessage(service.title))}
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
