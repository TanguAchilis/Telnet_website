import Team from '../components/Team'
import './PageBanner.css'

export default function TeamPage() {
    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <span className="page-banner-label">The Team</span>
                    <h1 className="page-banner-title">Meet Our Experts</h1>
                    <p className="page-banner-desc">
                        Skilled technology professionals and trainers dedicated to delivering excellence.
                    </p>
                </div>
            </div>
            <Team showHeader={false} />
        </>
    )
}
