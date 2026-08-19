import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { fetchSiteStats } from '../utils/content'
import { HERO_SLIDE_IMAGES } from '../utils/heroSlides'
import { IS_PRERENDER } from '../utils/isPrerender'
import { Icon } from '../icons'
import './Hero.css'

const DEFAULT_STATS = { happy_clients: '500+', interns_trained: '50+', years_experience: '3+' }

// Background images live in utils/heroSlides.js so the build can preload the
// first one. Order here must match that array.
const slides = [
    {
        image: HERO_SLIDE_IMAGES[0],
        badgeIcon: 'check-circle',
        badge: 'Trusted by Schools, Homes & Businesses',
        title: <>Reliable Technology<br />Solutions for <span className="hero-highlight">School, Home & Businesses</span></>,
        desc: 'TELNET CAMEROON is a company dedicated to providing quality and reliable digital solutions and to help individuals and businesses stay connected and productive.',
        cta: { label: 'Explore Services', to: '/services' },
    },
    {
        image: HERO_SLIDE_IMAGES[1],
        badgeIcon: 'shield',
        badge: 'Professional Security Solutions',
        title: <>Secure Your Property<br />with <span className="hero-highlight">CCTV Systems</span></>,
        desc: 'We provide expert installation of modern surveillance and security camera systems for homes, offices, schools, and businesses across Cameroon.',
        cta: { label: 'View Services', to: '/services' },
    },
    {
        image: HERO_SLIDE_IMAGES[2],
        badgeIcon: 'graduation',
        badge: 'Hands-On Learning Programs',
        title: <>Empowering the Next<br />Generation of <span className="hero-highlight">Tech Leaders</span></>,
        desc: 'Our training and internship programs equip young professionals with practical skills in networking, hardware maintenance, web development, and more.',
        cta: { label: 'Apply for Internship', to: '/internship' },
    },
    {
        image: HERO_SLIDE_IMAGES[3],
        badgeIcon: 'laptop',
        badge: 'Quality Devices at Fair Prices',
        title: <>Premium Laptops &<br /><span className="hero-highlight">Accessories</span> for All</>,
        desc: 'From student laptops to gaming rigs and business machines. We stock trusted brands like HP, Dell, Lenovo, and Acer with warranty and support.',
        cta: { label: 'Shop Now', to: '/shop' },
    },
]

export default function Hero() {
    const [current, setCurrent] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [stats, setStats] = useState(DEFAULT_STATS)
    // All four slide layers stay mounted so the crossfade still works, but a
    // layer only gets its background-image once it's needed. Previously every
    // slide's image downloaded on first paint: ~700 KB of the homepage's
    // 959 KB of images, for three pictures nobody had scrolled to yet.
    const [warmedSlides, setWarmedSlides] = useState(() => new Set([0]))

    useEffect(() => {
        let active = true
        fetchSiteStats()
            .then((val) => { if (active && val) setStats({ ...DEFAULT_STATS, ...val }) })
            .catch(() => { /* keep defaults */ })
        return () => { active = false }
    }, [])

    const goToSlide = useCallback((index) => {
        if (isTransitioning) return
        setIsTransitioning(true)
        setCurrent(index)
        setTimeout(() => setIsTransitioning(false), 700)
    }, [isTransitioning])

    const nextSlide = useCallback(() => {
        goToSlide((current + 1) % slides.length)
    }, [current, goToSlide])

    // Auto-advance. Frozen during prerender so the captured HTML always shows
    // slide 1. Otherwise the indexed <h1> depends on how long the snapshot took.
    useEffect(() => {
        if (IS_PRERENDER) return undefined
        const timer = setInterval(nextSlide, 6000)
        return () => clearInterval(timer)
    }, [nextSlide])

    // Fetch the remaining slide images in one burst once the page has loaded.
    //
    // Warming them one-at-a-time per transition was measurably worse: it kept
    // the network busy for the entire session, stretching Lighthouse's
    // observation window from 3s to 10.4s and pushing Speed Index from 4.6s to
    // 12.7s. Deferring past load keeps them out of first paint; doing them
    // together lets the page go quiet again straight after.
    useEffect(() => {
        // Skipped during prerender: warming would inline all four background
        // images into the static HTML, so every visitor would download them on
        // first paint, exactly what deferring them was meant to avoid.
        if (IS_PRERENDER) return undefined

        let idleHandle
        let timeoutHandle

        const warmAll = () => setWarmedSlides(new Set(slides.map((_, i) => i)))

        const schedule = () => {
            if (typeof requestIdleCallback === 'function') {
                idleHandle = requestIdleCallback(warmAll, { timeout: 2000 })
            } else {
                timeoutHandle = setTimeout(warmAll, 500)
            }
        }

        if (document.readyState === 'complete') schedule()
        else window.addEventListener('load', schedule, { once: true })

        return () => {
            window.removeEventListener('load', schedule)
            if (idleHandle !== undefined && typeof cancelIdleCallback === 'function') {
                cancelIdleCallback(idleHandle)
            }
            if (timeoutHandle !== undefined) clearTimeout(timeoutHandle)
        }
    }, [])

    const slide = slides[current]
    // Covers jumping straight to a cold slide via the dots.
    const visibleSlides = warmedSlides.has(current) ? warmedSlides : new Set(warmedSlides).add(current)

    return (
        <section id="home" className="hero">
            {/* Background image slides */}
            {slides.map((s, i) => (
                <div
                    key={i}
                    className={`hero-slide-bg ${i === current ? 'active' : ''}`}
                    style={visibleSlides.has(i) ? { backgroundImage: `url("${s.image}")` } : undefined}
                />
            ))}
            <div className="hero-overlay"></div>

            <div className="container hero-content">
                <div className="hero-text-area" key={current}>
                    <div className="hero-badge">
                        <Icon name={slide.badgeIcon} size={15} />
                        {slide.badge}
                    </div>
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-desc">{slide.desc}</p>
                    <div className="hero-actions">
                        <Link to={slide.cta.to} className="btn btn-primary">
                            <Icon name="arrow-right" size={18} />
                            {slide.cta.label}
                        </Link>
                        <a
                            href={getWhatsAppUrl(whatsappMessages.general)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                        >
                            <Icon name="whatsapp" size={18} />
                            Chat on WhatsApp
                        </a>
                    </div>
                </div>

                {/* Carousel indicators */}
                <div className="hero-carousel-controls">
                    <div className="hero-dots">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`hero-dot ${i === current ? 'active' : ''}`}
                                onClick={() => goToSlide(i)}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                    <div className="hero-slide-counter">
                        <span className="hero-counter-current">{String(current + 1).padStart(2, '0')}</span>
                        <span className="hero-counter-sep">/</span>
                        <span className="hero-counter-total">{String(slides.length).padStart(2, '0')}</span>
                    </div>
                </div>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <span className="hero-stat-number">{stats.happy_clients}</span>
                        <span className="hero-stat-label">Happy Clients</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat">
                        <span className="hero-stat-number">{stats.interns_trained}</span>
                        <span className="hero-stat-label">Interns Trained</span>
                    </div>
                    <div className="hero-stat-divider"></div>
                    <div className="hero-stat">
                        <span className="hero-stat-number">{stats.years_experience}</span>
                        <span className="hero-stat-label">Years Experience</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
