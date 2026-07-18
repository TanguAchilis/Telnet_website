import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInAdmin } from '../../utils/admin'
import './AdminLogin.css'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await signInAdmin(email, password)
            navigate('/admin/dashboard', { replace: true })
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="alog-root">
            <div className="alog-card">
                <div className="alog-header">
                    <img src="/Our team/logo.png" alt="Telnet" className="alog-logo" />
                    <h1 className="alog-title">Admin Portal</h1>
                    <p className="alog-subtitle">Telnet Cameroon — Admin Access</p>
                </div>

                {error && (
                    <div className="alog-error" role="alert">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="alog-form" noValidate>
                    <div className="alog-group">
                        <label htmlFor="al-email" className="alog-label">Email address</label>
                        <input
                            id="al-email"
                            type="email"
                            className="alog-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            placeholder="admin@example.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="alog-group">
                        <label htmlFor="al-password" className="alog-label">Password</label>
                        <input
                            id="al-password"
                            type="password"
                            className="alog-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="alog-submit" disabled={loading || !email || !password}>
                        {loading ? <span className="alog-spinner" /> : 'Sign In'}
                    </button>
                </form>

                <div className="alog-help-card">
                    <strong>First admin setup</strong>
                    <p>If the account signs in but still says it is not an admin, run this in the Supabase SQL editor:</p>
                    <code>SELECT public.promote_to_admin('your-email@example.com');</code>
                </div>

                <p className="alog-note">
                    Restricted access — authorised personnel only.
                </p>
            </div>
        </div>
    )
}
