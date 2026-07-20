import { supabase } from './supabase'
import { fetchSetting } from './admin'

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------

async function selectAll(table, { columns = '*', order = 'sort_order' } = {}) {
    const { data, error } = await supabase
        .from(table)
        .select(columns)
        .order(order, { ascending: true })
    if (error) throw error
    return data ?? []
}

export async function createRow(table, row) {
    return supabase.from(table).insert(row).select().single()
}

export async function updateRow(table, id, updates) {
    return supabase.from(table).update(updates).eq('id', id).select().single()
}

export async function deleteRow(table, id) {
    return supabase.from(table).delete().eq('id', id)
}

// ---------------------------------------------------------------------------
// Shop (public)
// ---------------------------------------------------------------------------

export async function fetchShopCategories({ activeOnly = true } = {}) {
    let query = supabase.from('shop_categories').select('*').order('sort_order', { ascending: true })
    if (activeOnly) query = query.eq('is_active', true)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
}

export async function fetchShopCategoryBySlug(slug) {
    const { data, error } = await supabase
        .from('shop_categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
    if (error) throw error
    return data
}

export async function fetchShopProductsByCategory(categoryId) {
    const { data, error } = await supabase
        .from('shop_products')
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true })
    if (error) throw error
    return data ?? []
}

export async function fetchShopProduct(id) {
    const { data, error } = await supabase
        .from('shop_products')
        .select('*, category:shop_categories(name, slug)')
        .eq('id', id)
        .maybeSingle()
    if (error) throw error
    return data
}

export async function fetchAllShopProducts() {
    const { data, error } = await supabase
        .from('shop_products')
        .select('*, category:shop_categories(name, slug)')
        .order('sort_order', { ascending: true })
    if (error) throw error
    return data ?? []
}

// ---------------------------------------------------------------------------
// Gallery (public)
// ---------------------------------------------------------------------------

export async function fetchGalleryCategories() {
    return selectAll('gallery_categories')
}

export async function fetchGalleryImages() {
    const { data, error } = await supabase
        .from('gallery_images')
        .select('*, category:gallery_categories(name, slug)')
        .order('sort_order', { ascending: true })
    if (error) throw error
    return data ?? []
}

// ---------------------------------------------------------------------------
// Services / Team (public)
// ---------------------------------------------------------------------------

export async function fetchServices({ activeOnly = true } = {}) {
    let query = supabase.from('services').select('*').order('sort_order', { ascending: true })
    if (activeOnly) query = query.eq('is_active', true)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
}

export async function fetchTeamMembers() {
    return selectAll('team_members')
}

// ---------------------------------------------------------------------------
// Site settings (public reads)
// ---------------------------------------------------------------------------

export async function fetchSiteStats() {
    return fetchSetting('site_stats')
}

export async function fetchContactInfo() {
    return fetchSetting('contact_info')
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export function formatPrice(price, priceNote) {
    if (price !== null && price !== undefined && price !== '') {
        return `${Number(price).toLocaleString()} FCFA`
    }
    if (priceNote) return priceNote
    return 'Contact for price'
}
