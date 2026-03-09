import Services from '../components/Services'
import './PageBanner.css'

export default function ServicesPage() {
    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <span className="page-banner-label">What We Do</span>
                    <h1 className="page-banner-title">Our Services</h1>
                    <p className="page-banner-desc">
                        Comprehensive technology solutions tailored to your needs — from laptop sales to cybersecurity.
                    </p>
                </div>
            </div>
            <Services showHeader={false} />
        </>
    )
}
