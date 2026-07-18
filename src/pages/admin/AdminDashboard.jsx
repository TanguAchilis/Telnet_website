import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchApplicationStats } from '../../utils/admin'
import './admin.css'
import './AdminDashboard.css'

function statusCounts(apps) {
    return apps.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1
        return acc
    }, {})
}

function programCounts(apps) {
    return apps.reduce((acc, a) => {
        const p = a.program_option || 'Unknown'
        acc[p] = (acc[p] || 0) + 1
        return acc
    }, {})
}

function recentApps(apps, n = 5) {
    return [...apps]
        .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
        .slice(0, n)
}

const STATUS_LABEL = {
    new: 'New',
    reviewing: 'Reviewing',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchApplicationStats()
            .then(setStats)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="ap-loading">
                <span className="ap-spinner" />
                Loading dashboard…
            </div>
        )
    }

    if (error) {
        return <div className="ap-alert ap-alert-error">{error}</div>
    }

    const total = stats?.length ?? 0
    const counts = stats ? statusCounts(stats) : {}
    const programs = stats ? programCounts(stats) : {}
    const maxProgCount = Math.max(...Object.values(programs), 1)
    const recent = stats ? recentApps(stats) : []

    return (
        <div className="ap-page">
            <div className="ap-page-header">
                <h2 className="ap-page-title">Dashboard</h2>
                <p className="ap-page-subtitle">Overview of internship applications and platform activity.</p>
            </div>

            {/* Stat cards */}
            <div className="ap-stat-row">
                <div className="ap-stat ap-stat-accent">
                    <span className="ap-stat-label">Total</span>
                    <span className="ap-stat-value">{total}</span>
                    <span className="ap-stat-sub">All time applications</span>
                </div>
                <div className="ap-stat ap-stat-blue">
                    <span className="ap-stat-label">New</span>
                    <span className="ap-stat-value">{counts.new || 0}</span>
                    <span className="ap-stat-sub">Awaiting review</span>
                </div>
                <div className="ap-stat ap-stat-amber">
                    <span className="ap-stat-label">Reviewing</span>
                    <span className="ap-stat-value">{counts.reviewing || 0}</span>
                    <span className="ap-stat-sub">In progress</span>
                </div>
                <div className="ap-stat ap-stat-green">
                    <span className="ap-stat-label">Accepted</span>
                    <span className="ap-stat-value">{(counts.approved || 0) + (counts.completed || 0)}</span>
                    <span className="ap-stat-sub">Approved + Completed</span>
                </div>
            </div>

            <div className="adash-two-col">
                {/* Program breakdown */}
                <div className="ap-card">
                    <p className="ap-card-title">By Programme</p>
                    {Object.keys(programs).length === 0 ? (
                        <p className="ap-table-muted">No data yet.</p>
                    ) : (
                        <div className="adash-bars">
                            {Object.entries(programs)
                                .sort(([, a], [, b]) => b - a)
                                .map(([name, count]) => (
                                    <div key={name} className="adash-bar-row">
                                        <span className="adash-bar-label" title={name}>{name}</span>
                                        <div className="adash-bar-track">
                                            <div
                                                className="adash-bar-fill"
                                                style={{ width: `${(count / maxProgCount) * 100}%` }}
                                            />
                                        </div>
                                        <span className="adash-bar-count">{count}</span>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Status breakdown */}
                <div className="ap-card">
                    <p className="ap-card-title">Status Breakdown</p>
                    {Object.keys(counts).length === 0 ? (
                        <p className="ap-table-muted">No data yet.</p>
                    ) : (
                        <div className="adash-status-list">
                            {['new', 'reviewing', 'approved', 'rejected', 'completed'].map((s) => (
                                counts[s] ? (
                                    <div key={s} className="adash-status-row">
                                        <span className={`ap-badge ap-badge-${s}`}>{STATUS_LABEL[s]}</span>
                                        <span className="adash-status-count">{counts[s]}</span>
                                        <div className="adash-status-bar-track">
                                            <div
                                                className={`adash-status-bar-fill adash-bar-${s}`}
                                                style={{ width: `${(counts[s] / total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent applications */}
            <div className="ap-card" style={{ marginTop: '1.25rem' }}>
                <div className="adash-card-hdr">
                    <p className="ap-card-title" style={{ margin: 0 }}>Recent Applications</p>
                    <Link to="/admin/applications" className="adash-view-all">View all &rarr;</Link>
                </div>
                {recent.length === 0 ? (
                    <div className="ap-empty">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                        <strong>No applications yet</strong>
                    </div>
                ) : (
                    <div className="ap-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>Programme</th>
                                    <th>Mode</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((app, i) => (
                                    <tr key={i}>
                                        <td className="ap-table-name">{app.program_option || '—'}</td>
                                        <td className="ap-table-muted">{app.mode_of_learning || '—'}</td>
                                        <td><span className={`ap-badge ap-badge-${app.status}`}>{STATUS_LABEL[app.status] || app.status}</span></td>
                                        <td className="ap-table-muted">{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
