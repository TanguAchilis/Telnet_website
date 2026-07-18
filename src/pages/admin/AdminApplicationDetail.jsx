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

const FIELD_MAP = [
    ['Full Name', 'full_name'],
    ['Email', 'email'],
    ['Phone', 'phone'],
    ['Date of Birth', 'date_of_birth'],
    ['Gender', 'gender'],
    ['Location', 'location'],
    ['School / University', 'school'],
    ['Level of Study', 'level_of_study'],
    ['Programme', 'program_option'],
    ['Mode of Learning', 'mode_of_learning'],
    ['Fee Structure', 'fee_structure'],
    ['Duration', 'duration'],
    ['Start Date', 'start_date'],
    ['Document Method', 'document_submission_method'],
    ['Source', 'source'],
    ['Submitted', 'submitted_at'],
]

function fmt(val) {
    if (!val) return '—'
    if (typeof val === 'string' && val.includes('T') && val.includes('Z')) {
        return new Date(val).toLocaleString()
    }
    return val
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

    return (
        <div className="ap-page">
            <button type="button" className="ap-back" onClick={() => navigate(-1)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to Applications
            </button>

            <div className="ap-page-header">
                <h2 className="ap-page-title">{app?.full_name || 'Application'}</h2>
                <p className="ap-page-subtitle">
                    Application ID: <span style={{ fontFamily: 'monospace', fontSize: '0.82em' }}>{id}</span>
                </p>
            </div>

            <div className="adet-two-col">
                {/* Left: all fields */}
                <div className="ap-card">
                    <p className="ap-card-title">Applicant Details</p>
                    <div className="adet-fields">
                        {FIELD_MAP.map(([label, key]) => (
                            <div key={key} className="ap-field">
                                <span className="ap-field-label">{label}</span>
                                <span className="ap-field-value">{fmt(app?.[key])}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: actions */}
                <div>
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
                                disabled={saving}
                                style={{ width: '100%' }}
                            >
                                {saving ? <><span className="ap-spinner" style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Saving…</> : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
