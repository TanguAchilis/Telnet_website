import { useCallback, useEffect, useState } from 'react'
import {
    createAdminUser,
    fetchAdminProfiles,
    fetchCurrentAdminProfile,
    saveCurrentAdminProfile,
} from '../../utils/admin'
import './admin.css'
import './AdminUsers.css'

const emptyProfile = {
    id: '',
    email: '',
    full_name: '',
    phone: '',
}

export default function AdminUsers() {
    const [profiles, setProfiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [profile, setProfile] = useState(emptyProfile)
    const [profileLoading, setProfileLoading] = useState(true)
    const [profileSaving, setProfileSaving] = useState(false)
    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')

    // Create form
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('')
    const [createSuccess, setCreateSuccess] = useState('')

    const loadProfiles = useCallback(async () => {
        setLoading(true)
        setError('')

        try {
            const { data, error: fetchError } = await fetchAdminProfiles()
            if (fetchError) throw fetchError
            setProfiles(data ?? [])
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const loadCurrentProfile = useCallback(async () => {
        setProfileLoading(true)
        setProfileError('')

        try {
            const data = await fetchCurrentAdminProfile()
            setProfile({
                id: data.id ?? '',
                email: data.email ?? '',
                full_name: data.full_name ?? '',
                phone: data.phone ?? '',
            })
        } catch (e) {
            setProfileError(e.message)
        } finally {
            setProfileLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProfiles()
        loadCurrentProfile()
    }, [loadCurrentProfile, loadProfiles])

    const handleProfileChange = (e) => {
        const { name, value } = e.target
        setProfile((prev) => ({ ...prev, [name]: value }))
    }

    const handleProfileSave = async (e) => {
        e.preventDefault()
        setProfileSaving(true)
        setProfileError('')
        setProfileSuccess('')

        try {
            const { data, error: saveError } = await saveCurrentAdminProfile(profile)
            if (saveError) throw saveError

            setProfile((prev) => ({
                ...prev,
                id: data.id ?? prev.id,
                email: data.email ?? prev.email,
                full_name: data.full_name ?? '',
                phone: data.phone ?? '',
            }))
            setProfileSuccess('Your profile has been updated.')
            await loadProfiles()
        } catch (e) {
            setProfileError(e.message)
        } finally {
            setProfileSaving(false)
        }
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setCreating(true)
        setCreateError('')
        setCreateSuccess('')

        try {
            const user = await createAdminUser(email, password)
            setCreateSuccess(`Admin account created for ${user.email}.`)
            setEmail('')
            setPassword('')
            await loadProfiles()
        } catch (err) {
            setCreateError(err.message)
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="ap-page">
            <div className="ap-page-header">
                <h2 className="ap-page-title">Admin Users</h2>
                <p className="ap-page-subtitle">Manage who has access to this admin portal.</p>
            </div>

            <div className="ausers-two-col">
                {/* Existing admins */}
                <div className="ap-card">
                    <p className="ap-card-title">Current Admins</p>

                    {error && <div className="ap-alert ap-alert-error">{error}</div>}

                    {loading ? (
                        <div className="ap-loading"><span className="ap-spinner" />Loading…</div>
                    ) : profiles.length === 0 ? (
                        <div className="ap-empty">
                            <strong>No admin profiles found</strong>
                            <p>Add an admin using the form.</p>
                        </div>
                    ) : (
                        <div className="ap-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Added</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profiles.map((p) => (
                                        <tr key={p.id} className={p.id === profile.id ? 'ausers-current-row' : ''}>
                                            <td className="ap-table-name">
                                                {p.full_name || 'Not set'}
                                                {p.id === profile.id && <span className="ausers-self-pill">You</span>}
                                            </td>
                                            <td className="ap-table-muted">{p.email}</td>
                                            <td className="ap-table-muted">{p.phone || '—'}</td>
                                            <td className="ap-table-muted">
                                                {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create new admin */}
                <div className="ausers-stack">
                    <div className="ap-card">
                        <p className="ap-card-title">Your Profile</p>
                        <p className="ausers-profile-copy">Each admin can update their own display information here.</p>

                        {profileLoading ? (
                            <div className="ap-loading"><span className="ap-spinner" />Loading profile…</div>
                        ) : (
                            <>
                                {profileSuccess && <div className="ap-alert ap-alert-success">{profileSuccess}</div>}
                                {profileError && <div className="ap-alert ap-alert-error">{profileError}</div>}

                                <form onSubmit={handleProfileSave} className="ausers-form" noValidate>
                                    <div className="ap-form-group">
                                        <label className="ap-label" htmlFor="profile-email">Login email</label>
                                        <input
                                            id="profile-email"
                                            type="email"
                                            className="ap-input"
                                            value={profile.email}
                                            readOnly
                                            disabled
                                        />
                                        <span className="ausers-field-hint">Email changes are managed through Supabase Auth.</span>
                                    </div>

                                    <div className="ap-form-group">
                                        <label className="ap-label" htmlFor="profile-full-name">Full name</label>
                                        <input
                                            id="profile-full-name"
                                            name="full_name"
                                            type="text"
                                            className="ap-input"
                                            value={profile.full_name}
                                            onChange={handleProfileChange}
                                            placeholder="Your full name"
                                            disabled={profileSaving}
                                        />
                                    </div>

                                    <div className="ap-form-group">
                                        <label className="ap-label" htmlFor="profile-phone">Phone number</label>
                                        <input
                                            id="profile-phone"
                                            name="phone"
                                            type="tel"
                                            className="ap-input"
                                            value={profile.phone}
                                            onChange={handleProfileChange}
                                            placeholder="e.g. 671234567"
                                            disabled={profileSaving}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="ap-btn ap-btn-primary"
                                        disabled={profileSaving}
                                        style={{ width: '100%' }}
                                    >
                                        {profileSaving ? <><span className="ap-spinner" style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Saving…</> : 'Save Profile'}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>

                    <div className="ap-card">
                        <p className="ap-card-title">Add Admin User</p>

                        <div className="ausers-note">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p>
                                This calls an Edge Function to create the user and assign the admin role.
                                Make sure the function is deployed: <code>supabase functions deploy create-admin-user</code>
                            </p>
                        </div>

                        {createSuccess && <div className="ap-alert ap-alert-success">{createSuccess}</div>}
                        {createError && <div className="ap-alert ap-alert-error">{createError}</div>}

                        <form onSubmit={handleCreate} className="ausers-form" noValidate>
                            <div className="ap-form-group">
                                <label className="ap-label" htmlFor="nu-email">Email address</label>
                                <input
                                    id="nu-email"
                                    type="email"
                                    className="ap-input"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="new-admin@example.com"
                                    disabled={creating}
                                />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label" htmlFor="nu-pass">Password</label>
                                <input
                                    id="nu-pass"
                                    type="password"
                                    className="ap-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Minimum 8 characters"
                                    minLength={8}
                                    disabled={creating}
                                />
                            </div>
                            <button
                                type="submit"
                                className="ap-btn ap-btn-primary"
                                disabled={creating || !email || !password}
                                style={{ width: '100%' }}
                            >
                                {creating ? <><span className="ap-spinner" style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Creating…</> : 'Create Admin User'}
                            </button>
                        </form>
                    </div>

                    <div className="ausers-setup-note">
                        <strong>First admin setup?</strong>
                        <ol>
                            <li>Create a user in the <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Supabase Auth dashboard</a>.</li>
                            <li>Run in the SQL editor: <code>SELECT public.promote_to_admin('email@example.com');</code></li>
                            <li>Log in above with those credentials.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    )
}
