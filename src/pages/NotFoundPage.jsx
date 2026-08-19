import { Link } from 'react-router-dom'
import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { useSeo } from '../utils/useSeo'
import './PageBanner.css'
import './NotFoundPage.css'

const suggestions = [
    { to: '/shop', label: 'Shop laptops & accessories' },
    { to: '/services', label: 'Our services' },
    { to: '/internship', label: 'Internship programs' },
    { to: '/contact', label: 'Contact us' },
]

export default function NotFoundPage() {
    useSeo({
        title: 'Page not found | Telnet Cameroon',
        description: 'The page you are looking for does not exist or has moved.',
        noindex: true,
    })

    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <span className="page-banner-label">Error 404</span>
                    <h1 className="page-banner-title">Page not found</h1>
                    <p className="page-banner-desc">
                        The page you're looking for doesn't exist or has moved.
                    </p>
                </div>
            </div>

            <section className="section">
                <div className="container nf-body">
                    <p className="nf-lead">Here's where most people are heading:</p>

                    <ul className="nf-links">
                        {suggestions.map((item) => (
                            <li key={item.to}>
                                <Link to={item.to}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>

                    <div className="nf-actions">
                        <Link to="/" className="btn btn-primary">Back to home</Link>
                        <a
                            href={getWhatsAppUrl(whatsappMessages.general)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                        >
                            Ask us on WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </>
    )
}
