import Gallery from '../components/Gallery'
import './PageBanner.css'

export default function GalleryPage() {
    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <span className="page-banner-label">Our Work</span>
                    <h1 className="page-banner-title">Gallery</h1>
                    <p className="page-banner-desc">
                        A glimpse into our training sessions, field installations, and community impact.
                    </p>
                </div>
            </div>
            <Gallery showHeader={false} />
        </>
    )
}
