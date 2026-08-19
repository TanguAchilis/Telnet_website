import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { fetchApplication, updateApplication } from '../../utils/admin'
import './admin.css'
import './AdminApplicationDetail.css'
import { Icon } from '../../icons'

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
    if (val === null || val === undefined || val === '') return '-'
    // ISO timestamp. Supabase returns e.g. 2026-07-20T17:03:52.769296+00:00
    // (offset), not a trailing "Z", so match the date+time prefix.
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(val)) {
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
                <Icon name="chevron-left" size={14} weight={2.2} />
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
                                    <Icon name="whatsapp" size={16} />
                                    WhatsApp
                                </a>
                            )}
                            {app?.email && (
                                <a className="ap-btn ap-btn-secondary adet-contact-btn" href={`mailto:${app.email}`}>
                                    <Icon name="mail" size={15} weight={1.9} />
                                    Email
                                </a>
                            )}
                            {app?.phone && (
                                <a className="ap-btn ap-btn-secondary adet-contact-btn" href={`tel:${app.phone}`}>
                                    <Icon name="phone" size={15} weight={1.9} />
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
