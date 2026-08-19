import { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { supabase, hasSupabaseConfig } from '../../utils/supabase'
import { useSeo } from '../../utils/useSeo'

export default function AdminGuard() {
    const [status, setStatus] = useState('loading')

    // Admin pages sit outside PublicLayout, so nothing else sets their head.
    useSeo({
        title: 'Admin | Telnet Cameroon',
        description: 'Administration area.',
        noindex: true,
    })

    useEffect(() => {
        if (!hasSupabaseConfig || !supabase) {
            setStatus('unauthed')
            return
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setStatus(session?.user?.app_metadata?.role === 'admin' ? 'authed' : 'unauthed')
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setStatus(session?.user?.app_metadata?.role === 'admin' ? 'authed' : 'unauthed')
        })

        return () => subscription.unsubscribe()
    }, [])

    if (status === 'loading') {
        return (
            <div className="admin-guard-loading">
                <span className="admin-guard-spinner" />
            </div>
        )
    }

    if (status === 'unauthed') {
        return <Navigate to="/admin/login" replace />
    }

    return <Outlet />
}
