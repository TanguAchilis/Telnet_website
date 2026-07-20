import { supabase } from './supabase'

const BUCKET = 'site-images'

/**
 * Upload an image file to the public storage bucket and return its public URL.
 * @param {File} file
 * @param {string} folder - subfolder within the bucket (e.g. 'shop', 'gallery', 'team')
 */
export async function uploadImage(file, folder = 'misc') {
    if (!supabase) throw new Error('Image storage is not configured.')
    if (!file) throw new Error('No file selected.')

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || undefined,
    })
    if (error) throw error

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
}

/**
 * Best-effort delete of a previously uploaded image by its public URL.
 * No-op for seeded /public asset paths (not in the bucket).
 */
export async function deleteImageByUrl(url) {
    if (!supabase || !url) return
    const marker = `/${BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx === -1) return
    const path = decodeURIComponent(url.slice(idx + marker.length))
    await supabase.storage.from(BUCKET).remove([path])
}
