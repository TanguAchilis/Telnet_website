import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchShopProduct, formatPrice } from '../utils/content'
import { getWhatsAppUrl } from '../utils/whatsapp'
import './ShopFlow.css'

export default function ShopProductPage() {
    const { categorySlug, productId } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeImage, setActiveImage] = useState(null)

    useEffect(() => {
        let active = true
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on product change
        setLoading(true)
        fetchShopProduct(productId)
            .then((p) => {
                if (!active) return
                setProduct(p)
                setActiveImage(p?.image_url || (Array.isArray(p?.images) ? p.images[0] : null) || null)
            })
            .catch(() => { /* show not found */ })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [productId])

    if (loading) {
        return (
            <div className="section container">
                <div className="shopf-loading"><span className="shopf-spinner" />Loading…</div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="section container">
                <div className="shopf-empty">
                    <span className="shopf-empty-icon">🔍</span>
                    <h3>Product not found</h3>
                    <p>This item may no longer be available.</p>
                    <Link to={`/shop/${categorySlug}`} className="btn btn-primary">Back to category</Link>
                </div>
            </div>
        )
    }

    const priceText = formatPrice(product.price, product.price_note)
    const gallery = [product.image_url, ...(Array.isArray(product.images) ? product.images : [])].filter(Boolean)
    const uniqueGallery = [...new Set(gallery)]
    const catSlug = product.category?.slug || categorySlug
    const catName = product.category?.name || 'Shop'

    const waMessage = `Hello Telnet Cameroon! I'm interested in "${product.name}"`
        + (product.price != null ? ` priced at ${priceText}` : '')
        + ` from your shop. Is it still available?`

    return (
        <section className="section shopf-section">
            <div className="container">
                <nav className="shopf-breadcrumb shopf-breadcrumb-dark">
                    <Link to="/shop">Shop</Link>
                    <span aria-hidden="true">/</span>
                    <Link to={`/shop/${catSlug}`}>{catName}</Link>
                    <span aria-hidden="true">/</span>
                    <span>{product.name}</span>
                </nav>

                <div className="shopf-detail">
                    <div className="shopf-detail-media">
                        <div className="shopf-detail-main">
                            {activeImage ? (
                                <img src={activeImage} alt={product.name} />
                            ) : (
                                <span className="shopf-product-placeholder shopf-placeholder-lg">🖼️</span>
                            )}
                            {!product.in_stock && <span className="shopf-badge shopf-badge-out">Out of stock</span>}
                        </div>
                        {uniqueGallery.length > 1 && (
                            <div className="shopf-thumbs">
                                {uniqueGallery.map((img) => (
                                    <button
                                        key={img}
                                        type="button"
                                        className={`shopf-thumb${img === activeImage ? ' shopf-thumb-active' : ''}`}
                                        onClick={() => setActiveImage(img)}
                                    >
                                        <img src={img} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="shopf-detail-info">
                        {product.brand && <span className="shopf-detail-brand">{product.brand}</span>}
                        <h1 className="shopf-detail-name">{product.name}</h1>

                        <div className="shopf-detail-meta">
                            <span className="shopf-detail-price">{priceText}</span>
                            <span className={`shopf-stock${product.in_stock ? '' : ' shopf-stock-out'}`}>
                                {product.in_stock ? '● In stock' : '● Out of stock'}
                            </span>
                        </div>

                        {product.condition && (
                            <div className="shopf-detail-tags">
                                <span className="shopf-tag">{product.condition}</span>
                            </div>
                        )}

                        {product.description && (
                            <div className="shopf-detail-desc">
                                {product.description.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                            </div>
                        )}

                        <div className="shopf-detail-actions">
                            <a href={getWhatsAppUrl(waMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-primary shopf-wa-btn">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                Inquire on WhatsApp
                            </a>
                            <Link to={`/shop/${catSlug}`} className="btn btn-secondary">← More in {catName}</Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
