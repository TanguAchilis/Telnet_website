import { useCallback, useEffect, useState } from 'react'
import {
    fetchShopCategories,
    fetchAllShopProducts,
    createRow,
    updateRow,
    deleteRow,
    formatPrice,
} from '../../utils/content'
import Modal from '../../components/admin/Modal'
import ImageUpload from '../../components/admin/ImageUpload'
import MultiImageInput from '../../components/admin/MultiImageInput'
import './admin.css'
import './AdminCms.css'

function slugify(text) {
    return (text || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

const emptyCategory = { name: '', slug: '', description: '', image_url: '', is_active: true, sort_order: 0 }
const emptyProduct = {
    name: '', category_id: '', price: '', price_note: '', brand: '', condition: '',
    description: '', image_url: '', images: [], in_stock: true, featured: false, sort_order: 0,
}

export default function AdminShop() {
    const [categories, setCategories] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [catModal, setCatModal] = useState(null) // category being edited, or null
    const [prodModal, setProdModal] = useState(null)
    const [saving, setSaving] = useState(false)
    const [modalError, setModalError] = useState('')
    const [filter, setFilter] = useState('')

    const load = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const [cats, prods] = await Promise.all([
                fetchShopCategories({ activeOnly: false }),
                fetchAllShopProducts(),
            ])
            setCategories(cats)
            setProducts(prods)
        } catch (e) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { load() }, [load])

    // ---- Category CRUD ----
    const saveCategory = async () => {
        setSaving(true)
        setModalError('')
        try {
            const payload = {
                name: catModal.name.trim(),
                slug: (catModal.slug || slugify(catModal.name)).trim(),
                description: catModal.description?.trim() || null,
                image_url: catModal.image_url || null,
                is_active: catModal.is_active,
                sort_order: Number(catModal.sort_order) || 0,
            }
            if (!payload.name || !payload.slug) throw new Error('Name is required.')
            const { error: err } = catModal.id
                ? await updateRow('shop_categories', catModal.id, payload)
                : await createRow('shop_categories', payload)
            if (err) throw err
            setCatModal(null)
            await load()
        } catch (e) {
            setModalError(e.message)
        } finally {
            setSaving(false)
        }
    }

    const removeCategory = async (cat) => {
        if (!window.confirm(`Delete category "${cat.name}"? Products in it will remain but become uncategorised.`)) return
        const { error: err } = await deleteRow('shop_categories', cat.id)
        if (err) { setError(err.message); return }
        await load()
    }

    // ---- Product CRUD ----
    const saveProduct = async () => {
        setSaving(true)
        setModalError('')
        try {
            const payload = {
                name: prodModal.name.trim(),
                slug: slugify(prodModal.name),
                category_id: prodModal.category_id || null,
                price: prodModal.price === '' || prodModal.price === null ? null : Number(prodModal.price),
                price_note: prodModal.price_note?.trim() || null,
                brand: prodModal.brand?.trim() || null,
                condition: prodModal.condition?.trim() || null,
                description: prodModal.description?.trim() || null,
                image_url: prodModal.image_url || null,
                images: Array.isArray(prodModal.images) ? prodModal.images.filter(Boolean) : [],
                in_stock: prodModal.in_stock,
                featured: prodModal.featured,
                sort_order: Number(prodModal.sort_order) || 0,
            }
            if (!payload.name) throw new Error('Product name is required.')
            const { error: err } = prodModal.id
                ? await updateRow('shop_products', prodModal.id, payload)
                : await createRow('shop_products', payload)
            if (err) throw err
            setProdModal(null)
            await load()
        } catch (e) {
            setModalError(e.message)
        } finally {
            setSaving(false)
        }
    }

    const removeProduct = async (prod) => {
        if (!window.confirm(`Delete product "${prod.name}"?`)) return
        const { error: err } = await deleteRow('shop_products', prod.id)
        if (err) { setError(err.message); return }
        await load()
    }

    const catName = (id) => categories.find((c) => c.id === id)?.name || '—'
    const shownProducts = filter ? products.filter((p) => p.category_id === filter) : products

    if (loading) {
        return <div className="ap-loading"><span className="ap-spinner" />Loading shop…</div>
    }

    return (
        <div className="ap-page ap-page-wide">
            <div className="ap-page-header">
                <h2 className="ap-page-title">Shop</h2>
                <p className="ap-page-subtitle">Manage product categories and the real items shown in your online shop.</p>
            </div>

            {error && <div className="ap-alert ap-alert-error">{error}</div>}

            {/* Categories */}
            <div className="ap-card acms-card">
                <div className="acms-card-hdr">
                    <p className="ap-card-title" style={{ margin: 0 }}>Categories</p>
                    <button className="ap-btn ap-btn-primary ap-btn-sm" onClick={() => { setModalError(''); setCatModal({ ...emptyCategory, sort_order: categories.length + 1 }) }}>
                        + Add Category
                    </button>
                </div>
                {categories.length === 0 ? (
                    <p className="ap-table-muted">No categories yet. Add one to get started.</p>
                ) : (
                    <div className="acms-tile-grid">
                        {categories.map((cat) => (
                            <div key={cat.id} className="acms-tile">
                                <div className="acms-tile-media">
                                    {cat.image_url ? <img src={cat.image_url} alt="" /> : <span>🛍️</span>}
                                    {!cat.is_active && <span className="acms-tile-flag">Hidden</span>}
                                </div>
                                <div className="acms-tile-body">
                                    <strong>{cat.name}</strong>
                                    <span className="acms-tile-sub">{products.filter((p) => p.category_id === cat.id).length} products</span>
                                </div>
                                <div className="acms-tile-actions">
                                    <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => { setModalError(''); setCatModal(cat) }}>Edit</button>
                                    <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => removeCategory(cat)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Products */}
            <div className="ap-card acms-card">
                <div className="acms-card-hdr">
                    <p className="ap-card-title" style={{ margin: 0 }}>Products</p>
                    <div className="acms-hdr-actions">
                        <select className="ap-select ap-select-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="">All categories</option>
                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button
                            className="ap-btn ap-btn-primary ap-btn-sm"
                            onClick={() => { setModalError(''); setProdModal({ ...emptyProduct, category_id: filter || categories[0]?.id || '' }) }}
                            disabled={categories.length === 0}
                        >
                            + Add Product
                        </button>
                    </div>
                </div>

                {shownProducts.length === 0 ? (
                    <div className="ap-empty">
                        <strong>No products yet</strong>
                        <p>{categories.length === 0 ? 'Add a category first, then add products.' : 'Click "Add Product" to list a real item.'}</p>
                    </div>
                ) : (
                    <div className="ap-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {shownProducts.map((p) => (
                                    <tr key={p.id}>
                                        <td>
                                            <div className="acms-row-item">
                                                <div className="acms-row-thumb">
                                                    {p.image_url ? <img src={p.image_url} alt="" /> : <span>🖼️</span>}
                                                </div>
                                                <div>
                                                    <span className="ap-table-name">{p.name}</span>
                                                    {p.brand && <span className="acms-row-sub">{p.brand}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="ap-table-muted">{catName(p.category_id)}</td>
                                        <td>{formatPrice(p.price, p.price_note)}</td>
                                        <td>
                                            <span className={`ap-badge ${p.in_stock ? 'ap-badge-approved' : 'ap-badge-rejected'}`}>
                                                {p.in_stock ? 'In stock' : 'Out'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="acms-row-actions">
                                                <button className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => { setModalError(''); setProdModal({ ...p, price: p.price ?? '' }) }}>Edit</button>
                                                <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => removeProduct(p)}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Category modal */}
            <Modal
                open={!!catModal}
                title={catModal?.id ? 'Edit Category' : 'New Category'}
                onClose={() => setCatModal(null)}
                footer={
                    <>
                        <button className="ap-btn ap-btn-secondary" onClick={() => setCatModal(null)}>Cancel</button>
                        <button className="ap-btn ap-btn-primary" onClick={saveCategory} disabled={saving}>
                            {saving ? 'Saving…' : 'Save Category'}
                        </button>
                    </>
                }
            >
                {catModal && (
                    <div className="acms-form">
                        {modalError && <div className="ap-alert ap-alert-error">{modalError}</div>}
                        <div className="ap-form-group">
                            <label className="ap-label">Name</label>
                            <input className="ap-input" value={catModal.name}
                                onChange={(e) => setCatModal({ ...catModal, name: e.target.value, slug: catModal.id ? catModal.slug : slugify(e.target.value) })} />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Slug (URL)</label>
                            <input className="ap-input" value={catModal.slug} onChange={(e) => setCatModal({ ...catModal, slug: slugify(e.target.value) })} />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Description</label>
                            <textarea className="ap-textarea" rows={3} value={catModal.description || ''} onChange={(e) => setCatModal({ ...catModal, description: e.target.value })} />
                        </div>
                        <ImageUpload value={catModal.image_url} folder="shop" label="Category image (optional)"
                            onChange={(url) => setCatModal({ ...catModal, image_url: url })} />
                        <div className="acms-form-row">
                            <label className="acms-check">
                                <input type="checkbox" checked={catModal.is_active} onChange={(e) => setCatModal({ ...catModal, is_active: e.target.checked })} />
                                Visible on site
                            </label>
                            <div className="ap-form-group acms-sort">
                                <label className="ap-label">Order</label>
                                <input className="ap-input" type="number" value={catModal.sort_order} onChange={(e) => setCatModal({ ...catModal, sort_order: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Product modal */}
            <Modal
                open={!!prodModal}
                title={prodModal?.id ? 'Edit Product' : 'New Product'}
                onClose={() => setProdModal(null)}
                footer={
                    <>
                        <button className="ap-btn ap-btn-secondary" onClick={() => setProdModal(null)}>Cancel</button>
                        <button className="ap-btn ap-btn-primary" onClick={saveProduct} disabled={saving}>
                            {saving ? 'Saving…' : 'Save Product'}
                        </button>
                    </>
                }
            >
                {prodModal && (
                    <div className="acms-form">
                        {modalError && <div className="ap-alert ap-alert-error">{modalError}</div>}
                        <ImageUpload value={prodModal.image_url} folder="shop" label="Main product image"
                            onChange={(url) => setProdModal({ ...prodModal, image_url: url })} />
                        <MultiImageInput images={prodModal.images} folder="shop" label="More photos (shown as thumbnails on the product page)"
                            onChange={(imgs) => setProdModal({ ...prodModal, images: imgs })} />
                        <div className="ap-form-group">
                            <label className="ap-label">Name</label>
                            <input className="ap-input" value={prodModal.name} onChange={(e) => setProdModal({ ...prodModal, name: e.target.value })} placeholder="e.g. HP EliteBook 840 G5" />
                        </div>
                        <div className="acms-form-row">
                            <div className="ap-form-group">
                                <label className="ap-label">Category</label>
                                <select className="ap-input" value={prodModal.category_id || ''} onChange={(e) => setProdModal({ ...prodModal, category_id: e.target.value })}>
                                    <option value="">Uncategorised</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Brand</label>
                                <input className="ap-input" value={prodModal.brand || ''} onChange={(e) => setProdModal({ ...prodModal, brand: e.target.value })} placeholder="HP, Dell…" />
                            </div>
                        </div>
                        <div className="acms-form-row">
                            <div className="ap-form-group">
                                <label className="ap-label">Price (FCFA)</label>
                                <input className="ap-input" type="number" value={prodModal.price} onChange={(e) => setProdModal({ ...prodModal, price: e.target.value })} placeholder="85000" />
                            </div>
                            <div className="ap-form-group">
                                <label className="ap-label">Price note (if no exact price)</label>
                                <input className="ap-input" value={prodModal.price_note || ''} onChange={(e) => setProdModal({ ...prodModal, price_note: e.target.value })} placeholder="From 80,000 FCFA" />
                            </div>
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Condition</label>
                            <input className="ap-input" value={prodModal.condition || ''} onChange={(e) => setProdModal({ ...prodModal, condition: e.target.value })} placeholder="Brand New / Refurbished" />
                        </div>
                        <div className="ap-form-group">
                            <label className="ap-label">Description</label>
                            <textarea className="ap-textarea" rows={4} value={prodModal.description || ''} onChange={(e) => setProdModal({ ...prodModal, description: e.target.value })} placeholder="Specs, condition, what's included…" />
                        </div>
                        <div className="acms-form-row">
                            <label className="acms-check">
                                <input type="checkbox" checked={prodModal.in_stock} onChange={(e) => setProdModal({ ...prodModal, in_stock: e.target.checked })} />
                                In stock
                            </label>
                            <label className="acms-check">
                                <input type="checkbox" checked={prodModal.featured} onChange={(e) => setProdModal({ ...prodModal, featured: e.target.checked })} />
                                Featured
                            </label>
                            <div className="ap-form-group acms-sort">
                                <label className="ap-label">Order</label>
                                <input className="ap-input" type="number" value={prodModal.sort_order} onChange={(e) => setProdModal({ ...prodModal, sort_order: e.target.value })} />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}
