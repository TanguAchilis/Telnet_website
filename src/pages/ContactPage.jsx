import Contact from '../components/Contact'
import './PageBanner.css'

export default function ContactPage() {
    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <span className="page-banner-label">Get In Touch</span>
                    <h1 className="page-banner-title">Contact Us</h1>
                    <p className="page-banner-desc">
                        Have a project in mind or need tech support? Reach out to us today.
                    </p>
                </div>
            </div>
            <Contact showHeader={false} />
        </>
    )
}
