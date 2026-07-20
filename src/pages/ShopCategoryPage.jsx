import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchShopCategoryBySlug, fetchShopProductsByCategory, formatPrice } from '../utils/content'
import { getWhatsAppUrl } from '../utils/whatsapp'
import './PageBanner.css'
import './ShopFlow.css'

function slugToTitle(slug = '') {
    return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function ShopCategoryPage() {
    const { categorySlug } = useParams()
    const [category, setCategory] = useState(null)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on category change
        setLoading(true)
        setProducts([])
        fetchShopCategoryBySlug(categorySlug)
            .then(async (cat) => {
                if (!active) return
                setCategory(cat)
                if (cat) {
                    const prods = await fetchShopProductsByCategory(cat.id)
                    if (active) setProducts(prods)
                }
            })
            .catch(() => { /* show empty state */ })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [categorySlug])

    const title = category?.name || slugToTitle(categorySlug)
    const waMessage = `Hello Telnet Cameroon! I'm interested in your ${title} — could you share what's currently available and the prices?`

    return (
        <>
            <div className="page-banner">
                <div className="container">
                    <nav className="shopf-breadcrumb">
                        <Link to="/shop">Shop</Link>
                        <span aria-hidden="true">/</span>
                        <span>{title}</span>
                    </nav>
                    <h1 className="page-banner-title">{title}</h1>
                    {category?.description && <p className="page-banner-desc">{category.description}</p>}
                </div>
            </div>

            <section className="section shopf-section">
                <div className="container">
                    {loading ? (
                        <div className="shopf-loading"><span className="shopf-spinner" />Loading products…</div>
                    ) : products.length > 0 ? (
                        <div className="shopf-product-grid">
                            {products.map((p) => (
                                <Link key={p.id} to={`/shop/${categorySlug}/${p.id}`} className="shopf-product-card animate-on-scroll">
                                    <div className="shopf-product-media">
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.name} loading="lazy" />
                                        ) : (
                                            <span className="shopf-product-placeholder">🖼️</span>
                                        )}
                                        {!p.in_stock && <span className="shopf-badge shopf-badge-out">Out of stock</span>}
                                        {p.condition && <span className="shopf-badge shopf-badge-cond">{p.condition}</span>}
                                    </div>
                                    <div className="shopf-product-body">
                                        {p.brand && <span className="shopf-product-brand">{p.brand}</span>}
                                        <h3 className="shopf-product-name">{p.name}</h3>
                                        <div className="shopf-product-foot">
                                            <span className="shopf-product-price">{formatPrice(p.price, p.price_note)}</span>
                                            <span className="shopf-product-view">View →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="shopf-empty">
                            <span className="shopf-empty-icon">🛍️</span>
                            <h3>No items listed here yet</h3>
                            <p>We're updating this category. Message us on WhatsApp and we'll tell you exactly what's in stock.</p>
                            <a href={getWhatsAppUrl(waMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                Ask on WhatsApp
                            </a>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
