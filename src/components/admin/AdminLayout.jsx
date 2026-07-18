import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOutAdmin } from '../../utils/admin'
import { supabase } from '../../utils/supabase'
import './AdminLayout.css'

const navItems = [
    {
        to: '/admin/dashboard',
        label: 'Dashboard',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        to: '/admin/applications',
        label: 'Applications',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        to: '/admin/settings',
        label: 'Settings',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    },
    {
        to: '/admin/users',
        label: 'Admin Users',
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
]

export default function AdminLayout() {
    const navigate = useNavigate()
    const [userEmail, setUserEmail] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useState(() => {
        supabase?.auth.getUser().then(({ data: { user } }) => {
            if (user) setUserEmail(user.email)
        })
    })

    const handleLogout = async () => {
        await signOutAdmin()
        navigate('/admin/login')
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
                            <span className="al-nav-icon">{item.icon}</span>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                    <a href="/" target="_blank" rel="noopener noreferrer" className="al-view-site">
                        View site
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.3rem' }}>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                    </a>
                </header>
                <main className="al-main">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
