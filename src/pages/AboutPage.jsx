import About from '../components/About'
import './PageBanner.css'

export default function AboutPage() {
    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <span className="page-banner-label">Who We Are</span>
                    <h1 className="page-banner-title">About Telnet</h1>
                    <p className="page-banner-desc">
                        Bridging the digital divide and empowering communities through technology.
                    </p>
                </div>
            </div>
            <About showHeader={false} />
        </>
    )
}
