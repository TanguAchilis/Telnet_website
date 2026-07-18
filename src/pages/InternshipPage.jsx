import { useEffect, useState } from 'react'
import InternshipApplication from '../components/InternshipApplication'
import { fetchSetting } from '../utils/admin'
import './PageBanner.css'

const learningModes = [
    { value: 'Academic Internship', label: 'Academic Internship', description: 'For students enrolled in institutions of higher learning.' },
    { value: 'Professional Internship (3 Months)', label: 'Professional Internship (3 Months)', description: '' },
    { value: 'Short Program (2-3 Months)', label: 'Short Program (2-3 Months)', description: '' },
    { value: 'Short Course (Job Seekers) 4-6 Months', label: 'Short Course (Job Seekers) 4-6 Months', description: '' },
]

const DEFAULT_PROGRAM_OPTIONS = [
    'Networking & Security (NWS, CSN, etc)',
    'Cyber Security (pro interns)',
    'Telecommunications',
    'Computer Graphics and Web Development',
    'Electrical Power Systems',
    'Software Engineering (BTech & HND)',
]

let programOptionsCache = null

const checklist = [
    'All information collected is safe and used solely to facilitate the application process.',
    'Internship letters and supporting documents must be dropped at the Malingo office.',
    'For MOMO payments, send the screenshot to the manager on WhatsApp with your name and program.',
]

const paymentManagerUrl = 'https://wa.me/237671621015?text=Hello%20Manager%2C%20I%20am%20sharing%20my%20TELNET%20application%20payment%20proof.'

export default function InternshipPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [programOptions, setProgramOptions] = useState(programOptionsCache ?? DEFAULT_PROGRAM_OPTIONS)

    useEffect(() => {
        if (programOptionsCache) {
            setProgramOptions(programOptionsCache)
            return
        }

        fetchSetting('program_options')
            .then((value) => {
                if (Array.isArray(value) && value.length > 0) {
                    programOptionsCache = value
                    setProgramOptions(value)
                }
            })
            .catch(() => {})
    }, [])

    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <span className="page-banner-label">TELNET Application Form</span>
                    <h1 className="page-banner-title">Internship Application</h1>
                    <p className="page-banner-desc">
                        Read carefully and fill as per your preferences. Supporting documents are submitted at the office, not on this platform.
                    </p>
                </div>
            </div>

            <section className="section internship-section">
                <div className="container">

                    <div className="internship-cta-banner glass-card animate-on-scroll">
                        <div className="internship-cta-content">
                            <span className="internship-card-label">Ready to Join?</span>
                            <h2 className="internship-cta-title">
                                Start your <span className="text-gradient-accent">application</span> today.
                            </h2>
                            <p>Choose your learning path and program — the form takes just a few minutes to complete.</p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary internship-apply-btn"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <span>Apply Now</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="internship-overview-grid">
                        <div className="internship-overview-card glass-card animate-on-scroll">
                            <span className="internship-card-label">Modes of Learning</span>
                            <h3>Choose the learning path that fits your current stage.</h3>
                            <p>
                                The application form starts with your personal information, then guides you to the learning mode and program options that match your goals.
                            </p>
                            <ul className="internship-track-list">
                                {learningModes.map((mode) => (
                                    <li key={mode.value}>
                                        <h4>{mode.label}</h4>
                                        {mode.description && <p>{mode.description}</p>}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="internship-meta-stack">
                            <div className="internship-meta-card glass-card animate-on-scroll">
                                <span className="internship-card-label">Available Programs</span>
                                <ul className="internship-bullet-list">
                                    {programOptions.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="internship-meta-card glass-card animate-on-scroll">
                                <span className="internship-card-label">Before You Submit</span>
                                <ul className="internship-bullet-list">
                                    {checklist.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                                <a
                                    href={paymentManagerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary internship-whatsapp"
                                >
                                    Send MOMO Proof on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <InternshipApplication isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    )
}