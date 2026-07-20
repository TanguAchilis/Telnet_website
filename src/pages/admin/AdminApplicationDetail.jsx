import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchApplication, updateApplication } from '../../utils/admin'
import './admin.css'
import './AdminApplicationDetail.css'

const STATUS_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
]

const STATUS_LABEL = {
    new: 'New',
    reviewing: 'Reviewing',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
}

// Sections mapped to the ACTUAL columns the public form writes.
const SECTIONS = [
    {
        title: 'Contact',
        fields: [
            ['Full name', 'full_name'],
            ['Email', 'email'],
            ['Phone', 'phone'],
        ],
    },
    {
        title: 'Learning Path',
        fields: [
            ['Mode of learning', 'mode_of_learning'],
            ['Programme', 'program_option'],
            ['IT background', 'it_background'],
            ['Has a functional laptop', 'laptop_status'],
            ['School', 'school'],
            ['Department / Option', 'department_option'],
            ['Academic level', 'academic_level'],
        ],
    },
    {
        title: 'Period & Fees',
        fields: [
            ['Internship period', 'internship_period'],
            ['Fee structure', 'fee_structure'],
            ['Payment method', 'payment_method'],
        ],
    },
    {
        title: 'Submission',
        fields: [
            ['Document method', 'document_submission_method'],
            ['Source', 'source'],
            ['Submitted', 'submitted_at'],
        ],
    },
]

// Turn raw stored values into human-readable labels.
const VALUE_LABELS = {
    office_drop_off: 'Office drop-off',
    website: 'Website',
}

function resolveValue(app, key) {
    if (!app) return null
    if (key === 'program_option') return app.program_option_other?.trim() || app.program_option
    if (key === 'internship_period') return app.internship_period_other?.trim() || app.internship_period
    return app[key]
}

function fmt(val) {
    if (val === null || val === undefined || val === '') return '—'
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T.*Z$/.test(val)) {
        return new Date(val).toLocaleString()
    }
    if (typeof val === 'string' && VALUE_LABELS[val]) return VALUE_LABELS[val]
    return String(val)
}

// Normalise a local Cameroon number into an international wa.me target.
function toWhatsAppDigits(phone) {
    const digits = (phone || '').replace(/\D/g, '')
    if (!digits) return ''
    return digits.startsWith('237') ? digits : `237${digits}`
}

export default function AdminApplicationDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [app, setApp] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [status, setStatus] = useState('')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [saveError, setSaveError] = useState('')

    useEffect(() => {
        fetchApplication(id)
            .then(({ data, error: err }) => {
                if (err) throw err
                setApp(data)
                setStatus(data.status || 'new')
                setNotes(data.notes || '')
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [id])

    const handleSave = async () => {
        setSaving(true)
        setSaved(false)
        setSaveError('')
        try {
            const { error: err } = await updateApplication(id, { status, notes })
            if (err) throw err
            setApp((a) => ({ ...a, status, notes }))
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (e) {
            setSaveError(e.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="ap-loading"><span className="ap-spinner" />Loading application…</div>
    }

    if (error) {
        return <div className="ap-alert ap-alert-error">{error}</div>
    }

    const dirty = app && (status !== (app.status || 'new') || notes !== (app.notes || ''))
    const waDigits = toWhatsAppDigits(app?.phone)
    const waMessage = encodeURIComponent(
        `Hello ${app?.full_name || ''}, this is Telnet Cameroon regarding your internship application.`.trim()
    )

    return (
        <div className="ap-page">
            <button type="button" className="ap-back" onClick={() => navigate(-1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Applications
            </button>

            <div className="ap-page-header adet-header">
                <div>
                    <h2 className="ap-page-title">{app?.full_name || 'Application'}</h2>
                    <p className="ap-page-subtitle">
                        {app?.submitted_at ? `Applied ${new Date(app.submitted_at).toLocaleDateString()}` : 'Internship application'}
                    </p>
                </div>
                <span className={`ap-badge ap-badge-${app?.status}`}>{STATUS_LABEL[app?.status] || app?.status}</span>
            </div>

            <div className="adet-two-col">
                {/* Left: all applicant details, grouped */}
                <div className="ap-card">
                    <p className="ap-card-title">Applicant Details</p>
                    <div className="adet-sections">
                        {SECTIONS.map((section) => (
                            <div key={section.title} className="adet-section">
                                <p className="adet-section-title">{section.title}</p>
                                <div className="adet-fields">
                                    {section.fields.map(([label, key]) => {
                                        const value = resolveValue(app, key)
                                        return (
                                            <div key={key} className="ap-field">
                                                <span className="ap-field-label">{label}</span>
                                                {key === 'email' && value ? (
                                                    <a className="ap-field-value adet-link" href={`mailto:${value}`}>{value}</a>
                                                ) : key === 'phone' && value ? (
                                                    <a className="ap-field-value adet-link" href={`tel:${value}`}>{value}</a>
                                                ) : (
                                                    <span className="ap-field-value">{fmt(value)}</span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: contact + status actions */}
                <div className="adet-side">
                    <div className="ap-card">
                        <p className="ap-card-title">Contact Applicant</p>
                        <div className="adet-contact-actions">
                            {waDigits && (
                                <a
                                    className="ap-btn ap-btn-primary adet-contact-btn"
                                    href={`https://wa.me/${waDigits}?text=${waMessage}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.39c0-4.54 3.7-8.24 8.24-8.24s8.23 3.7 8.23 8.24-3.69 8.25-8.23 8.25zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" /></svg>
                                    WhatsApp
                                </a>
                            )}
                            {app?.email && (
                                <a className="ap-btn ap-btn-secondary adet-contact-btn" href={`mailto:${app.email}`}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>
                                    Email
                                </a>
                            )}
                            {app?.phone && (
                                <a className="ap-btn ap-btn-secondary adet-contact-btn" href={`tel:${app.phone}`}>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                    Call
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="ap-card">
                        <p className="ap-card-title">Update Application</p>

                        {saved && <div className="ap-alert ap-alert-success">Changes saved successfully.</div>}
                        {saveError && <div className="ap-alert ap-alert-error">{saveError}</div>}

                        <div className="adet-form">
                            <div className="ap-form-group">
                                <label className="ap-label" htmlFor="app-status">Status</label>
                                <select
                                    id="app-status"
                                    className="ap-input"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                >
                                    {STATUS_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="ap-form-group">
                                <label className="ap-label" htmlFor="app-notes">Notes</label>
                                <textarea
                                    id="app-notes"
                                    className="ap-textarea"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Internal notes about this application…"
                                    rows={5}
                                />
                            </div>

                            <button
                                type="button"
                                className="ap-btn ap-btn-primary"
                                onClick={handleSave}
                                disabled={saving || !dirty}
                                style={{ width: '100%' }}
                            >
                                {saving ? <><span className="ap-spinner adet-btn-spinner" /> Saving…</> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
