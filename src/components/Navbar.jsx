import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { getSiteContact } from '../utils/siteContact'
import { Icon } from '../icons'
import './Navbar.css'

export default function Navbar() {
    const [openMenuPathname, setOpenMenuPathname] = useState(null)
    const [scrolled, setScrolled] = useState(false)
    const location = useLocation()
    const isOpen = openMenuPathname === location.pathname

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const toggleMenu = () => {
        setOpenMenuPathname((current) => (current === location.pathname ? null : location.pathname))
    }

    const closeMenu = () => {
        setOpenMenuPathname(null)
    }

    const navLinks = [
        { label: 'Home', to: '/' },
        { label: 'Services', to: '/services' },
        { label: 'About', to: '/about' },
        { label: 'Team', to: '/team' },
        { label: 'Gallery', to: '/gallery' },
        { label: 'Shop', to: '/shop' },
        { label: 'Internship', to: '/internship' },
        { label: 'Contact', to: '/contact' },
    ]

    return (
        <>
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    <img src="/Our team/logo.png" alt="Telnet Cameroon" className="navbar-logo" />
                    <span className="navbar-brand-text">
                        <span className="brand-name">TELNET</span>
                        <span className="brand-tag">CAMEROON</span>
                    </span>
                </Link>

                <ul className="navbar-links">
                    {navLinks.map((link) => (
                        <li key={link.to}>
                            <Link
                                to={link.to}
                                className={location.pathname === link.to ? 'active' : ''}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>

                <a
                    href={getWhatsAppUrl(whatsappMessages.quote)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary nav-cta-desktop"
                >
                    <Icon name="chat" size={16} />
                    Get a Quote
                </a>

                <button
                    className={`hamburger ${isOpen ? 'active' : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                    aria-expanded={isOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>

        {/* Mobile full-screen menu: outside nav to avoid backdrop-filter stacking context */}
        <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
            {/* Nav Links */}
            <ul className="mobile-nav-list">
                {navLinks.map((link, i) => (
                    <li key={link.to} className="mobile-nav-item">
                        <Link
                            to={link.to}
                            className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
                            onClick={closeMenu}
                        >
                            <span className="mobile-nav-number">0{i + 1}</span>
                            <span className="mobile-nav-label">{link.label}</span>
                            <Icon name="arrow-right" size={18} className="mobile-nav-arrow" />
                        </Link>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <div className="mobile-menu-footer">
                <a
                    href={getWhatsAppUrl(whatsappMessages.quote)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-cta-btn"
                >
                    <Icon name="whatsapp" size={18} />
                    Get a Free Quote
                </a>
                <p className="mobile-menu-contact-hint">{getSiteContact().phone} · Molyko, Buea</p>
            </div>
        </div>
        </>
    )
}
