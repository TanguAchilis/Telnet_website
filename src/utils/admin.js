import { supabase, hasSupabaseConfig } from './supabase'

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export async function signInAdmin(email, password) {
    if (!hasSupabaseConfig || !supabase) {
        throw new Error('Supabase is not configured.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    if (data.user?.app_metadata?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error("This account exists, but it has not been promoted to admin yet. Run SELECT public.promote_to_admin('your-email@example.com'); in the Supabase SQL editor, then sign in again.")
    }

    return data.session
}

export async function signOutAdmin() {
    if (!supabase) return
    await supabase.auth.signOut()
}

export async function getAdminSession() {
    if (!hasSupabaseConfig || !supabase) return null
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.app_metadata?.role !== 'admin') return null
    return session
}

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export async function fetchApplications({ page = 0, pageSize = 25, search = '', status = '' } = {}) {
    let query = supabase
        .from('internship_applications')
        .select(
            'id, full_name, email, phone, program_option, mode_of_learning, fee_structure, status, submitted_at',
            { count: 'exact' }
        )
        .order('submitted_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }
    if (status) {
        query = query.eq('status', status)
    }

    return query
}

export async function fetchApplication(id) {
    return supabase
        .from('internship_applications')
        .select('*')
        .eq('id', id)
        .single()
}

export async function updateApplication(id, updates) {
    return supabase
        .from('internship_applications')
        .update(updates)
        .eq('id', id)
}

export async function fetchApplicationStats() {
    const { data, error } = await supabase
        .from('internship_applications')
        .select('id, full_name, status, program_option, mode_of_learning, submitted_at')
    if (error) throw error
    return data
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function fetchSetting(key) {
    const { data, error } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', key)
        .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.value ?? null
}

export async function saveSetting(key, value) {
    const { data: { user } } = await supabase.auth.getUser()
    return supabase
        .from('admin_settings')
        .upsert({ key, value, updated_at: new Date().toISOString(), updated_by: user?.id })
}

// ---------------------------------------------------------------------------
// Admin users
// ---------------------------------------------------------------------------

export async function fetchAdminProfiles() {
    return supabase
        .from('admin_profiles')
        .select('id, email, full_name, phone, created_at, updated_at')
        .order('created_at', { ascending: true })
}

export async function fetchCurrentAdminProfile() {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error('Not authenticated.')

    const { data, error } = await supabase
        .from('admin_profiles')
        .select('id, email, full_name, phone, created_at, updated_at')
        .eq('id', user.id)
        .maybeSingle()

    if (error) throw error

    return data ?? {
        id: user.id,
        email: user.email ?? '',
        full_name: '',
        phone: '',
        created_at: null,
        updated_at: null,
    }
}

export async function saveCurrentAdminProfile(updates) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error('Not authenticated.')

    return supabase
        .from('admin_profiles')
        .upsert({
            id: user.id,
            email: user.email ?? '',
            full_name: updates.full_name?.trim() || null,
            phone: updates.phone?.trim() || null,
            updated_at: new Date().toISOString(),
        })
        .select('id, email, full_name, phone, created_at, updated_at')
        .single()
}

export async function createAdminUser(email, password) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated.')

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin-user`
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email, password }),
    })

    const result = await res.json()
    if (!res.ok) throw new Error(result.error || 'Failed to create admin user.')
    return result.user
}
