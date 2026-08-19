import Hero from '../components/Hero'
import Services from '../components/Services'
import About from '../components/About'
import { Icon } from '../icons'
import './HomePage.css'

const whatWeDo = [
    { icon: 'laptop', label: 'Laptop Sales & Accessories' },
    { icon: 'lightbulb', label: 'Low-cost IT Solutions' },
    { icon: 'cctv', label: 'CCTV & Networking' },
    { icon: 'clipboard', label: 'IT Consultancy' },
    { icon: 'shield', label: 'Cybersecurity' },
    { icon: 'graduation', label: 'Internship' },
    { icon: 'wrench', label: 'Hardware Maintenance' },
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
                                <Icon name={item.icon} size={20} className="what-we-do-icon" />
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
