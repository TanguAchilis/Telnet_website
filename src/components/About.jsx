import { Icon } from '../icons'
import './About.css'

export default function About({ showHeader = true }) {
    return (
        <section id="about" className="section about-section">
            <div className="container">
                {showHeader && (
                    <div className="section-header">
                        <span className="section-label">Who We Are</span>
                        <h2 className="section-title">Our Mission & <span className="text-gradient-accent">Vision</span></h2>
                        <p className="section-subtitle">Bridging the digital divide across Cameroon</p>
                    </div>
                )}

                <div className="about-grid">
                    <div className="about-card glass-card animate-on-scroll">
                        <div className="about-card-accent mission-accent"></div>
                        <div className="about-card-icon">
                            <Icon name="target" size={34} />
                        </div>
                        <h3 className="about-card-title">Our Mission</h3>
                        <p className="about-card-text">
                            To reduce the digital divide, empowering girls and people regardless of their ethnicity and
                            socio-economic status. We aim to bridge the digital gap by making modern digital tools
                            accessible to everyone.
                        </p>
                    </div>

                    <div className="about-card glass-card animate-on-scroll">
                        <div className="about-card-accent vision-accent"></div>
                        <div className="about-card-icon">
                            <Icon name="eye" size={34} />
                        </div>
                        <h3 className="about-card-title">Our Vision</h3>
                        <p className="about-card-text">
                            To empower communities through ICT and become the leading technology solutions provider
                            known for reliability and excellence in digital services and training. We strive to build
                            a future where technology improves security, productivity and opportunities in our community.
                        </p>
                    </div>
                </div>

                <div className="about-values animate-on-scroll">
                    <h3 className="values-title">Our Core Values</h3>
                    <div className="values-grid">
                        {[
                            { icon: 'award', label: 'Professionalism' },
                            { icon: 'lightbulb', label: 'Innovation' },
                            { icon: 'heart', label: 'Customer Satisfaction' },
                            { icon: 'book', label: 'Continuous Learning' },
                        ].map((value, i) => (
                            <div key={i} className="value-item">
                                <span className="value-icon"><Icon name={value.icon} size={30} /></span>
                                <span className="value-label">{value.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
