import { useCallback, useEffect, useState } from 'react'
import { fetchGalleryCategories, fetchGalleryImages, createRow, updateRow, deleteRow } from '../../utils/content'
import { deleteImageByUrl } from '../../utils/storage'
import Modal from '../../components/admin/Modal'
import ImageUpload from '../../components/admin/ImageUpload'
import './admin.css'
import './AdminCms.css'

function slugify(text) {
    return (text || '').toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

const emptyImage = { category_id: '', caption: '', image_url: '', sort_order: 0 }

export default function AdminGallery() {
    const [categories, setCategories] = useState([])
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filter, setFilter] = useState('')

    const [catModal, setCatModal] = useState(null)
    const [imgModal, setImgModal] = useState(null)
    const [saving, setSaving] = useState(false)
    const [modalError, setModalError] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [cats, imgs] = await Promise.all([fetchGalleryCategories(), fetchGalleryImages()])
            setCategories(cats)
            setImages(imgs)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    const saveCategory = async () => {
        setSaving(true); setModalError('')
        try {
            const payload = {
                name: catModal.name.trim(),
                slug: (catModal.slug || slugify(catModal.name)).trim(),
                sort_order: Number(catModal.sort_order) || 0,
            }
            if (!payload.name) throw new Error('Name is required.')
            const { error: err } = catModal.id
                ? await updateRow('gallery_categories', catModal.id, payload)
                : await createRow('gallery_categories', payload)
            if (err) throw err
            setCatModal(null)
            await load()
        } catch (e) { setModalError(e.message) } finally { setSaving(false) }
    }

    const removeCategory = async (cat) => {
        if (!window.confirm(`Delete category "${cat.name}"? Its images will remain but become uncategorised.`)) return
        const { error: err } = await deleteRow('gallery_categories', cat.id)
        if (err) { setError(err.message); return }
        await load()
    }

    const saveImage = async () => {
        setSaving(true); setModalError('')
        try {
            if (!imgModal.image_url) throw new Error('Please upload an image first.')
            const payload = {
                category_id: imgModal.category_id || null,
                caption: imgModal.caption?.trim() || null,
                image_url: imgModal.image_url,
                sort_order: Number(imgModal.sort_order) || 0,
            }
            const { error: err } = imgModal.id
                ? await updateRow('gallery_images', imgModal.id, payload)
                : await createRow('gallery_images', payload)
            if (err) throw err
            setImgModal(null)
            await load()
        } catch (e) { setModalError(e.message) } finally { setSaving(false) }
    }

    const removeImage = async (img) => {
        if (!window.confirm('Delete this image?')) return
        const { error: err } = await deleteRow('gallery_images', img.id)
        if (err) { setError(err.message); return }
        deleteImageByUrl(img.image_url).catch(() => {})
        await load()
    }

    const shownImages = filter ? images.filter((i) => i.category_id === filter) : images

    if (loading) {
        return <div className="ap-loading"><span className="ap-spinner" />Loading gallery…</div>
    }

    return (
        <div className="ap-page ap-page-wide">
            <div className="ap-page-header">
                <h2 className="ap-page-title">Gallery</h2>
                <p className="ap-page-subtitle">Add or remove gallery photos and manage the categories they appear under.</p>
            </div>

            {error && <div className="ap-alert ap-alert-error">{error}</div>}

            {/* Categories */}
            <div className="ap-card acms-card">
                <div className="acms-card-hdr">
                    <p className="ap-card-title" style={{ margin: 0 }}>Categories</p>
                    <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={() => { setModalError(''); setCatModal({ name: '', slug: '', sort_order: categories.length + 1 }) }}>+ Add Category</button>
                </div>
                <div className="acms-chip-list">
                    {categories.map((cat) => (
                        <div key={cat.id} className="acms-chip">
                            <span>{cat.name}</span>
                            <span className="acms-chip-count">{images.filter((i) => i.category_id === cat.id).length}</span>
                            <button className="acms-chip-edit" onClick={() => { setModalError(''); setCatModal(cat) }} title="Edit">✎</button>
                            <button className="acms-chip-del" onClick={() => removeCategory(cat)} title="Delete">✕</button>
                        </div>
                    ))}
                    {categories.length === 0 && <p className="ap-table-muted">No categories yet.</p>}
                </div>
            </div>

            {/* Images */}
            <div className="ap-card acms-card">
                <div className="acms-card-hdr">
                    <p className="ap-card-title" style={{ margin: 0 }}>Images ({images.length})</p>
                    <div className="acms-hdr-actions">
                        <select className="ap-select ap-select-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="">All categories</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={() => { setModalError(''); setImgModal({ ...emptyImage, category_id: filter || categories[0]?.id || '' }) }}>+ Add Image</button>
                    </div>
                </div>

                {shownImages.length === 0 ? (
                    <div className="ap-empty"><strong>No images{filter ? ' in this category' : ''} yet</strong><p>Click "Add Image" to upload one.</p></div>
                ) : (
                    <div className="acms-gallery-grid">
                        {shownImages.map((img) => (
                            <div key={img.id} className="acms-gallery-item">
                                <img src={img.image_url} alt={img.caption || ''} loading="lazy" />
                                <div className="acms-gallery-overlay">
                                    <span className="acms-gallery-cap">{img.caption || 'Untitled'}</span>
                                    <span className="acms-gallery-cat">{img.category?.name || 'Uncategorised'}</span>
                                    <div className="acms-gallery-btns">
                                        <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => { setModalError(''); setImgModal(img) }}>Edit</button>
                                        <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => removeImage(img)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Category modal */}
            <Modal
                open={!!catModal}
                title={catModal?.id ? 'Edit Category' : 'New Category'}
                onClose={() => setCatModal(null)}
                footer={<>
                    <button className="ap-btn ap-btn-secondary" onClick={() => setCatModal(null)}>Cancel</button>
                    <button className="ap-btn ap-btn-primary" onClick={saveCategory} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </>}
            >
                {catModal && (
                    <div className="acms-form">
                        {modalError && <div className="ap-alert ap-alert-error">{modalError}</div>}
                        <div className="ap-form-group">
                            <label className="ap-label">Name</label>
                            <input className="ap-input" value={catModal.name} onChange={(e) => setCatModal({ ...catModal, name: e.target.value, slug: catModal.id ? catModal.slug : slugify(e.target.value) })} />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Slug</label>
                            <input className="ap-input" value={catModal.slug} onChange={(e) => setCatModal({ ...catModal, slug: slugify(e.target.value) })} />
                        </div>
                        <div className="ap-form-group acms-sort">
                            <label className="ap-label">Order</label>
                            <input className="ap-input" type="number" value={catModal.sort_order} onChange={(e) => setCatModal({ ...catModal, sort_order: e.target.value })} />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Image modal */}
            <Modal
                open={!!imgModal}
                title={imgModal?.id ? 'Edit Image' : 'Add Image'}
                onClose={() => setImgModal(null)}
                footer={<>
                    <button className="ap-btn ap-btn-secondary" onClick={() => setImgModal(null)}>Cancel</button>
                    <button className="ap-btn ap-btn-primary" onClick={saveImage} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                </>}
            >
                {imgModal && (
                    <div className="acms-form">
                        {modalError && <div className="ap-alert ap-alert-error">{modalError}</div>}
                        <ImageUpload value={imgModal.image_url} folder="gallery" label="Image"
                            onChange={(url) => setImgModal({ ...imgModal, image_url: url })} />
                        <div className="ap-form-group">
                            <label className="ap-label">Caption</label>
                            <input className="ap-input" value={imgModal.caption || ''} onChange={(e) => setImgModal({ ...imgModal, caption: e.target.value })} placeholder="e.g. Training session" />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Category</label>
                            <select className="ap-input" value={imgModal.category_id || ''} onChange={(e) => setImgModal({ ...imgModal, category_id: e.target.value })}>
                                <option value="">Uncategorised</option>
                                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
