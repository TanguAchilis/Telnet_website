import { useCallback, useEffect, useState } from 'react'
import { saveSetting } from '../../utils/admin'
import {
    fetchSiteStats, fetchContactInfo, fetchServices, fetchTeamMembers,
    createRow, updateRow, deleteRow,
} from '../../utils/content'
import Modal from '../../components/admin/Modal'
import ImageUpload from '../../components/admin/ImageUpload'
import './admin.css'
import './AdminCms.css'

const DEFAULT_STATS = { happy_clients: '500+', interns_trained: '50+', years_experience: '3+' }
const DEFAULT_CONTACT = { phone: '', email: '', address: '', whatsapp: '', hours: '' }

function SettingCard({ title, description, children, onSave, saving, success }) {
    return (
        <div className="ap-card acms-card">
            <p className="ap-card-title">{title}</p>
            {description && <p className="aset-description acms-desc">{description}</p>}
            {success && <div className="ap-alert ap-alert-success">Saved successfully.</div>}
            {children}
            <div className="acms-card-foot">
                <button className="ap-btn ap-btn-primary" onClick={onSave} disabled={saving}>
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    )
}

export default function AdminContent() {
    const [stats, setStats] = useState(DEFAULT_STATS)
    const [contact, setContact] = useState(DEFAULT_CONTACT)
    const [services, setServices] = useState([])
    const [team, setTeam] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [statsSaving, setStatsSaving] = useState(false)
    const [statsOk, setStatsOk] = useState(false)
    const [contactSaving, setContactSaving] = useState(false)
    const [contactOk, setContactOk] = useState(false)

    const [svcModal, setSvcModal] = useState(null)
    const [teamModal, setTeamModal] = useState(null)
    const [saving, setSaving] = useState(false)
    const [modalError, setModalError] = useState('')

    const load = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const [s, c, svc, tm] = await Promise.all([
                fetchSiteStats(), fetchContactInfo(),
                fetchServices({ activeOnly: false }), fetchTeamMembers(),
            ])
            if (s) setStats({ ...DEFAULT_STATS, ...s })
            if (c) setContact({ ...DEFAULT_CONTACT, ...c })
            setServices(svc)
            setTeam(tm)
        } catch (e) { setError(e.message) } finally { setLoading(false) }
    }, [])

    useEffect(() => { load() }, [load])

    const saveStats = async () => {
        setStatsSaving(true); setStatsOk(false); setError('')
        try {
            const { error: err } = await saveSetting('site_stats', stats)
            if (err) throw err
            setStatsOk(true); setTimeout(() => setStatsOk(false), 3000)
        } catch (e) { setError(e.message) } finally { setStatsSaving(false) }
    }

    const saveContact = async () => {
        setContactSaving(true); setContactOk(false); setError('')
        try {
            const { error: err } = await saveSetting('contact_info', contact)
            if (err) throw err
            setContactOk(true); setTimeout(() => setContactOk(false), 3000)
        } catch (e) { setError(e.message) } finally { setContactSaving(false) }
    }

    // Services CRUD
    const saveService = async () => {
        setSaving(true); setModalError('')
        try {
            const payload = {
                title: svcModal.title.trim(),
                description: svcModal.description?.trim() || null,
                icon: svcModal.icon?.trim() || null,
                features: (svcModal.featuresText || '').split('\n').map((f) => f.trim()).filter(Boolean),
                is_active: svcModal.is_active,
                sort_order: Number(svcModal.sort_order) || 0,
            }
            if (!payload.title) throw new Error('Title is required.')
            const { error: err } = svcModal.id
                ? await updateRow('services', svcModal.id, payload)
                : await createRow('services', payload)
            if (err) throw err
            setSvcModal(null); await load()
        } catch (e) { setModalError(e.message) } finally { setSaving(false) }
    }

    const removeService = async (s) => {
        if (!window.confirm(`Delete service "${s.title}"?`)) return
        const { error: err } = await deleteRow('services', s.id)
        if (err) { setError(err.message); return }
        await load()
    }

    // Team CRUD
    const saveTeam = async () => {
        setSaving(true); setModalError('')
        try {
            const payload = {
                name: teamModal.name.trim(),
                role: teamModal.role?.trim() || null,
                title: teamModal.title?.trim() || null,
                photo_url: teamModal.photo_url || null,
                sort_order: Number(teamModal.sort_order) || 0,
            }
            if (!payload.name) throw new Error('Name is required.')
            const { error: err } = teamModal.id
                ? await updateRow('team_members', teamModal.id, payload)
                : await createRow('team_members', payload)
            if (err) throw err
            setTeamModal(null); await load()
        } catch (e) { setModalError(e.message) } finally { setSaving(false) }
    }

    const removeTeam = async (m) => {
        if (!window.confirm(`Remove ${m.name} from the team?`)) return
        const { error: err } = await deleteRow('team_members', m.id)
        if (err) { setError(err.message); return }
        await load()
    }

    if (loading) {
        return <div className="ap-loading"><span className="ap-spinner" />Loading content…</div>
    }

    return (
        <div className="ap-page ap-page-wide">
            <div className="ap-page-header">
                <h2 className="ap-page-title">Site Content</h2>
                <p className="ap-page-subtitle">Update the numbers, contact details, services, and team shown on your public site.</p>
            </div>

            {error && <div className="ap-alert ap-alert-error">{error}</div>}

            <div className="acms-two-col">
                {/* Hero stats */}
                <SettingCard title="Homepage Stats" description="The three numbers in the hero banner." onSave={saveStats} saving={statsSaving} success={statsOk}>
                    <div className="acms-form">
                        <div className="ap-form-group">
                            <label className="ap-label">Happy Clients</label>
                            <input className="ap-input" value={stats.happy_clients} onChange={(e) => setStats({ ...stats, happy_clients: e.target.value })} placeholder="500+" />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Interns Trained</label>
                            <input className="ap-input" value={stats.interns_trained} onChange={(e) => setStats({ ...stats, interns_trained: e.target.value })} placeholder="50+" />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Years Experience</label>
                            <input className="ap-input" value={stats.years_experience} onChange={(e) => setStats({ ...stats, years_experience: e.target.value })} placeholder="3+" />
                        </div>
                    </div>
                </SettingCard>

                {/* Contact info */}
                <SettingCard title="Contact Details" description="Shown on the contact page and footer." onSave={saveContact} saving={contactSaving} success={contactOk}>
                    <div className="acms-form">
                        <div className="ap-form-group">
                            <label className="ap-label">Phone</label>
                            <input className="ap-input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Email</label>
                            <input className="ap-input" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">WhatsApp number (digits, e.g. 237671827893)</label>
                            <input className="ap-input" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Address</label>
                            <input className="ap-input" value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Business hours (one line per row)</label>
                            <textarea className="ap-textarea" rows={2} value={contact.hours} onChange={(e) => setContact({ ...contact, hours: e.target.value })} />
                        </div>
                    </div>
                </SettingCard>
            </div>

            {/* Services */}
            <div className="ap-card acms-card">
                <div className="acms-card-hdr">
                    <p className="ap-card-title" style={{ margin: 0 }}>Services</p>
                    <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={() => { setModalError(''); setSvcModal({ icon: '', title: '', description: '', featuresText: '', is_active: true, sort_order: services.length + 1 }) }}>+ Add Service</button>
                </div>
                <div className="acms-list">
                    {services.map((s) => (
                        <div key={s.id} className="acms-list-row">
                            <span className="acms-list-emoji">{s.icon || '🛠️'}</span>
                            <div className="acms-list-main">
                                <strong>{s.title}{!s.is_active && <span className="acms-muted-tag">hidden</span>}</strong>
                                <span className="acms-list-sub">{s.description}</span>
                            </div>
                            <div className="acms-row-actions">
                                <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => { setModalError(''); setSvcModal({ ...s, featuresText: (Array.isArray(s.features) ? s.features : []).join('\n') }) }}>Edit</button>
                                <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => removeService(s)}>Delete</button>
                            </div>
                        </div>
                    ))}
                    {services.length === 0 && <p className="ap-table-muted">No services yet.</p>}
                </div>
            </div>

            {/* Team */}
            <div className="ap-card acms-card">
                <div className="acms-card-hdr">
                    <p className="ap-card-title" style={{ margin: 0 }}>Team Members</p>
                    <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={() => { setModalError(''); setTeamModal({ name: '', role: '', title: '', photo_url: '', sort_order: team.length + 1 }) }}>+ Add Member</button>
                </div>
                <div className="acms-tile-grid">
                    {team.map((m) => (
                        <div key={m.id} className="acms-tile">
                            <div className="acms-tile-media acms-tile-media-portrait">
                                {m.photo_url ? <img src={m.photo_url} alt="" /> : <span>👤</span>}
                            </div>
                            <div className="acms-tile-body">
                                <strong>{m.name}</strong>
                                <span className="acms-tile-sub">{m.role}</span>
                            </div>
                            <div className="acms-tile-actions">
                                <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => { setModalError(''); setTeamModal(m) }}>Edit</button>
                                <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => removeTeam(m)}>Delete</button>
                            </div>
                        </div>
                    ))}
                    {team.length === 0 && <p className="ap-table-muted">No team members yet.</p>}
                </div>
            </div>

            {/* Service modal */}
            <Modal
                open={!!svcModal}
                title={svcModal?.id ? 'Edit Service' : 'New Service'}
                onClose={() => setSvcModal(null)}
                footer={<>
                    <button className="ap-btn ap-btn-secondary" onClick={() => setSvcModal(null)}>Cancel</button>
                    <button className="ap-btn ap-btn-primary" onClick={saveService} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </>}
            >
                {svcModal && (
                    <div className="acms-form">
                        {modalError && <div className="ap-alert ap-alert-error">{modalError}</div>}
                        <div className="acms-form-row">
                            <div className="ap-form-group acms-emoji-field">
                                <label className="ap-label">Icon (emoji)</label>
                                <input className="ap-input" value={svcModal.icon || ''} onChange={(e) => setSvcModal({ ...svcModal, icon: e.target.value })} placeholder="💻" />
                            </div>
                            <div className="ap-form-group" style={{ flex: 1 }}>
                                <label className="ap-label">Title</label>
                                <input className="ap-input" value={svcModal.title} onChange={(e) => setSvcModal({ ...svcModal, title: e.target.value })} />
                            </div>
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Description</label>
                            <textarea className="ap-textarea" rows={3} value={svcModal.description || ''} onChange={(e) => setSvcModal({ ...svcModal, description: e.target.value })} />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Features (one per line)</label>
                            <textarea className="ap-textarea" rows={3} value={svcModal.featuresText} onChange={(e) => setSvcModal({ ...svcModal, featuresText: e.target.value })} placeholder={'Brand New & Refurbished\nWarranty Support'} />
                        </div>
                        <div className="acms-form-row">
                            <label className="acms-check">
                                <input type="checkbox" checked={svcModal.is_active} onChange={(e) => setSvcModal({ ...svcModal, is_active: e.target.checked })} />
                                Visible on site
                            </label>
                            <div className="ap-form-group acms-sort">
                                <label className="ap-label">Order</label>
                                <input className="ap-input" type="number" value={svcModal.sort_order} onChange={(e) => setSvcModal({ ...svcModal, sort_order: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Team modal */}
            <Modal
                open={!!teamModal}
                title={teamModal?.id ? 'Edit Member' : 'New Member'}
                onClose={() => setTeamModal(null)}
                footer={<>
                    <button className="ap-btn ap-btn-secondary" onClick={() => setTeamModal(null)}>Cancel</button>
                    <button className="ap-btn ap-btn-primary" onClick={saveTeam} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </>}
            >
                {teamModal && (
                    <div className="acms-form">
                        {modalError && <div className="ap-alert ap-alert-error">{modalError}</div>}
                        <ImageUpload value={teamModal.photo_url} folder="team" label="Photo"
                            onChange={(url) => setTeamModal({ ...teamModal, photo_url: url })} />
                        <div className="ap-form-group">
                            <label className="ap-label">Name</label>
                            <input className="ap-input" value={teamModal.name} onChange={(e) => setTeamModal({ ...teamModal, name: e.target.value })} />
                        </div>
                        <div className="acms-form-row">
                            <div className="ap-form-group">
                                <label className="ap-label">Role</label>
                                <input className="ap-input" value={teamModal.role || ''} onChange={(e) => setTeamModal({ ...teamModal, role: e.target.value })} placeholder="CEO" />
                            </div>
                            <div className="ap-form-group acms-sort">
                                <label className="ap-label">Order</label>
                                <input className="ap-input" type="number" value={teamModal.sort_order} onChange={(e) => setTeamModal({ ...teamModal, sort_order: e.target.value })} />
                            </div>
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Title / expertise</label>
                            <input className="ap-input" value={teamModal.title || ''} onChange={(e) => setTeamModal({ ...teamModal, title: e.target.value })} placeholder="IT Expert & Trainer" />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
