import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOutAdmin, triggerRebuild } from '../../utils/admin'
import { supabase } from '../../utils/supabase'
import { Icon } from '../../icons'
import './AdminLayout.css'

const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/admin/applications', label: 'Applications', icon: 'file-text' },
    { to: '/admin/shop', label: 'Shop', icon: 'bag' },
    { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
    { to: '/admin/content', label: 'Site Content', icon: 'pencil' },
    { to: '/admin/settings', label: 'Settings', icon: 'settings' },
    { to: '/admin/users', label: 'Admin Users', icon: 'users' },
]

export default function AdminLayout() {
    const navigate = useNavigate()
    const [userEmail, setUserEmail] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        let active = true
        supabase?.auth.getUser().then(({ data: { user } }) => {
            if (active && user) setUserEmail(user.email)
        })
        return () => { active = false }
    }, [])

    const handleLogout = async () => {
        await signOutAdmin()
        navigate('/admin/login')
    }

    // Edits are live for visitors immediately. Publishing rebuilds the
    // prerendered HTML that search engines and link previews read.
    const [publishState, setPublishState] = useState({ status: 'idle', message: '' })

    const handlePublish = async () => {
        if (publishState.status === 'working') return
        setPublishState({ status: 'working', message: '' })
        try {
            await triggerRebuild()
            setPublishState({
                status: 'done',
                message: 'Rebuild started. Search engines will see your changes in a couple of minutes.',
            })
        } catch (err) {
            // A 404 means the Edge Function was never deployed. Supabase's own
            // "Requested function was not found" is accurate but tells whoever
            // is standing at the admin panel nothing about what to do.
            const message =
                err.status === 404
                    ? 'Publishing is not set up yet. See supabase/functions/trigger-rebuild/README.md.'
                    : err.message
            setPublishState({ status: 'error', message })
        }
    }

    return (
        <div className="al-root">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="al-overlay" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`al-sidebar${sidebarOpen ? ' al-sidebar-open' : ''}`}>
                <div className="al-brand">
                    <img src="/Our team/logo.png" alt="Telnet" className="al-logo" />
                    <div className="al-brand-text">
                        <span className="al-brand-name">Telnet</span>
                        <span className="al-brand-badge">Admin</span>
                    </div>
                </div>

                <nav className="al-nav" aria-label="Admin navigation">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `al-nav-item${isActive ? ' al-nav-active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="al-nav-icon"><Icon name={item.icon} size={18} weight={1.9} /></span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="al-footer">
                    <div className="al-user">
                        <div className="al-user-avatar">
                            {userEmail ? userEmail[0].toUpperCase() : 'A'}
                        </div>
                        <div className="al-user-info">
                            <span className="al-user-role">Administrator</span>
                            <span className="al-user-email" title={userEmail}>{userEmail}</span>
                        </div>
                    </div>
                    <button className="al-logout" type="button" onClick={handleLogout} title="Sign out">
                        <Icon name="logout" size={16} weight={2} />
                    </button>
                </div>
            </aside>

            {/* Content */}
            <div className="al-content">
                <header className="al-topbar">
                    <button
                        className="al-menu-toggle"
                        type="button"
                        onClick={() => setSidebarOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        <Icon name="menu" size={20} weight={2.2} />
                    </button>
                    <div className="al-topbar-actions">
                        <button
                            type="button"
                            className="al-publish"
                            onClick={handlePublish}
                            disabled={publishState.status === 'working'}
                            title="Rebuild the site so search engines and link previews pick up your changes"
                        >
                            {publishState.status === 'working' ? (
                                <>
                                    <span className="al-publish-spinner" aria-hidden="true" />
                                    Publishing…
                                </>
                            ) : (
                                <>
                                    <Icon name="refresh" size={14} weight={2.2} />
                                    Publish changes
                                </>
                            )}
                        </button>
                        <a href="/" target="_blank" rel="noopener noreferrer" className="al-view-site">
                            View site
                            <Icon name="external-link" size={13} weight={2.2} style={{ marginLeft: '0.3rem' }} />
                        </a>
                    </div>
                </header>
                {publishState.message && (
                    <div
                        className={`al-publish-note${publishState.status === 'error' ? ' al-publish-note-error' : ''}`}
                        role="status"
                    >
                        {publishState.message}
                        <button type="button" onClick={() => setPublishState({ status: 'idle', message: '' })} aria-label="Dismiss">×</button>
                    </div>
                )}
                <main className="al-main">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
