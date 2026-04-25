import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import './HomePage.css'

const whatWeDo = [
    { icon: '💻', label: 'Laptop Sales & Accessories' },
    { icon: '💡', label: 'Low-cost IT Solutions' },
    { icon: '📹', label: 'CCTV & Networking' },
    { icon: '📋', label: 'IT Consultancy' },
    { icon: '🔒', label: 'Cybersecurity' },
    { icon: '🎓', label: 'Internship' },
    { icon: '🔧', label: 'Hardware Maintenance' },
]

export default function HomePage() {
    return (
        <>
            <Hero />
            <section className="what-we-do-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">What We Do</span>
                    </div>
                    <div className="what-we-do-grid">
                        {whatWeDo.map((item, i) => (
                            <div key={i} className="what-we-do-item glass-card animate-on-scroll">
                                <span className="what-we-do-icon">{item.icon}</span>
                                <span className="what-we-do-label">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <Services />
            <About />
        </>
    )
}
