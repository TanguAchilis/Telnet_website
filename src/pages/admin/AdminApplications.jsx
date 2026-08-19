import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchApplications } from '../../utils/admin'
import './admin.css'
import { Icon } from '../../icons'

const PAGE_SIZE = 25

const STATUS_OPTIONS = [
    { value: '', label: 'All statuses' },
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

export default function AdminApplications() {
    const navigate = useNavigate()
    const [apps, setApps] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(0)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const load = useCallback(async (pg, q, st) => {
        setLoading(true)
        setError('')
        try {
            const { data, count, error: err } = await fetchApplications({
                page: pg,
                pageSize: PAGE_SIZE,
                search: q,
                status: st,
            })
            if (err) throw err
            setApps(data ?? [])
            setTotal(count ?? 0)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load(page, search, status)
    }, [load, page, search, status])

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => {
            setPage(0)
            setSearch(searchInput)
        }, 350)
        return () => clearTimeout(t)
    }, [searchInput])

    const handleStatusChange = (e) => {
        setStatus(e.target.value)
        setPage(0)
    }

    const totalPages = Math.ceil(total / PAGE_SIZE)
    const from = total === 0 ? 0 : page * PAGE_SIZE + 1
    const to = Math.min((page + 1) * PAGE_SIZE, total)

    return (
        <div className="ap-page">
            <div className="ap-page-header">
                <h2 className="ap-page-title">Applications</h2>
                <p className="ap-page-subtitle">
                    {total > 0 ? `${total} total application${total !== 1 ? 's' : ''}` : 'Manage internship applications.'}
                </p>
            </div>

            {error && <div className="ap-alert ap-alert-error">{error}</div>}

            <div className="ap-toolbar">
                <div className="ap-search">
                    <Icon name="search" size={15} weight={2.2} />
                    <input
                        type="search"
                        placeholder="Search name, email or phone…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </div>
                <select className="ap-select" value={status} onChange={handleStatusChange}>
                    {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            </div>

            <div className="ap-table-wrap">
                {loading ? (
                    <div className="ap-loading"><span className="ap-spinner" />Loading…</div>
                ) : apps.length === 0 ? (
                    <div className="ap-empty">
                        <Icon name="file-text" size={36} />
                        <strong>No applications found</strong>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                ) : (
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Programme</th>
                                <th>Mode</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map((app) => (
                                <tr
                                    key={app.id}
                                    className="ap-table-link"
                                    onClick={() => navigate(`/admin/applications/${app.id}`)}
                                >
                                    <td className="ap-table-name">{app.full_name || '-'}</td>
                                    <td className="ap-table-muted">{app.email || '-'}</td>
                                    <td>{app.program_option || '-'}</td>
                                    <td className="ap-table-muted">{app.mode_of_learning || '-'}</td>
                                    <td>
                                        <span className={`ap-badge ap-badge-${app.status}`}>
                                            {STATUS_LABEL[app.status] || app.status}
                                        </span>
                                    </td>
                                    <td className="ap-table-muted">
                                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td>
                                        <button
                                            className="ap-btn ap-btn-secondary ap-btn-sm"
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/applications/${app.id}`) }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {!loading && total > PAGE_SIZE && (
                    <div className="ap-pagination">
                        <span>{from}–{to} of {total}</span>
                        <div className="ap-pagination-btns">
                            <button
                                className="ap-btn-page"
                                onClick={() => setPage((p) => p - 1)}
                                disabled={page === 0}
                            >
                                &larr; Prev
                            </button>
                            <button
                                className="ap-btn-page"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page >= totalPages - 1}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
